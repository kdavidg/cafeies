from django.db import models
import random
import string

def generar_codigo_pedido():
    """Genera un código único de pedido: 2 letras + 3 números (ej: AB123)"""
    while True:
        letras = ''.join(random.choices(string.ascii_uppercase, k=2))
        numeros = ''.join(random.choices(string.digits, k=3))
        codigo = letras + numeros
        
        # Verificar que no exista
        if not Pedido.objects.filter(codigo=codigo).exists():
            return codigo

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=6, decimal_places=2)
    emoji = models.CharField(max_length=10, default='☕')
    categoria = models.CharField(max_length=50, default='bebidas')
    descripcion = models.TextField(blank=True, default='')
    stock = models.IntegerField(default=0)

class Pedido(models.Model):
    usuario = models.CharField(max_length=100)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    franja_horaria = models.CharField(max_length=50) 
    items = models.JSONField()
    codigo = models.CharField(max_length=8, unique=True, null=True, blank=True)
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    def __str__(self):
        return f"{self.usuario} - {self.franja_horaria}"
    
    def save(self, *args, **kwargs):
        # Si no tiene código, generar uno
        if not self.codigo:
            self.codigo = generar_codigo_pedido()
        super().save(*args, **kwargs)