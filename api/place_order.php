<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$data = getJsonInput();

if (!$data || !isset($data['items']) || empty($data['items'])) {
    sendError('No items provided');
}

// Get user_id from session or use default for testing
$user_id = getCurrentUserId() ?? 1;
$total_amount = isset($data['total']) ? $data['total'] : 0;
$delivery_address = isset($data['delivery_address']) ? sanitize($data['delivery_address']) : '';

// Start transaction
$conn->begin_transaction();

try {
    // Insert order
    $sql = "INSERT INTO orders (user_id, total_amount, delivery_address, status) VALUES (?, ?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ids", $user_id, $total_amount, $delivery_address);
    $stmt->execute();
    $order_id = $conn->insert_id;
    $stmt->close();
    
    // Insert order items
    $items_sql = "INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)";
    $items_stmt = $conn->prepare($items_sql);
    
    foreach ($data['items'] as $item) {
        $menu_item_id = (int)$item['menu_item_id'];
        $quantity = (int)$item['quantity'];
        $price = (float)$item['price'];
        $items_stmt->bind_param("iiid", $order_id, $menu_item_id, $quantity, $price);
        $items_stmt->execute();
    }
    $items_stmt->close();
    
    // Commit transaction
    $conn->commit();
    
    sendSuccess(['order_id' => 'ORD-' . $order_id], 'Order placed successfully');
    
} catch (Exception $e) {
    $conn->rollback();
    sendError('Failed to place order: ' . $e->getMessage());
}

$conn->close();
?>
