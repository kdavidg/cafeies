# Proyecto Cafetería RA9
# CaféIES
Hecho por Mario Sánchez y Kleiner David Gonzaga 1º DAWINT

## Modelos

- **Producto**: Nombre, precio, categoría, emoji, descripción, stock
- **Usuario**: Email, nombre, teléfono, fecha de registro, favoritos
- **FranjasHorarias**: Horarios de recogida disponibles
- **Pedido**: Usuario, items, total, estado, franja horaria

# Enpoints principales
- GET  /api/productos/              - Listar productos
- POST /api/pedidos/crear/          - Crear pedido
- GET  /api/pedidos/lista/          - Listar pedidos
- POST /api/pedidos/eliminar/<id>/  - Actualizar estado pedido
- GET  /api/franjas-horarias/       - Listar franjas disponibles
- GET  /api/usuario/?email=...      - Obtener usuario y favoritos
- POST /api/usuario/favoritos/      - Agregar/quitar favorito

URL: https://cafeies-production.up.railway.app/
