from django.contrib import admin
from .models import Producto, Pedido, Usuario, FranjasHorarias

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'precio', 'categoria', 'emoji', 'descripcion', 'stock')
    list_filter = ('categoria',)
    search_fields = ('nombre',)

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'total', 'estado', 'franja_formateada', 'codigo','fecha')
    list_filter = ('estado', 'franja_horaria', 'fecha')
    list_editable = ('estado',)
    ordering = ('-fecha',)
    
    def franja_formateada(self, obj):
        if obj.franja_horaria:
            return f"{str(obj.franja_horaria.hora_inicio)[0:5]} - {str(obj.franja_horaria.hora_fin)[0:5]}"
        return "-"
    franja_formateada.short_description = "Franja Horaria"

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('email', 'nombre', 'es_admin', 'fecha_registro')
    list_filter = ('es_admin',)
    search_fields = ('email', 'nombre')
    filter_horizontal = ('productos_favoritos',)

@admin.register(FranjasHorarias)
class FranjasHorariasAdmin(admin.ModelAdmin):
    list_display = ('hora_inicio', 'hora_fin', 'activa', 'max_pedidos')
    list_filter = ('activa',)