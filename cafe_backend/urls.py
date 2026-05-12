from django.contrib import admin
from django.urls import path
from core.views import listar_productos, crear_pedido, listar_pedidos
from core.views import auto_login

urlpatterns = [
    path('admin/', admin.site.urls),
    path('entrar-ya-mismo/', auto_login),
    path('api/productos/', listar_productos),
    path('api/pedidos/crear/', crear_pedido),
    path('api/pedidos/lista/', listar_pedidos),
]