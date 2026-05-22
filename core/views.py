import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Producto, Pedido 

def listar_productos(request):
    try:
        productos = Producto.objects.all()
        lista_final = []
        for p in productos:
            lista_final.append({
                "id": p.id,
                "nombre": p.nombre,
                "precio": float(p.precio),
                "descripcion": getattr(p, 'descripcion', 'Producto cafetería'),
                "categoria": p.categoria,
                "emoji": p.emoji,
                "stock": p.stock,
                "badges": getattr(p, 'badges', [])
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def crear_pedido(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nuevo_pedido = Pedido.objects.create(
                usuario=data.get('usuario'),
                total=data.get('total'),
                franja_horaria=data.get('franja_horaria'),
                items=data.get('items'),
                estado='pendiente'
            )
            return JsonResponse({"status": "ok", "id": nuevo_pedido.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

def listar_pedidos(request):
    try:
        pedidos = Pedido.objects.all().order_by('-fecha')
        lista_final = []
        for p in pedidos:
            lista_final.append({
                "id": str(p.id),
                "usuario": p.usuario,
                "total": float(p.total),
                "franja_horaria": p.franja_horaria,
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
            pedido.estado = data.get('estado', 'completado') 
            pedido.save()
            return JsonResponse({'status': 'ok', 'message': 'Pedido actualizado'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


def es_admin(request):
    """Verifica si el usuario actual es admin"""
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