from django.contrib import admin
from django.urls import path
# Importamos solo lo que realmente usamos
from core.views import listar_productos, crear_pedido, listar_pedidos, gestionar_pedido

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/productos/', listar_productos),
    path('api/pedidos/crear/', crear_pedido),
    path('api/pedidos/lista/', listar_pedidos),
    path('api/pedidos/eliminar/<int:pk>/', gestionar_pedido, name='gestionar-pedido'),
]