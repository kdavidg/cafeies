import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# Importamos los modelos de MySQL (asegúrate de que existan en models.py)
from .models import Producto, Pedido 

# 1. LISTAR PRODUCTOS (Desde MySQL)
def listar_productos(request):
    try:
        # Obtenemos todos los productos de MySQL
        productos = Producto.objects.all()
        
        lista_final = []
        for p in productos:
            lista_final.append({
                "id": p.id,
                "nombre": p.nombre,
                "precio": float(p.precio), # Decimal a float para JSON
                "descripcion": getattr(p, 'descripcion', 'Producto cafetería'),
                "categoria": p.categoria,
                "emoji": p.emoji,
                "badges": getattr(p, 'badges', [])
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# 2. CREAR PEDIDO (En MySQL con franja horaria)
@csrf_exempt
def crear_pedido(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            # Guardamos en MySQL usando el modelo
            nuevo_pedido = Pedido.objects.create(
                usuario=datos.get('usuario', 'Anónimo'),
                total=datos.get('total', 0.0),
                franja_horaria=datos.get('franja_horaria', 'No seleccionada'),
                items=datos.get('items', [])
            )
            return JsonResponse({"status": "success", "id": nuevo_pedido.id}, status=201)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

# 3. LISTAR PEDIDOS (Para el historial desde MySQL)
def listar_pedidos(request):
    try:
        pedidos = Pedido.objects.all().order_by('-fecha') # Los más recientes primero
        
        lista_final = []
        for p in pedidos:
            lista_final.append({
                "id": str(p.id),
                "usuario": p.usuario,
                "total": float(p.total),
                "franja_horaria": p.franja_horaria,
                "fecha": p.fecha.isoformat(),
                "items": p.items
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": "Error interno", "detalle": str(e)}, status=500)