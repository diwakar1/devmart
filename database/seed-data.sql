-- ============================================
-- DevMart E-commerce - Seed Data
-- Initial data for development and testing
-- ============================================

USE devmart;

-- ============================================
-- 1. ADMIN USER (Password: Admin@123)
-- ============================================

INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, email_verified) VALUES
('admin@devmart.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', '+1234567890', 'admin', TRUE, TRUE),
('john.doe@example.com', '$2b$10$YourHashedPasswordHere', 'John', 'Doe', '+1987654321', 'user', TRUE, TRUE),
('jane.smith@example.com', '$2b$10$YourHashedPasswordHere', 'Jane', 'Smith', '+1122334455', 'user', TRUE, TRUE);

-- ============================================
-- 2. CATEGORIES
-- ============================================

-- Main Categories
INSERT INTO categories (name, slug, description, parent_id, is_active, display_order) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories', NULL, TRUE, 1),
('Clothing', 'clothing', 'Fashion and apparel', NULL, TRUE, 2),
('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchenware', NULL, TRUE, 3),
('Books', 'books', 'Books and educational materials', NULL, TRUE, 4),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL, TRUE, 5),
('Beauty & Personal Care', 'beauty-personal-care', 'Cosmetics and personal care products', NULL, TRUE, 6),
('Toys & Games', 'toys-games', 'Toys, games, and hobbies', NULL, TRUE, 7);

-- Sub-categories for Electronics
INSERT INTO categories (name, slug, description, parent_id, is_active, display_order) VALUES
('Smartphones', 'smartphones', 'Mobile phones and accessories', 1, TRUE, 1),
('Laptops', 'laptops', 'Laptops and notebooks', 1, TRUE, 2),
('Tablets', 'tablets', 'Tablets and e-readers', 1, TRUE, 3),
('Cameras', 'cameras', 'Digital cameras and accessories', 1, TRUE, 4),
('Audio', 'audio', 'Headphones, speakers, and audio equipment', 1, TRUE, 5),
('Gaming', 'gaming', 'Gaming consoles and accessories', 1, TRUE, 6);

-- Sub-categories for Clothing
INSERT INTO categories (name, slug, description, parent_id, is_active, display_order) VALUES
('Men''s Clothing', 'mens-clothing', 'Clothing for men', 2, TRUE, 1),
('Women''s Clothing', 'womens-clothing', 'Clothing for women', 2, TRUE, 2),
('Kids'' Clothing', 'kids-clothing', 'Clothing for children', 2, TRUE, 3),
('Shoes', 'shoes', 'Footwear for all', 2, TRUE, 4),
('Accessories', 'accessories', 'Fashion accessories', 2, TRUE, 5);

-- ============================================
-- 3. BRANDS
-- ============================================

INSERT INTO brands (name, slug, description, is_active) VALUES
('Apple', 'apple', 'Premium technology products', TRUE),
('Samsung', 'samsung', 'Electronics and appliances', TRUE),
('Sony', 'sony', 'Electronics and entertainment', TRUE),
('Nike', 'nike', 'Sports apparel and footwear', TRUE),
('Adidas', 'adidas', 'Sports and lifestyle brand', TRUE),
('Dell', 'dell', 'Computer hardware and electronics', TRUE),
('HP', 'hp', 'Computing and printing solutions', TRUE),
('Canon', 'canon', 'Cameras and imaging products', TRUE),
('LG', 'lg', 'Home appliances and electronics', TRUE),
('Microsoft', 'microsoft', 'Software and hardware products', TRUE);

-- ============================================
-- 4. SAMPLE PRODUCTS
-- ============================================

-- Smartphones
INSERT INTO products (name, slug, description, short_description, sku, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('iPhone 14 Pro Max', 'iphone-14-pro-max', 'Latest iPhone with A16 Bionic chip, ProMotion display, and advanced camera system. Features Dynamic Island, Always-On display, and all-day battery life.', 'Premium smartphone with cutting-edge features', 'APL-IP14PM-128', 1, 1199.99, 1099.99, 50, TRUE, TRUE, TRUE),
('Samsung Galaxy S23 Ultra', 'samsung-galaxy-s23-ultra', 'Flagship Android phone with S Pen, 200MP camera, and powerful performance. Features stunning display and long-lasting battery.', 'Ultimate Android flagship experience', 'SAM-S23U-256', 2, 1199.99, NULL, 45, TRUE, TRUE, TRUE),
('Google Pixel 8 Pro', 'google-pixel-8-pro', 'Pure Android experience with amazing AI features and camera capabilities. Google Tensor G3 chip delivers incredible performance.', 'Best of Google in a smartphone', 'GOO-PX8P-128', NULL, 999.99, 899.99, 30, TRUE, FALSE, TRUE);

-- Laptops
INSERT INTO products (name, slug, description, short_description, sku, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('MacBook Pro 16"', 'macbook-pro-16', 'Professional laptop with M3 Pro chip, stunning Liquid Retina XDR display, and incredible performance for creative professionals.', 'Pro-level performance for creators', 'APL-MBP16-M3-512', 1, 2499.99, NULL, 25, TRUE, TRUE, FALSE),
('Dell XPS 15', 'dell-xps-15', 'Premium Windows laptop with InfinityEdge display, powerful Intel processor, and sleek design. Perfect for work and creativity.', 'Premium Windows ultrabook', 'DEL-XPS15-512', 6, 1799.99, 1699.99, 35, TRUE, TRUE, FALSE),
('HP Spectre x360', 'hp-spectre-x360', 'Convertible laptop with 360-degree hinge, stunning OLED display, and long battery life. Versatile 2-in-1 design.', 'Versatile 2-in-1 laptop', 'HP-SPX360-512', 7, 1499.99, NULL, 20, TRUE, FALSE, FALSE);

-- Headphones
INSERT INTO products (name, slug, description, short_description, sku, brand_id, price, discount_price, stock_quantity, is_active, is_featured, is_new) VALUES
('Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise cancelling headphones with premium sound quality, 30-hour battery life, and comfortable design.', 'Best noise-cancelling headphones', 'SON-WH1000XM5-BLK', 3, 399.99, 349.99, 60, TRUE, TRUE, FALSE),
('AirPods Pro 2nd Gen', 'airpods-pro-2', 'Apple wireless earbuds with active noise cancellation, transparency mode, and spatial audio. Includes MagSafe charging case.', 'Premium wireless earbuds', 'APL-APPRO2-WHT', 1, 249.99, NULL, 100, TRUE, FALSE, TRUE);

-- Clothing
INSERT INTO products (name, slug, description, short_description, sku, brand_id, price, discount_price, stock_quantity, is_active, is_featured) VALUES
('Nike Air Max 270', 'nike-air-max-270', 'Comfortable lifestyle sneakers with Max Air cushioning, breathable mesh upper, and iconic style.', 'Lifestyle sneakers with max comfort', 'NIK-AM270-BLK-10', 4, 159.99, 139.99, 80, TRUE, FALSE),
('Adidas Ultraboost 23', 'adidas-ultraboost-23', 'Premium running shoes with Boost cushioning technology, Primeknit upper, and responsive feel.', 'Premium running performance', 'ADI-UB23-WHT-10', 5, 189.99, 169.99, 65, TRUE, FALSE);

-- ============================================
-- 5. PRODUCT IMAGES
-- ============================================

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
-- iPhone 14 Pro Max
(1, '/images/products/iphone-14-pro-max-1.jpg', 'iPhone 14 Pro Max Front View', TRUE, 1),
(1, '/images/products/iphone-14-pro-max-2.jpg', 'iPhone 14 Pro Max Back View', FALSE, 2),
(1, '/images/products/iphone-14-pro-max-3.jpg', 'iPhone 14 Pro Max Side View', FALSE, 3),

-- Samsung Galaxy S23 Ultra
(2, '/images/products/samsung-s23-ultra-1.jpg', 'Samsung Galaxy S23 Ultra Front', TRUE, 1),
(2, '/images/products/samsung-s23-ultra-2.jpg', 'Samsung Galaxy S23 Ultra with S Pen', FALSE, 2),

-- MacBook Pro 16"
(4, '/images/products/macbook-pro-16-1.jpg', 'MacBook Pro 16 inch', TRUE, 1),
(4, '/images/products/macbook-pro-16-2.jpg', 'MacBook Pro 16 Keyboard', FALSE, 2);

-- ============================================
-- 6. PRODUCT-CATEGORY RELATIONSHIPS
-- ============================================

INSERT INTO product_categories (product_id, category_id, is_primary) VALUES
-- Smartphones
(1, 8, TRUE),  -- iPhone -> Smartphones
(1, 1, FALSE), -- iPhone -> Electronics
(2, 8, TRUE),  -- Galaxy -> Smartphones
(2, 1, FALSE), -- Galaxy -> Electronics
(3, 8, TRUE),  -- Pixel -> Smartphones

-- Laptops
(4, 9, TRUE),  -- MacBook -> Laptops
(4, 1, FALSE), -- MacBook -> Electronics
(5, 9, TRUE),  -- Dell XPS -> Laptops
(6, 9, TRUE),  -- HP Spectre -> Laptops

-- Audio
(7, 12, TRUE), -- Sony Headphones -> Audio
(7, 1, FALSE), -- Sony Headphones -> Electronics
(8, 12, TRUE), -- AirPods -> Audio

-- Shoes
(9, 17, TRUE), -- Nike shoes -> Shoes
(9, 2, FALSE), -- Nike shoes -> Clothing
(10, 17, TRUE); -- Adidas shoes -> Shoes

-- ============================================
-- 7. PRODUCT ATTRIBUTES
-- ============================================

-- iPhone 14 Pro Max
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, display_order) VALUES
(1, 'Screen Size', '6.7 inches', 1),
(1, 'Storage', '128GB', 2),
(1, 'RAM', '6GB', 3),
(1, 'Camera', '48MP Main + 12MP Ultra Wide + 12MP Telephoto', 4),
(1, 'Battery', '4323 mAh', 5),
(1, 'Operating System', 'iOS 17', 6),
(1, 'Color Options', 'Deep Purple, Gold, Silver, Space Black', 7);

-- MacBook Pro 16"
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, display_order) VALUES
(4, 'Processor', 'Apple M3 Pro', 1),
(4, 'Display', '16.2-inch Liquid Retina XDR', 2),
(4, 'Memory', '18GB Unified Memory', 3),
(4, 'Storage', '512GB SSD', 4),
(4, 'Graphics', 'Integrated GPU', 5),
(4, 'Battery Life', 'Up to 22 hours', 6);

-- ============================================
-- 8. PRODUCT VARIANTS
-- ============================================

-- iPhone colors and storage
INSERT INTO product_variants (product_id, variant_name, sku, price, stock_quantity, attributes) VALUES
(1, 'Deep Purple 256GB', 'APL-IP14PM-256-DP', 1299.99, 20, '{"color": "Deep Purple", "storage": "256GB"}'),
(1, 'Gold 256GB', 'APL-IP14PM-256-GD', 1299.99, 15, '{"color": "Gold", "storage": "256GB"}'),
(1, 'Space Black 512GB', 'APL-IP14PM-512-SB', 1499.99, 10, '{"color": "Space Black", "storage": "512GB"}');

-- Nike shoes sizes
INSERT INTO product_variants (product_id, variant_name, sku, price, stock_quantity, attributes) VALUES
(9, 'Black - Size 9', 'NIK-AM270-BLK-9', 159.99, 20, '{"color": "Black", "size": "9"}'),
(9, 'Black - Size 11', 'NIK-AM270-BLK-11', 159.99, 15, '{"color": "Black", "size": "11"}'),
(9, 'White - Size 10', 'NIK-AM270-WHT-10', 159.99, 25, '{"color": "White", "size": "10"}');

-- ============================================
-- 9. SAMPLE COUPONS
-- ============================================

INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, usage_limit_per_user, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 50.00, 50.00, 1000, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('FREESHIP', 'Free shipping on orders over $100', 'free_shipping', 0.00, 100.00, NULL, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE),
('SAVE25', 'Save $25 on orders over $200', 'fixed_amount', 25.00, 200.00, NULL, 500, 1, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), TRUE),
('FLASHSALE', 'Flash sale - 20% off electronics', 'percentage', 20.00, NULL, 100.00, 200, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), TRUE);

-- ============================================
-- 10. SAMPLE REVIEWS
-- ============================================

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved) VALUES
(1, 2, 5, 'Amazing phone!', 'The iPhone 14 Pro Max exceeded my expectations. Camera is incredible and battery lasts all day!', TRUE, TRUE),
(1, 3, 4, 'Great but expensive', 'Love the phone but the price is quite high. Dynamic Island is a cool feature.', TRUE, TRUE),
(4, 2, 5, 'Best laptop for developers', 'M3 Pro chip is blazing fast. Perfect for coding and video editing. Battery life is exceptional!', TRUE, TRUE),
(7, 3, 5, 'Best noise cancelling', 'These headphones are incredible. Noise cancelling is industry-leading and sound quality is amazing.', TRUE, TRUE);

-- ============================================
-- Note: Remember to update password hashes with
-- actual bcrypt hashed passwords before using
-- Default password for all users: Admin@123
-- Hash with: bcrypt.hash('Admin@123', 10)
-- ============================================
