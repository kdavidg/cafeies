from django.contrib import admin
from .models import Producto, Pedido

# 1. Configuración para Productos
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    # Columnas visibles en la lista
    list_display = ('id', 'nombre', 'precio', 'categoria', 'emoji')
    # Filtros laterales
    list_filter = ('categoria',)
    # Buscador por nombre
    search_fields = ('nombre',)

# 2. Configuración para Pedidos
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    # Columnas principales
    list_display = ('id', 'usuario', 'total', 'estado', 'franja_horaria', 'fecha')
    # Filtros laterales (aquí es donde podrás filtrar por "pendiente")
    list_filter = ('estado', 'franja_horaria', 'fecha')
    # Permite cambiar el estado sin entrar al detalle del pedido
    list_editable = ('estado',)
    # Ordenar por fecha (el más nuevo arriba)
    ordering = ('-fecha',)

# --- IMPORTANTE: NO pongas admin.site.register(Producto) aquí abajo ---
# Al usar los decoradores @admin.register arriba, ya están registrados correctamente.