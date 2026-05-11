import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId

# Importamos la conexión
try:
    from core.db_connection import db
except ImportError:
    import core.db_connection as mongo_db
    db = mongo_db.db

def listar_productos(request):
    try:
        # Usamos db directamente
        coleccion = db['productos']
        productos_mongo = list(coleccion.find({}))
        
        lista_final = []
        for p in productos_mongo:
            lista_final.append({
                "id": str(p['_id']),
                "nombre": p.get('nombre', 'Producto sin nombre'),
                "precio": p.get('precio', 0.0),
                "descripcion": p.get('descripcion', ''),
                "categoria": p.get('categoria', 'bebidas'),
                "emoji": p.get('emoji', '☕'),
                "badges": p.get('badges', [])
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def crear_pedido(request):
    if request.method == 'POST':
        try:
            datos_pedido = json.loads(request.body)
            
            # --- CORRECCIÓN AQUÍ ---
            # Si 'db' ya es la conexión a la base de datos 'cafe_db'
            # NO uses .client, usa db directamente:
            coleccion = db['pedidos']
            
            resultado = coleccion.insert_one(datos_pedido)
            
            print(f"✅ Pedido insertado con ID: {resultado.inserted_id}")
            
            return JsonResponse({
                "status": "success",
                "id": str(resultado.inserted_id)
            }, status=201)
        except Exception as e:
            print(f"❌ Error al insertar: {e}")
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    
    return JsonResponse({"status": "error", "message": "Método no permitido"}, status=405)

def listar_pedidos(request):
    try:
        # Usamos db directamente
        coleccion = db['pedidos']
        pedidos_mongo = list(coleccion.find({}))
        
        lista_final = []
        for p in pedidos_mongo:
            lista_final.append({
                "id": str(p.get('_id')),
                "usuario": p.get('usuario', 'Anónimo'),
                "total": p.get('total', 0.0),
                "fecha": p.get('fecha', ''),
                "items": p.get('items', {})
            })
        return JsonResponse(lista_final, safe=False)
    except Exception as e:
        print(f"--- ERROR LISTAR ---: {e}")
        return JsonResponse({"error": "Error interno", "detalle": str(e)}, status=500)