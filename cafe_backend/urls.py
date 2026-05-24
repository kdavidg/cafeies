from django.contrib import admin
from django.urls import path

from core.views import listar_productos, crear_pedido, listar_pedidos, gestionar_pedido, es_admin, crear_producto, editar_producto, borrar_producto, crear_pago_stripe

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/productos/', listar_productos),
    path('api/pedidos/crear/', crear_pedido),
    path('api/pedidos/lista/', listar_pedidos),
    path('api/pedidos/eliminar/<int:pk>/', gestionar_pedido, name='gestionar-pedido'),
    path('api/es-admin/', es_admin, name='es_admin'),
    path('api/productos/crear/', crear_producto),
    path('api/productos/editar/<int:pk>/', editar_producto),
    path('api/productos/borrar/<int:pk>/', borrar_producto),
    path('api/pagos/crear-intent/', crear_pago_stripe),
]