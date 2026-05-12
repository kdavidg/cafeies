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
        data = json.loads(request.body)
        try:
            nuevo_pedido = Pedido.objects.create(
                usuario=data.get('usuario'),
                total=data.get('total'),
                franja_horaria=data.get('franja_horaria'),
                items=data.get('items') # Aquí se guarda el objeto del carrito
            )
            return JsonResponse({"status": "ok", "id": nuevo_pedido.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

# 3. LISTAR PEDIDOS (Para el historial desde MySQL)
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
                "items": p.items
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": "Error interno", "detalle": str(e)}, status=500)
    

from django.contrib.auth.models import User
from django.contrib.auth import login
from django.shortcuts import redirect

def auto_login(request):
    # Esto busca al usuario 'admin', si no existe lo crea, y te loguea
    user, created = User.objects.get_or_create(username='admin', defaults={'is_staff': True, 'is_superuser': True})
    if created:
        user.set_password('admin1234')
        user.save()
    
    login(request, user)
    return redirect('/admin/')