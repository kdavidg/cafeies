export const PRODUCTS = [
  // Bocadillos
  { id: 'bocajamon', emoji: '🥙', name: 'Bocadillo de jamón', desc: 'Pan baguette con jamón serrano y tomate natural', cat: 'bocadillos', price: 2.80, badges: ['Popular'] },
  { id: 'bocamixto', emoji: '🥙', name: 'Bocadillo mixto', desc: 'Jamón york y queso en pan de molde tostado', cat: 'bocadillos', price: 2.50, badges: [] },
  { id: 'bocaveg', emoji: '🧆', name: 'Bocata vegetal', desc: 'Hummus, lechuga, tomate y pepino en pan integral', cat: 'bocadillos', price: 2.90, badges: ['Veg', 'Nuevo'] },
  
  // Bebidas
  { id: 'cafe', emoji: '☕', name: 'Café con leche', desc: 'Café espresso con leche entera bien caliente', cat: 'bebidas', price: 1.20, badges: ['Veg'] },
  { id: 'zumo', emoji: '🧃', name: 'Zumo de naranja', desc: 'Naranja exprimida al momento, sin azúcar añadido', cat: 'bebidas', price: 1.80, badges: ['Nuevo', 'Veg'] },
  { id: 'batido', emoji: '🥛', name: 'Batido de chocolate', desc: 'Leche fría con cacao puro, sin conservantes', cat: 'bebidas', price: 1.60, badges: ['Veg'] },
  { id: 'agua', emoji: '💧', name: 'Agua mineral', desc: 'Botella 500ml natural o con gas', cat: 'bebidas', price: 0.80, badges: ['Veg'] },
  
  // Dulces
  { id: 'croissant', emoji: '🥐', name: 'Croissant de mantequilla', desc: 'Hojaldrado, recién horneado cada mañana', cat: 'dulces', price: 1.50, badges: ['Veg'] },
  { id: 'magdalena', emoji: '🧁', name: 'Magdalena casera', desc: 'Con pepitas de chocolate, tamaño familiar', cat: 'dulces', price: 0.90, badges: ['Popular'] },
  { id: 'napolitana', emoji: '🥐', name: 'Napolitana de chocolate', desc: 'Hojaldre relleno de crema de chocolate', cat: 'dulces', price: 1.30, badges: [] },
  
  // Fresco
  { id: 'ensalada', emoji: '🥗', name: 'Ensalada mixta', desc: 'Lechuga, tomate, pepino y zanahoria con vinagreta', cat: 'fresco', price: 3.20, badges: ['Veg'] },
  { id: 'fruta', emoji: '🍎', name: 'Fruta del día', desc: 'Manzana, naranja, plátano (según disponibilidad)', cat: 'fresco', price: 0.70, badges: ['Veg', 'Nuevo'] },
]
export default PRODUCTS;