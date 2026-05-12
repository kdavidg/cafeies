# Proyecto CaféIES - Sistema de Gestión de Pedidos

Hecho por Mario Sanchez y Kleiner David Gonzaga

## Descripción
Aplicación web diseñada para la gestión de pedidos en la cafetería del instituto. Permite a los usuarios visualizar el menú, realizar pedidos programados por franjas horarias y gestionar el historial de compras.

## Tecnologías Utilizadas
* Frontend: React.js
* Autenticación: Google OAuth 2.0 (Google Cloud Console)
* Backend: Django / Django REST Framework
* Base de datos: PostgreSQL (Hosteado en Railway)
* Estilos: CSS3 con soporte para modo oscuro y diseño responsive

## Funcionalidades Principales
1.  Autenticación: Acceso seguro mediante cuentas corporativas o personales de Google.
2.  Menú Interactivo: Filtrado de productos por categorías (bebidas, bocadillos, dulces, fresco).
3.  Gestión de Carrito: Añadir, eliminar y modificar cantidades en tiempo real.
4.  Sistema de Horarios: Selección de franja horaria específica para la recogida del pedido.
5.  Panel de Administración: Interfaz para que el personal de la cafetería gestione pedidos entrantes
6.  Historial: Registro de pedidos anteriores con estados de preparación (pendiente, listo, completado).

## Configuración del Entorno
1.  Instalar dependencias: `npm install`
2.  Configurar el Client ID de Google en el componente GoogleOAuthProvider.
3.  Vincular la URL de la API del backend en las funciones de fetch.
4.  Ejecutar en desarrollo: `npm run dev`

## Estructura de Datos
Los productos incluyen los siguientes campos obligatorios:
* Nombre
* Precio
* Categoría
* Emoji identificador
