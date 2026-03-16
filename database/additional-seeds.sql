-- Additional seed products for empty categories
-- Run: mysql -u devmart_user -p"DevMart@2026#Secure" devmart < additional-seeds.sql

-- New brands needed for new product categories
INSERT INTO brands (name, slug, description, is_active) VALUES
('Dyson', 'dyson', 'Innovative vacuum cleaners and home appliances', TRUE),
('KitchenAid', 'kitchenaid', 'Premium kitchen appliances and tools', TRUE),
('Penguin Books', 'penguin-books', 'World-renowned book publisher', TRUE),
('Wilson', 'wilson', 'Leading sports equipment manufacturer', TRUE),
('LOréal', 'loreal', 'World leader in beauty products', TRUE),
('LEGO', 'lego', 'Creative building toy sets', TRUE);

-- Home & Kitchen products (category_id = 3)
INSERT INTO products (name, slug, sku, description, short_description, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('Dyson V15 Detect Vacuum', 'dyson-v15-detect-vacuum', 'HOME-DYS-001', 'Powerful cordless vacuum with laser dust detection and piezo sensor for scientific proof of a deep clean.', 'Laser-guided cordless vacuum cleaner', (SELECT id FROM brands WHERE slug='dyson'), 749.99, 649.99, 25, TRUE, TRUE, TRUE),
('KitchenAid Stand Mixer', 'kitchenaid-stand-mixer', 'HOME-KIT-001', 'Iconic tilt-head stand mixer with 10 speeds and 5-quart stainless steel bowl. Perfect for baking enthusiasts.', '5-Qt Professional Stand Mixer', (SELECT id FROM brands WHERE slug='kitchenaid'), 449.99, NULL, 40, TRUE, TRUE, FALSE),
('Dyson Pure Cool Air Purifier', 'dyson-pure-cool-purifier', 'HOME-DYS-002', 'HEPA air purifier and fan combo. Captures 99.97% of particles as small as 0.3 microns.', 'Air purifier with HEPA filtration', (SELECT id FROM brands WHERE slug='dyson'), 549.99, 499.99, 15, TRUE, FALSE, TRUE),
('KitchenAid Food Processor', 'kitchenaid-food-processor', 'HOME-KIT-002', '13-cup food processor with ExactSlice system. Chop, slice, shred, and puree with ease.', '13-Cup Food Processor', (SELECT id FROM brands WHERE slug='kitchenaid'), 199.99, NULL, 30, TRUE, FALSE, FALSE),
('Samsung Smart Refrigerator', 'samsung-smart-fridge', 'HOME-SAM-001', '28 cu ft French Door refrigerator with Family Hub touchscreen and built-in cameras.', 'Smart French Door Refrigerator', 2, 2799.99, 2499.99, 10, TRUE, TRUE, TRUE),
('LG OLED TV 65"', 'lg-oled-tv-65', 'HOME-LG-001', '65-inch 4K OLED evo with self-lit pixels for infinite contrast and perfect blacks.', '65" 4K OLED Smart TV', 9, 1799.99, 1599.99, 20, TRUE, TRUE, FALSE);

-- Books products (category_id = 4)
INSERT INTO products (name, slug, sku, description, short_description, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('Clean Code by Robert C. Martin', 'clean-code-robert-martin', 'BOOK-PEN-001', 'A handbook of agile software craftsmanship. Learn to write code that is clean, readable, and maintainable.', 'Software craftsmanship handbook', (SELECT id FROM brands WHERE slug='penguin-books'), 44.99, 34.99, 100, TRUE, TRUE, FALSE),
('The Pragmatic Programmer', 'pragmatic-programmer', 'BOOK-PEN-002', 'Your journey to mastery. Updated 20th anniversary edition covering modern development practices.', 'Classic programming book', (SELECT id FROM brands WHERE slug='penguin-books'), 49.99, NULL, 80, TRUE, FALSE, FALSE),
('Design Patterns - Gang of Four', 'design-patterns-gof', 'BOOK-PEN-003', 'Elements of Reusable Object-Oriented Software. The definitive guide to design patterns.', 'OOP design patterns reference', (SELECT id FROM brands WHERE slug='penguin-books'), 54.99, 44.99, 60, TRUE, FALSE, TRUE),
('System Design Interview', 'system-design-interview', 'BOOK-PEN-004', 'An insider''s guide. Learn how to answer system design questions in technical interviews at top companies.', 'System design interview prep', (SELECT id FROM brands WHERE slug='penguin-books'), 39.99, NULL, 120, TRUE, TRUE, TRUE);

-- Sports & Outdoors products (category_id = 5)
INSERT INTO products (name, slug, sku, description, short_description, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('Nike Dri-FIT Training Set', 'nike-drifit-training-set', 'SPT-NIK-001', 'Complete training set with moisture-wicking Dri-FIT fabric. Includes shorts and top.', 'Dri-FIT workout set', 4, 89.99, 69.99, 75, TRUE, TRUE, TRUE),
('Wilson Pro Staff Tennis Racket', 'wilson-prostaff-tennis', 'SPT-WIL-001', 'Roger Federer''s signature racket. 97 sq in head, 315g unstrung. For advanced players.', 'Professional tennis racket', (SELECT id FROM brands WHERE slug='wilson'), 249.99, NULL, 30, TRUE, FALSE, FALSE),
('Adidas Predator Soccer Cleats', 'adidas-predator-cleats', 'SPT-ADI-001', 'Firm ground soccer cleats with Controlskin upper for enhanced ball control and swerve.', 'FG soccer cleats', 5, 179.99, 149.99, 45, TRUE, TRUE, FALSE),
('Nike Yoga Mat Premium', 'nike-yoga-mat-premium', 'SPT-NIK-002', 'Extra thick 6mm yoga mat with non-slip surface. Lightweight and easy to carry.', 'Premium 6mm yoga mat', 4, 49.99, NULL, 100, TRUE, FALSE, TRUE);

-- Beauty & Personal Care products (category_id = 6)
INSERT INTO products (name, slug, sku, description, short_description, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('Dyson Airwrap Styler', 'dyson-airwrap-styler', 'BEA-DYS-001', 'Multi-styler with Coanda airflow technology. Curl, wave, smooth, and dry with no extreme heat.', 'Complete hair styling system', (SELECT id FROM brands WHERE slug='dyson'), 599.99, 549.99, 20, TRUE, TRUE, TRUE),
('LOréal Revitalift Serum', 'loreal-revitalift-serum', 'BEA-LOR-001', 'Anti-aging serum with 1.5% pure hyaluronic acid. Visibly replumps and reduces wrinkles.', 'Hyaluronic acid anti-aging serum', (SELECT id FROM brands WHERE slug='loreal'), 29.99, 24.99, 200, TRUE, FALSE, FALSE),
('Dyson Supersonic Hair Dryer', 'dyson-supersonic-hair-dryer', 'BEA-DYS-002', 'Fast drying with no extreme heat damage. Intelligent heat control to protect shine.', 'Professional hair dryer', (SELECT id FROM brands WHERE slug='dyson'), 429.99, NULL, 35, TRUE, TRUE, FALSE),
('LOréal Paris True Match Foundation', 'loreal-true-match-foundation', 'BEA-LOR-002', 'Liquid foundation with skin-matching technology. Blends seamlessly for a natural finish.', 'Skin-matching liquid foundation', (SELECT id FROM brands WHERE slug='loreal'), 14.99, NULL, 150, TRUE, FALSE, TRUE);

-- Toys & Games products (category_id = 7)
INSERT INTO products (name, slug, sku, description, short_description, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('LEGO Technic Bugatti Chiron', 'lego-technic-bugatti-chiron', 'TOY-LEG-001', '3,599-piece detailed replica with W16 engine, active rear wing, and disc brakes.', '1:8 scale Bugatti replica', (SELECT id FROM brands WHERE slug='lego'), 449.99, 399.99, 15, TRUE, TRUE, TRUE),
('LEGO Star Wars Millennium Falcon', 'lego-star-wars-falcon', 'TOY-LEG-002', 'Ultimate collector series with 7,541 pieces. Includes Han Solo, Chewbacca, and crew minifigures.', 'UCS Millennium Falcon', (SELECT id FROM brands WHERE slug='lego'), 849.99, NULL, 8, TRUE, TRUE, FALSE),
('Sony PlayStation 5 Console', 'sony-ps5-console', 'TOY-SON-001', 'Next-gen gaming with lightning-fast SSD, ray tracing, and 4K/120fps support. Includes DualSense controller.', 'PS5 gaming console', 3, 499.99, NULL, 50, TRUE, TRUE, TRUE),
('Nintendo Switch OLED', 'nintendo-switch-oled', 'TOY-NIN-001', '7-inch OLED screen with vibrant colors. Play at home on TV or on-the-go in handheld mode.', 'OLED gaming handheld', 3, 349.99, 329.99, 60, TRUE, FALSE, TRUE);

-- Product-Category associations for new products
-- Home & Kitchen (3)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 3 FROM products WHERE sku LIKE 'HOME-%';

-- Books (4)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 4 FROM products WHERE sku LIKE 'BOOK-%';

-- Sports & Outdoors (5)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 5 FROM products WHERE sku LIKE 'SPT-%';

-- Beauty & Personal Care (6)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 6 FROM products WHERE sku LIKE 'BEA-%';

-- Toys & Games (7)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 7 FROM products WHERE sku LIKE 'TOY-%';

-- Also link PS5 and Nintendo to Electronics > Gaming (13)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 13 FROM products WHERE sku IN ('TOY-SON-001', 'TOY-NIN-001');

-- Also link LG TV to Electronics (1)
INSERT INTO product_categories (product_id, category_id)
SELECT id, 1 FROM products WHERE sku = 'HOME-LG-001';

-- Add product images for new products
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT id, CONCAT('https://picsum.photos/seed/', slug, '/600/600'), name, TRUE, 1
FROM products WHERE id > 10;
