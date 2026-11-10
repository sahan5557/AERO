-- ========================================================
-- AERO-X DRONES E-COMMERCE DATABASE
-- Database: aerox_db
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.x+ (XAMPP)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `aerox_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aerox_db`;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `products` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 10,
  `badge` VARCHAR(100) DEFAULT '',
  `image` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `battery` VARCHAR(100) DEFAULT '',
  `camera` VARCHAR(150) DEFAULT '',
  `speed` VARCHAR(100) DEFAULT '',
  `flight_range` VARCHAR(100) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping data for table `products`
-- --------------------------------------------------------
INSERT INTO `products` (`id`, `name`, `category`, `price`, `stock`, `badge`, `image`, `description`, `battery`, `camera`, `speed`, `flight_range`, `created_at`) VALUES
('dji-inspire3', 'DJI Inspire 3 Cinema Master', 'Cinematic', 4250000.00, 5, '8K Cinema Pro', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80', 'Professional full-frame 8K cinema drone with dual-native ISO, Waypoint Pro 3D spatial flight pathing, 360° Pan, and Apple ProRes RAW.', '28 Mins', 'Zenmuse X9-8K Air', '94 km/h', '15 km', NOW()),
('dji-mavic3pro', 'DJI Mavic 3 Pro Cine Combo', 'Cinematic', 1480000.00, 8, 'Hasselblad 4/3', 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80', 'Flagship triple-camera system featuring a 4/3 CMOS Hasselblad lens, 3x/7x dual tele cameras, and Apple ProRes 422 HQ recording.', '43 Mins', '4/3 Hasselblad + Dual Tele', '75 km/h', '15 km', NOW()),
('dji-phantom4pro', 'DJI Phantom 4 Pro V2.0', 'Cinematic', 785000.00, 12, 'Phantom Classic', 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80', 'Iconic quadcopter with a 1-inch mechanical shutter sensor, 5-direction obstacle sensing, and OcuSync 2.0 HD transmission.', '30 Mins', '1-inch 20MP 4K/60fps', '72 km/h', '10 km', NOW()),
('dji-air3', 'DJI Air 3 Fly More Combo', 'Cinematic', 545000.00, 15, 'Dual Primary', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', 'Advanced dual-primary camera drone featuring 1/1.3-inch CMOS medium tele & wide-angle lenses with omnidirectional obstacle sensing.', '46 Mins', 'Dual 48MP 4K/60fps', '75 km/h', '20 km', NOW()),
('dji-mini4pro', 'DJI Mini 4 Pro Fly More', 'Mini', 425000.00, 20, 'Under 249g', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80', 'Sub-249g ultra-light folding drone with omnidirectional active sensing, ActiveTrack 360°, and True Vertical shooting for social reels.', '34 Mins', '4K/60fps HDR Vertical', '57 km/h', '20 km', NOW()),
('dji-avata2', 'DJI Avata 2 FPV Goggles 3', 'FPV', 495000.00, 10, 'Immersive FPV', 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&w=800&q=80', 'Adrenaline-packed Motion Controlled FPV drone with integrated prop guards, 1-click ACRO maneuvers, and RockSteady 3.0+ stabilization.', '23 Mins', '4K/60fps 155° Ultra-Wide', '97 km/h', '13 km', NOW()),
('dji-matrice350', 'DJI Matrice 350 RTK Enterprise', 'Enterprise', 3850000.00, 4, 'Industrial RTK', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80', 'Flagship industrial platform featuring IP55 weather resistance, RTK positioning, night-vision FPV, and 2.7kg multi-payload capacity.', '55 Mins', 'Zenmuse Thermal/LiDAR', '82 km/h', '20 km', NOW()),
('dji-agras-t40', 'DJI Agras T40 Agriculture Drone', 'Enterprise', 6500000.00, 3, 'Agri Sprayer', 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80', 'Revolutionary agricultural spraying and spreading drone with 40kg liquid capacity, dual atomized sprinklers, and 3D terrain mapping.', '20 Mins', 'Active Phased Radar', '36 km/h', '7 km', NOW()),
('dji-mini3pro', 'DJI Mini 3 Pro Fly More', 'Mini', 325000.00, 14, 'Best Creator', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80', 'Compact travel quadcopter featuring tri-directional obstacle sensing, f/1.7 aperture lens, and 48MP RAW photo capture.', '34 Mins', '4K/60fps HDR 48MP', '57 km/h', '12 km', NOW());

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT '',
  `address` TEXT DEFAULT '',
  `role` ENUM('admin', 'customer') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping data for table `users`
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES
(1, 'Admin Manager', 'admin@aerox.com', 'admin123', '+94 77 123 4567', 'Aero HQ, Tech Park, Colombo', 'admin', NOW()),
(2, 'Behan Peshala', 'user@aerox.com', 'user123', '+94 71 987 6543', 'No 45, Galle Road, Colombo', 'customer', NOW());

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) DEFAULT '',
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) DEFAULT '',
  `total_amount` VARCHAR(100) NOT NULL,
  `status` ENUM('Processing', 'Shipped', 'Delivered') DEFAULT 'Processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `order_items`
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  INDEX (`order_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Dumping sample initial orders
-- --------------------------------------------------------
INSERT INTO `orders` (`id`, `order_id`, `customer_name`, `email`, `phone`, `address`, `city`, `total_amount`, `status`, `created_at`) VALUES
(1, 'AERO-849201', 'Behan Peshala', 'user@aerox.com', '+94 71 987 6543', 'No 45, Galle Road, Colombo', 'Colombo', 'Rs. 1,480,000', 'Delivered', NOW() - INTERVAL 2 DAY),
(2, 'AERO-731940', 'Kasun Perera', 'kasun@gmail.com', '+94 77 444 5555', '88 Kandy Road, Kadawatha', 'Kadawatha', 'Rs. 425,000', 'Processing', NOW());

INSERT INTO `order_items` (`order_id`, `product_id`, `name`, `price`, `quantity`) VALUES
('AERO-849201', 'dji-mavic3pro', 'DJI Mavic 3 Pro Cine Combo', 1480000.00, 1),
('AERO-731940', 'dji-mini4pro', 'DJI Mini 4 Pro Fly More', 425000.00, 1);

