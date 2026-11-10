<?php
// ========================================================
// AERO-X Admin Statistics API
// ========================================================

require_once __DIR__ . '/db.php';

try {
    // 1. Total products count
    $stmtProd = $pdo->query("SELECT COUNT(*) AS total FROM `products`");
    $productsCount = (int)$stmtProd->fetchColumn();

    // 2. Total orders count
    $stmtOrders = $pdo->query("SELECT COUNT(*) AS total FROM `orders`");
    $ordersCount = (int)$stmtOrders->fetchColumn();

    // 3. Total customers count
    $stmtUsers = $pdo->query("SELECT COUNT(*) AS total FROM `users` WHERE `role` = 'customer'");
    $customersCount = (int)$stmtUsers->fetchColumn();

    // 4. Calculate total revenue from orders
    $stmtAllOrders = $pdo->query("SELECT `total_amount` FROM `orders`");
    $allOrders = $stmtAllOrders->fetchAll();

    $totalRevenue = 0.0;
    foreach ($allOrders as $ord) {
        // Strip out non-numeric characters e.g. "Rs.", commas
        $cleaned = preg_replace('/[^0-9.]/', '', $ord['total_amount']);
        $totalRevenue += (float)$cleaned;
    }

    echo json_encode([
        'success'        => true,
        'revenue'        => $totalRevenue,
        'revenueFormatted' => 'Rs. ' . number_format($totalRevenue),
        'productsCount'  => $productsCount,
        'ordersCount'    => $ordersCount,
        'customersCount' => $customersCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to calculate stats: ' . $e->getMessage()
    ]);
}

