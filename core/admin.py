from django.contrib import admin
from .models import Producto, Pedido

# Configuración para Productos
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    # Esto hará que en el panel veas las columnas de nombre, precio y categoría
    list_display = ('nombre', 'precio', 'categoria', 'emoji')
    # Permite filtrar por categoría en el lateral derecho
    list_filter = ('categoria',)
    # Permite buscar productos por nombre
    search_fields = ('nombre',)

# Configuración para Pedidos
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    # Esto añade columnas al panel negro
    list_display = ('id', 'usuario', 'total', 'estado', 'franja_horaria', 'fecha')
    # Esto añade un filtro a la derecha para ver solo los pendientes
    list_filter = ('estado', 'franja_horaria', 'fecha')
    # Esto permite cambiar el estado directamente desde la lista
    list_editable = ('estado',)

admin.site.register(Producto)