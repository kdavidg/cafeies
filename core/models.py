from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=6, decimal_places=2)
    emoji = models.CharField(max_length=10, default='☕')
    categoria = models.CharField(max_length=50, default='bebidas')

class Pedido(models.Model):
    usuario = models.CharField(max_length=100)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    franja_horaria = models.CharField(max_length=50) 
    items = models.JSONField()
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    def __str__(self):
        return f"{self.usuario} - {self.franja_horaria}"