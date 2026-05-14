/**
 * CLYRO — Mock product data
 * Used as fallback / dev data while the Flask backend is not running.
 * Shape matches the backend contract in design spec section 5.2.
 */
export const MOCK_CATEGORIES = [
  { id: 1, name: 'Electrónica' },
  { id: 2, name: 'Hogar'        },
  { id: 3, name: 'Moda'         },
  { id: 4, name: 'Deporte'      },
  { id: 5, name: 'Libros'       },
]

export const MOCK_PRODUCTS = [
  {
    id: 1, slug: 'auriculares-bt-pro',
    name: 'Auriculares Bluetooth Pro',
    category: 'Electrónica',
    price: 899, old_price: 1200,
    image_url: 'https://picsum.photos/seed/headphones/480/480',
    description: 'Sonido envolvente de alta fidelidad con cancelación activa de ruido. Batería de 30 h. Diseño plegable y ligero.',
    stock: 50, active: true,
  },
  {
    id: 2, slug: 'lampara-stone',
    name: 'Lámpara Stone Edition',
    category: 'Hogar',
    price: 1250, old_price: null,
    image_url: 'https://picsum.photos/seed/lamp/480/480',
    description: 'Luminaria de concreto pulido. Luz cálida regulable. Perfecta para ambientes minimalistas.',
    stock: 20, active: true,
  },
  {
    id: 3, slug: 'tote-canvas',
    name: 'Tote Canvas Natural',
    category: 'Moda',
    price: 380, old_price: null,
    image_url: 'https://picsum.photos/seed/tote/480/480',
    description: 'Bolso de tela de algodón orgánico 100%. Sin tintas. La esencia de lo simple.',
    stock: 80, active: true,
  },
  {
    id: 4, slug: 'agua-termal',
    name: 'Agua Termal Mineral',
    category: 'Deporte',
    price: 120, old_price: null,
    image_url: 'https://picsum.photos/seed/water/480/480',
    description: 'Botella de vidrio borosilicato 500 ml. Sin BPA, sin plástico. Para quienes cuidan cada detalle.',
    stock: 200, active: true,
  },
  {
    id: 5, slug: 'diario-lino',
    name: 'Diario Encuadernado en Lino',
    category: 'Libros',
    price: 290, old_price: null,
    image_url: 'https://picsum.photos/seed/journal/480/480',
    description: 'Cuaderno de papel japponés 80 g. Encuadernado a mano. Páginas sin líneas — libertad total.',
    stock: 60, active: true,
  },
  {
    id: 6, slug: 'altavoz-pebble',
    name: 'Altavoz Pebble',
    category: 'Electrónica',
    price: 649, old_price: 799,
    image_url: 'https://picsum.photos/seed/speaker/480/480',
    description: 'Altavoz Bluetooth 360° en carcasa de piedra artificial. Impermeble IPX5. 20 horas de reproducción.',
    stock: 35, active: true,
  },
  {
    id: 7, slug: 'silla-arco',
    name: 'Silla Arco',
    category: 'Hogar',
    price: 3200, old_price: null,
    image_url: 'https://picsum.photos/seed/chair/480/480',
    description: 'Madera de haya maciza y asiento de lino natural. Inspirada en el design escandinavo de los 60s.',
    stock: 10, active: true,
  },
  {
    id: 8, slug: 'camiseta-hemp',
    name: 'Camiseta Hemp Washed',
    category: 'Moda',
    price: 550, old_price: null,
    image_url: 'https://picsum.photos/seed/shirt/480/480',
    description: 'Tejido de cáñamo lavado a la piedra. Más suave con cada lavado. Carbono neutro.',
    stock: 120, active: true,
  },
]
