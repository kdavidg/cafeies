from django.urls import path
from core.views import listar_productos, crear_pedido, listar_pedidos

urlpatterns = [
    path('api/productos/', listar_productos),
    path('api/pedidos/crear/', crear_pedido),
    path('api/pedidos/lista/', listar_pedidos),
]