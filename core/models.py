# core/models.py
from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.FloatField() # MongoDB maneja bien Float
    descripcion = models.TextField(blank=True)
    categoria = models.CharField(max_length=50, default='bebidas')
    emoji = models.CharField(max_length=10, default='☕')

    def __str__(self):
        return self.nombre