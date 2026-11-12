<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true) ?? [];

switch ($method) {

    // GET: List all customer orders
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM `orders` ORDER BY `created_at` DESC");
        $orders = $stmt->fetchAll();

        // Attach items to each order
        $orderStmt = $pdo->prepare("SELECT * FROM `order_items` WHERE `order_id` = ?");

        $results = [];
        foreach ($orders as $order) {
            $orderStmt->execute([$order['order_id']]);
            $items = $orderStmt->fetchAll();

            $results[] = [
                'orderId'     => $order['order_id'],
                'customer'    => $order['customer_name'],
                'email'       => $order['email'],
                'phone'       => $order['phone'],
                'address'     => $order['address'],
                'city'        => $order['city'],
                'totalAmount' => $order['total_amount'],
                'status'      => $order['status'],
                'date'        => date('M j, Y', strtotime($order['created_at'])),
                'items'       => array_map(function($i) {
                    return [
                        'productId' => $i['product_id'],
                        'name'      => $i['name'],
                        'price'     => (float)$i['price'],
                        'quantity'  => (int)$i['quantity'],
                        'qty'       => (int)$i['quantity']
                    ];
                }, $items)
            ];
        }

        echo json_encode([
            'success' => true,
            'count'   => count($results),
            'data'    => $results
        ]);
        break;

    // POST: Create New Order OR Update Status
    case 'POST':
        $data = !empty($jsonData) ? $jsonData : $_POST;
        $action = $data['action'] ?? ($_GET['action'] ?? '');

        // 1. If updating status
        if ($action === 'update_status') {
            $orderId = trim($data['orderId'] ?? ($data['order_id'] ?? ''));
            $status  = trim($data['status'] ?? 'Processing');

            if (empty($orderId)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Order ID is required']);
                exit();
            }

            $stmt = $pdo->prepare("UPDATE `orders` SET `status` = ? WHERE `order_id` = ?");
            $stmt->execute([$status, $orderId]);

            echo json_encode([
                'success' => true,
                'message' => "Order #{$orderId} status updated to {$status}"
            ]);
            break;
        }

        // 2. Placing new checkout order
        $customerName = trim($data['customer'] ?? ($data['customer_name'] ?? ''));
        $email        = trim($data['email'] ?? '');
        $phone        = trim($data['phone'] ?? '');
        $address      = trim($data['address'] ?? '');
        $city         = trim($data['city'] ?? '');
        $totalAmount  = trim($data['totalAmount'] ?? ($data['total_amount'] ?? 'Rs. 0'));
        $items        = $data['items'] ?? [];

        if (empty($customerName) || empty($email) || empty($address)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please provide customer name, email, and shipping address.']);
            exit();
        }

        $orderId = !empty($data['orderId']) ? trim($data['orderId']) : ('AERO-' . rand(100000, 999999));

        try {
            $pdo->beginTransaction();

            $insertOrder = $pdo->prepare("
                INSERT INTO `orders` (`order_id`, `customer_name`, `email`, `phone`, `address`, `city`, `total_amount`, `status`)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Processing')
            ");
            $insertOrder->execute([$orderId, $customerName, $email, $phone, $address, $city, $totalAmount]);

            $insertItem = $pdo->prepare("
                INSERT INTO `order_items` (`order_id`, `product_id`, `name`, `price`, `quantity`)
                VALUES (?, ?, ?, ?, ?)
            ");

            $updateStock = $pdo->prepare("
                UPDATE `products` SET `stock` = GREATEST(0, `stock` - ?) WHERE `id` = ?
            ");

            foreach ($items as $item) {
                $pId   = $item['id'] ?? ($item['productId'] ?? 'custom-drone');
                $pName = $item['name'] ?? 'AERO Drone';
                $price = (float)($item['price'] ?? 0);
                $qty   = (int)($item['quantity'] ?? ($item['qty'] ?? 1));

                $insertItem->execute([$orderId, $pId, $pName, $price, $qty]);
                $updateStock->execute([$qty, $pId]);
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Order placed successfully!',
                'data'    => [
                    'orderId'     => $orderId,
                    'customer'    => $customerName,
                    'totalAmount' => $totalAmount,
                    'status'      => 'Processing'
                ]
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Order placement failed: ' . $e->getMessage()
            ]);
        }
        break;

    // PUT: Direct Status Update
    case 'PUT':
        $data = !empty($jsonData) ? $jsonData : $_REQUEST;
        $orderId = trim($data['orderId'] ?? ($data['order_id'] ?? ''));
        $status  = trim($data['status'] ?? 'Processing');

        if (empty($orderId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Order ID is required']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE `orders` SET `status` = ? WHERE `order_id` = ?");
        $stmt->execute([$status, $orderId]);

        echo json_encode([
            'success' => true,
            'message' => "Order #{$orderId} status set to {$status}"
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

