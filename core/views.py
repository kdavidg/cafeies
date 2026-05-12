import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Producto, Pedido 

# 1. LISTAR PRODUCTOS
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
                "badges": getattr(p, 'badges', [])
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# 2. CREAR PEDIDO
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
                estado='pendiente' # Se asegura de que nazca como pendiente
            )
            return JsonResponse({"status": "ok", "id": nuevo_pedido.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

# 3. LISTAR PEDIDOS (Incluyendo el estado para el historial)
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
                "estado": p.estado  # ¡ESTO ES VITAL PARA EL HISTORIAL!
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": "Error interno", "detalle": str(e)}, status=500)

# 4. GESTIONAR PEDIDO (Marcar como listo/cancelado en lugar de borrar)
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