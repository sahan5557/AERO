<?php
// ========================================================
// AERO-X Products API
// Handles GET (All / Single), POST (Create), PUT (Update), DELETE
// ========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Parse incoming JSON body if content type is application/json
$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true) ?? [];

// Helper function to extract specs and normalize product for frontend
function formatProduct($row) {
    return [
        'id'          => $row['id'],
        'name'        => $row['name'],
        'category'    => $row['category'],
        'price'       => (float)$row['price'],
        'stock'       => (int)$row['stock'],
        'badge'       => $row['badge'] ?? '',
        'image'       => $row['image'],
        'description' => $row['description'],
        'specs'       => [
            'battery' => $row['battery'] ?? '',
            'camera'  => $row['camera'] ?? '',
            'speed'   => $row['speed'] ?? '',
            'range'   => $row['flight_range'] ?? ''
        ],
        'battery'      => $row['battery'] ?? '',
        'camera'       => $row['camera'] ?? '',
        'speed'        => $row['speed'] ?? '',
        'flight_range' => $row['flight_range'] ?? '',
        'created_at'   => $row['created_at'] ?? ''
    ];
}

switch ($method) {

    // ----------------------------------------------------
    // GET: Fetch all products or a single product by ID
    // ----------------------------------------------------
    case 'GET':
        $id = $_GET['id'] ?? null;
        $category = $_GET['category'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM `products` WHERE `id` = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();

            if ($product) {
                echo json_encode([
                    'success' => true,
                    'data'    => formatProduct($product)
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Product not found'
                ]);
            }
        } else {
            if ($category && strtolower($category) !== 'all') {
                $stmt = $pdo->prepare("SELECT * FROM `products` WHERE `category` = ? ORDER BY `created_at` DESC");
                $stmt->execute([$category]);
            } else {
                $stmt = $pdo->query("SELECT * FROM `products` ORDER BY `created_at` DESC");
            }

            $products = $stmt->fetchAll();
            $formatted = array_map('formatProduct', $products);

            echo json_encode([
                'success' => true,
                'count'   => count($formatted),
                'data'    => $formatted
            ]);
        }
        break;

    // ----------------------------------------------------
    // POST: Add New Product OR Update (if action=update)
    // ----------------------------------------------------
    case 'POST':
        $data = !empty($jsonData) ? $jsonData : $_POST;
        $action = $data['action'] ?? ($_GET['action'] ?? '');

        if ($action === 'update' || isset($data['_method']) && strtoupper($data['_method']) === 'PUT') {
            handleUpdateProduct($pdo, $data);
            break;
        }

        // Validate required fields
        $name     = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? 'Cinematic');
        $price    = (float)($data['price'] ?? 0);
        $stock    = isset($data['stock']) ? (int)$data['stock'] : 10;
        $image    = trim($data['image'] ?? 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80');
        $desc     = trim($data['description'] ?? '');
        $badge    = trim($data['badge'] ?? 'NEW');

        // Handle nested specs or flat fields
        $battery = trim($data['specs']['battery'] ?? ($data['battery'] ?? ''));
        $camera  = trim($data['specs']['camera'] ?? ($data['camera'] ?? ''));
        $speed   = trim($data['specs']['speed'] ?? ($data['speed'] ?? ''));
        $range   = trim($data['specs']['range'] ?? ($data['flight_range'] ?? ''));

        if (empty($name) || $price <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Please provide valid drone name and price.'
            ]);
            exit();
        }

        // Unique ID generation (slug or timestamp)
        $id = !empty($data['id']) ? trim($data['id']) : 'drone-' . time();

        // Check if ID exists, if so generate a distinct ID
        $checkStmt = $pdo->prepare("SELECT id FROM `products` WHERE `id` = ?");
        $checkStmt->execute([$id]);
        if ($checkStmt->rowCount() > 0) {
            $id = 'drone-' . time() . '-' . rand(100, 999);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `products` (`id`, `name`, `category`, `price`, `stock`, `badge`, `image`, `description`, `battery`, `camera`, `speed`, `flight_range`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([$id, $name, $category, $price, $stock, $badge, $image, $desc, $battery, $camera, $speed, $range]);

        // Return the created product
        $getStmt = $pdo->prepare("SELECT * FROM `products` WHERE `id` = ?");
        $getStmt->execute([$id]);
        $created = $getStmt->fetch();

        echo json_encode([
            'success' => true,
            'message' => "Drone '{$name}' created successfully!",
            'data'    => formatProduct($created)
        ]);
        break;

    // ----------------------------------------------------
    // PUT: Update Existing Product
    // ----------------------------------------------------
    case 'PUT':
        $data = !empty($jsonData) ? $jsonData : $_REQUEST;
        handleUpdateProduct($pdo, $data);
        break;

    // ----------------------------------------------------
    // DELETE: Delete Product
    // ----------------------------------------------------
    case 'DELETE':
        $id = $_GET['id'] ?? ($jsonData['id'] ?? null);

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Product ID is required for deletion.'
            ]);
            exit();
        }

        // Check if product exists
        $checkStmt = $pdo->prepare("SELECT `name` FROM `products` WHERE `id` = ?");
        $checkStmt->execute([$id]);
        $target = $checkStmt->fetch();

        if (!$target) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Product not found in database.'
            ]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM `products` WHERE `id` = ?");
        $stmt->execute([$id]);

        echo json_encode([
            'success' => true,
            'message' => "Drone '{$target['name']}' deleted successfully!"
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed.'
        ]);
        break;
}

/**
 * Helper to update a product record
 */
function handleUpdateProduct($pdo, $data) {
    $id = trim($data['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Product ID is required to update.'
        ]);
        exit();
    }

    $checkStmt = $pdo->prepare("SELECT * FROM `products` WHERE `id` = ?");
    $checkStmt->execute([$id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Product not found.'
        ]);
        exit();
    }

    $name     = isset($data['name']) ? trim($data['name']) : $existing['name'];
    $category = isset($data['category']) ? trim($data['category']) : $existing['category'];
    $price    = isset($data['price']) ? (float)$data['price'] : (float)$existing['price'];
    $stock    = isset($data['stock']) ? (int)$data['stock'] : (int)$existing['stock'];
    $badge    = isset($data['badge']) ? trim($data['badge']) : $existing['badge'];
    $image    = isset($data['image']) ? trim($data['image']) : $existing['image'];
    $desc     = isset($data['description']) ? trim($data['description']) : $existing['description'];

    $battery = $data['specs']['battery'] ?? ($data['battery'] ?? $existing['battery']);
    $camera  = $data['specs']['camera'] ?? ($data['camera'] ?? $existing['camera']);
    $speed   = $data['specs']['speed'] ?? ($data['speed'] ?? $existing['speed']);
    $range   = $data['specs']['range'] ?? ($data['flight_range'] ?? $existing['flight_range']);

    $stmt = $pdo->prepare("
        UPDATE `products`
        SET `name` = ?, `category` = ?, `price` = ?, `stock` = ?, `badge` = ?, `image` = ?, `description` = ?, `battery` = ?, `camera` = ?, `speed` = ?, `flight_range` = ?
        WHERE `id` = ?
    ");

    $stmt->execute([$name, $category, $price, $stock, $badge, $image, $desc, $battery, $camera, $speed, $range, $id]);

    $getStmt = $pdo->prepare("SELECT * FROM `products` WHERE `id` = ?");
    $getStmt->execute([$id]);
    $updated = $getStmt->fetch();

    echo json_encode([
        'success' => true,
        'message' => "Drone '{$name}' updated successfully!",
        'data'    => formatProduct($updated)
    ]);
}

