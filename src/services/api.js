const API_URL = "http://127.0.0.1:8000/api";

export const getProductos = async () => {
  const response = await fetch(`${API_URL}/productos/`);
  const data = await response.json();

  // Transformar datos de Django → formato React
  return data.map(producto => ({
    id: producto.id,
    name: producto.nombre,
    desc: producto.descripcion || "Sin descripción",
    price: producto.precio,
    emoji: producto.emoji || "☕",
    badges: producto.badges || []
  }));
};