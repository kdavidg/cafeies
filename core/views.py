import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Producto, Pedido, Usuario, FranjasHorarias

def listar_productos(request):
    try:
        productos = Producto.objects.all()
        lista_final = []
        for p in productos:
            lista_final.append({
                "id": p.id,
                "nombre": p.nombre,
                "precio": float(p.precio),
                "descripcion": p.descripcion,
                "categoria": p.categoria,
                "emoji": p.emoji,
                "stock": p.stock,
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def crear_pedido(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            items = data.get('items', {})
            email_usuario = data.get('usuario')
            franja_id = data.get('franja_horaria_id')
            
            usuario, created = Usuario.objects.get_or_create(
                email=email_usuario,
                defaults={'nombre': email_usuario.split('@')[0]}
            )
            
            franja = None
            if franja_id:
                franja = get_object_or_404(FranjasHorarias, pk=franja_id)
            
            for producto_id, cantidad in items.items():
                producto = get_object_or_404(Producto, pk=producto_id)
                if producto.stock < cantidad:
                    return JsonResponse({
                        "error": f"Stock insuficiente para {producto.nombre}"
                    }, status=400)
            
            nuevo_pedido = Pedido.objects.create(
                usuario=usuario,
                total=data.get('total'),
                franja_horaria=franja,
                items=items,
                estado='pendiente'
            )
            return JsonResponse({
                "status": "ok", 
                "id": nuevo_pedido.id,
                "codigo": nuevo_pedido.codigo
            }, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

def listar_pedidos(request):
    try:
        pedidos = Pedido.objects.all().order_by('-fecha')
        lista_final = []
        for p in pedidos:
            lista_final.append({
                "id": str(p.id),
                "usuario": p.usuario.email,
                "total": float(p.total),
                "franja_horaria": str(p.franja_horaria) if p.franja_horaria else None,
                "fecha": p.fecha.isoformat(),
                "items": p.items,
                "estado": p.estado,
                "codigo": p.codigo
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": "Error interno", "detalle": str(e)}, status=500)
    
@csrf_exempt
def gestionar_pedido(request, pk):
    pedido = get_object_or_404(Pedido, pk=pk)
    if request.method == 'POST' or request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            nuevo_estado = data.get('estado', 'completado')
            
            if nuevo_estado == 'completado' and pedido.estado != 'completado':
                items = pedido.items or {}
                for producto_id, cantidad in items.items():
                    producto = get_object_or_404(Producto, pk=producto_id)
                    producto.stock -= cantidad
                    producto.save()
            
            pedido.estado = nuevo_estado
            pedido.save()
            return JsonResponse({'status': 'ok', 'message': 'Pedido actualizado'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def es_admin(request):
    email = request.GET.get('email', '')
    admin_email = 'davidgonzaga140@gmail.com'
    es_administrador = email == admin_email
    return JsonResponse({'es_admin': es_administrador})

@csrf_exempt
def crear_producto(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nuevo_producto = Producto.objects.create(
                nombre=data.get('nombre'),
                precio=data.get('precio'),
                emoji=data.get('emoji', '☕'),
                categoria=data.get('categoria', 'bebidas'),
                descripcion=data.get('descripcion', ''),
                stock=data.get('stock', 0)
            )
            return JsonResponse({
                "id": nuevo_producto.id,
                "nombre": nuevo_producto.nombre,
                "precio": float(nuevo_producto.precio),
                "emoji": nuevo_producto.emoji,
                "categoria": nuevo_producto.categoria,
                "descripcion": nuevo_producto.descripcion,
                "stock": nuevo_producto.stock
            }, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def editar_producto(request, pk):
    producto = get_object_or_404(Producto, pk=pk)
    if request.method == 'POST' or request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            producto.nombre = data.get('nombre', producto.nombre)
            producto.precio = data.get('precio', producto.precio)
            producto.emoji = data.get('emoji', producto.emoji)
            producto.categoria = data.get('categoria', producto.categoria)
            producto.descripcion = data.get('descripcion', producto.descripcion)
            producto.stock = data.get('stock', producto.stock)
            producto.save()
            return JsonResponse({'status': 'ok', 'message': 'Producto actualizado'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def borrar_producto(request, pk):
    producto = get_object_or_404(Producto, pk=pk)
    if request.method == 'POST' or request.method == 'DELETE':
        try:
            producto.delete()
            return JsonResponse({'status': 'ok', 'message': 'Producto eliminado'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

import stripe
import os

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

@csrf_exempt
def crear_pago_stripe(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = int(float(data.get('total', 0)) * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='eur',
                metadata={
                    'usuario': data.get('usuario'),
                    'items': json.dumps(data.get('items', {})),
                    'franja_horaria': data.get('franja_horaria')
                }
            )
            
            return JsonResponse({
                'clientSecret': intent.client_secret
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def listar_franjas_horarias(request):
    try:
        franjas = FranjasHorarias.objects.filter(activa=True).order_by('hora_inicio')
        lista_final = []
        for f in franjas:
            lista_final.append({
                "id": f.id,
                "hora_inicio": str(f.hora_inicio),
                "hora_fin": str(f.hora_fin),
                "activa": f.activa,
                "max_pedidos": f.max_pedidos
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)