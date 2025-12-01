<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

// Get user_id from session or use default for testing
$user_id = getCurrentUserId() ?? 1;

$sql = "SELECT o.id, o.order_date, o.status, o.total_amount, o.delivery_address 
        FROM orders o 
        WHERE o.user_id = ? 
        ORDER BY o.order_date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];

while ($row = $result->fetch_assoc()) {
    $order_id = $row['id'];
    
    // Fetch order items for this order
    $items_sql = "SELECT oi.quantity, oi.price_at_time, mi.name 
                  FROM order_items oi 
                  JOIN menu_items mi ON oi.menu_item_id = mi.id 
                  WHERE oi.order_id = ?";
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $order_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $items = [];
    while ($item_row = $items_result->fetch_assoc()) {
        $items[] = [
            'name' => $item_row['name'],
            'quantity' => (int)$item_row['quantity'],
            'price' => (float)$item_row['price_at_time']
        ];
    }
    $items_stmt->close();
    
    $orders[] = [
        'id' => 'ORD-' . $row['id'],
        'date' => $row['order_date'],
        'status' => $row['status'],
        'total' => (float)$row['total_amount'],
        'delivery_address' => $row['delivery_address'],
        'items' => $items
    ];
}

$stmt->close();

sendSuccess($orders);

$conn->close();
?>
