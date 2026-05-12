from django.contrib import admin
from django.urls import path
# Añadimos eliminar_pedido a la lista de importaciones
from core.views import listar_productos, crear_pedido, listar_pedidos, auto_login, eliminar_pedido 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('entrar-ya-mismo/', auto_login),
    path('api/productos/', listar_productos),
    path('api/pedidos/crear/', crear_pedido),
    path('api/pedidos/lista/', listar_pedidos),
    path('api/pedidos/eliminar/<int:pk>/', eliminar_pedido, name='eliminar-pedido'),
]