<?php
// AERO-X Authentication API
// Handles Login, Customer Registration, and User Listing

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true) ?? [];
$action   = $_GET['action'] ?? ($jsonData['action'] ?? ($_POST['action'] ?? ''));

switch ($method) {

    // GET: List users
    case 'GET':
        $stmt = $pdo->query("SELECT `id`, `name`, `email`, `phone`, `address`, `role`, `created_at` FROM `users` ORDER BY `id` ASC");
        $users = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count'   => count($users),
            'data'    => $users
        ]);
        break;

    // POST: Login or Register
    case 'POST':
        $data = !empty($jsonData) ? $jsonData : $_POST;

        if ($action === 'register') {
            // Register Customer
            $name     = trim($data['name'] ?? '');
            $email    = strtolower(trim($data['email'] ?? ''));
            $password = trim($data['password'] ?? '');
            $phone    = trim($data['phone'] ?? '');
            $address  = trim($data['address'] ?? '');

            if (empty($name) || empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Please provide name, email, and password.']);
                exit();
            }

            // Check if user already exists
            $checkStmt = $pdo->prepare("SELECT id FROM `users` WHERE `email` = ?");
            $checkStmt->execute([$email]);
            if ($checkStmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'An account with this email address already exists.']);
                exit();
            }

            $insertStmt = $pdo->prepare("
                INSERT INTO `users` (`name`, `email`, `password`, `phone`, `address`, `role`)
                VALUES (?, ?, ?, ?, ?, 'customer')
            ");
            $insertStmt->execute([$name, $email, $password, $phone, $address]);
            $newId = $pdo->lastInsertId();

            $user = [
                'id'      => (int)$newId,
                'name'    => $name,
                'email'   => $email,
                'phone'   => $phone,
                'address' => $address,
                'role'    => 'customer'
            ];

            echo json_encode([
                'success' => true,
                'message' => "Welcome to AERO-X, {$name}!",
                'user'    => $user
            ]);
            break;
        }

        // Login (Customer or Admin)
        $email    = strtolower(trim($data['email'] ?? ''));
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT `id`, `name`, `email`, `password`, `phone`, `address`, `role` FROM `users` WHERE `email` = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && $user['password'] === $password) {
            unset($user['password']); // don't return password
            echo json_encode([
                'success' => true,
                'message' => "Welcome back, {$user['name']}!",
                'user'    => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password.'
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

