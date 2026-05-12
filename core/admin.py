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
    # Mostramos los campos importantes, incluyendo la franja horaria que pediste
    list_display = ('id', 'usuario', 'total', 'franja_horaria', 'fecha')
    list_filter = ('franja_horaria', 'fecha')
    search_fields = ('usuario',)
    # Esto hace que la fecha sea de solo lectura para que no se pueda modificar por error
    readonly_fields = ('fecha',)