-- ============================================================
-- SEED DATA — 9 products across categories
-- Run AFTER schema.sql
--
-- Clothing images are served from /public/images/ (Netlify / Vite dev server).
-- Non-clothing images use Unsplash CDN (reliable, no auth required).
-- ============================================================

INSERT INTO products (name, description, price, category, image, stock, rating) VALUES

-- ── Clothing (local images) ─────────────────────────────────────────────────
(
  'Classic Denim Jacket',
  'A wardrobe staple crafted from heavyweight 12oz denim with a slightly relaxed fit, contrast stitching, and two chest pockets. Wear it over a hoodie in winter or alone in spring.',
  89.99,
  'clothing',
  '/images/jeans-jacket.jpg',
  65,
  4.4
),
(
  'Premium Leather Jacket',
  'Genuine full-grain leather jacket with a quilted satin lining, asymmetric zip closure, and gunmetal hardware. Built to last a lifetime and only gets better with age.',
  249.99,
  'clothing',
  '/images/leather-jacket.jpg',
  30,
  4.6
),
(
  'Slim Fit Trousers',
  'Tailored slim-fit trousers in a 4-way stretch fabric blend. Wrinkle-resistant and breathable — sharp enough for the office, comfortable enough for a long-haul flight.',
  54.99,
  'clothing',
  '/images/pansts.jpg',
  90,
  4.2
),
(
  'Athletic Performance Socks (6-Pack)',
  'Engineered with cushioned soles, arch support compression, and moisture-wicking fibres. Includes three crew-length and three ankle-length pairs in mixed neutrals.',
  19.99,
  'clothing',
  '/images/socks.jpg',
  200,
  4.5
),
(
  'Essential Cotton T-Shirt',
  'Pre-shrunk 100% organic ring-spun cotton in a timeless crewneck silhouette. Slightly heavier 180gsm fabric holds its shape wash after wash. The only tee you will ever need.',
  24.99,
  'clothing',
  '/images/t-shirt.jpg',
  150,
  4.3
),

-- ── Other categories (Unsplash CDN) ─────────────────────────────────────────
(
  'Air Max Pulse',
  'Lightweight running shoes with responsive foam cushioning and breathable mesh upper. Perfect for everyday training and casual wear.',
  129.99,
  'footwear',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  80,
  4.7
),
(
  'Wireless Pro Headphones',
  'Studio-quality sound with active noise cancellation, 30-hour battery life, and premium ear cushions for all-day comfort.',
  189.99,
  'electronics',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  60,
  4.8
),
(
  'Minimalist Backpack',
  'Sleek 20L daypack made from recycled nylon. Features a padded laptop sleeve, water bottle pocket, and hidden anti-theft zipper.',
  89.99,
  'bags',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  100,
  4.6
),
(
  'Smart Watch Series X',
  'Advanced health tracking with an AMOLED display, GPS, heart rate monitor, SpO2 sensor, and 7-day battery life.',
  299.99,
  'electronics',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  35,
  4.7
);
