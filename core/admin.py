from django.contrib import admin
from .models import Producto, Pedido


admin.site.register(Producto)

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'total', 'franja_horaria', 'fecha')
    list_filter = ('franja_horaria', 'fecha')
    search_fields = ('usuario',)