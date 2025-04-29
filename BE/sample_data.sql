-- Thêm dữ liệu mẫu cho bảng users
INSERT INTO users (username, password, full_name, role, createdAt, updatedAt) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'admin', NOW(), NOW()),
('staff1', '$2a$10$X7UrE2JqX5X5X5X5X5X5X.5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'Nhân viên 1', 'staff', NOW(), NOW()),
('staff2', '$2a$10$X7UrE2JqX5X5X5X5X5X5X.5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'Nhân viên 2', 'staff', NOW(), NOW());

-- Thêm dữ liệu mẫu cho bảng categories
INSERT INTO categories (name, description, createdAt, updatedAt) VALUES
('Đồ ăn', 'Các loại đồ ăn trong rạp', NOW(), NOW()),
('Đồ uống', 'Các loại đồ uống trong rạp', NOW(), NOW()),
('Combo', 'Các combo đồ ăn và đồ uống', NOW(), NOW());

-- Thêm dữ liệu mẫu cho bảng products
INSERT INTO products (name, category_id, code, description, price, stock_quantity, image, status, createdAt, updatedAt) VALUES
('Bắp rang bơ', 1, 'BRB001', 'Bắp rang bơ size M', 45000, 100, 'popcorn.jpg', 'selling', NOW(), NOW()),
('Bắp rang bơ lớn', 1, 'BRB002', 'Bắp rang bơ size L', 65000, 100, 'popcorn_large.jpg', 'selling', NOW(), NOW()),
('Nước ngọt', 2, 'DRK001', 'Nước ngọt có ga 330ml', 25000, 200, 'soda.jpg', 'selling', NOW(), NOW()),
('Nước suối', 2, 'DRK002', 'Nước suối 500ml', 15000, 200, 'water.jpg', 'selling', NOW(), NOW()),
('Combo 1', 3, 'CMB001', '1 bắp M + 1 nước ngọt', 65000, 50, 'combo1.jpg', 'selling', NOW(), NOW()),
('Combo 2', 3, 'CMB002', '1 bắp L + 2 nước ngọt', 100000, 50, 'combo2.jpg', 'selling', NOW(), NOW());

-- Thêm dữ liệu mẫu cho bảng orders
INSERT INTO orders (user_id, total_amount, payment_method, status, note, createdAt, updatedAt) VALUES
(2, 115000, 'cash', 'completed', 'Đơn hàng 1', NOW(), NOW()),
(2, 165000, 'cash', 'completed', 'Đơn hàng 2', NOW(), NOW()),
(3, 90000, 'cash', 'pending', 'Đơn hàng 3', NOW(), NOW());

-- Thêm dữ liệu mẫu cho bảng orderdetails
INSERT INTO orderdetails (order_id, product_id, quantity, price, createdAt, updatedAt) VALUES
(1, 1, 2, 45000, NOW(), NOW()),
(1, 3, 1, 25000, NOW(), NOW()),
(2, 2, 1, 65000, NOW(), NOW()),
(2, 3, 2, 25000, NOW(), NOW()),
(2, 4, 2, 15000, NOW(), NOW()),
(3, 5, 1, 65000, NOW(), NOW()),
(3, 3, 1, 25000, NOW(), NOW()); 