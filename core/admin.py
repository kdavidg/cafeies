from django.contrib import admin
from .models import Producto, Pedido

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'precio', 'categoria', 'emoji')
    list_filter = ('categoria',)
    search_fields = ('nombre',)

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'total', 'estado', 'franja_horaria', 'fecha')
    list_filter = ('estado', 'franja_horaria', 'fecha')
    list_editable = ('estado',)
    ordering = ('-fecha',)