<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$status = isset($_GET['status']) ? sanitize($_GET['status']) : null;

$sql = "SELECT o.*, u.username as customer_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id";

if ($status) {
    $sql .= " WHERE o.status = ?";
}

$sql .= " ORDER BY o.order_date DESC";

if ($status) {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $status);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
}

$orders = [];

while ($row = $result->fetch_assoc()) {
    $order_id = $row['id'];
    
    // Fetch order items
    $items_sql = "SELECT oi.quantity, mi.name 
                  FROM order_items oi 
                  JOIN menu_items mi ON oi.menu_item_id = mi.id 
                  WHERE oi.order_id = ?";
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $order_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $items = [];
    $items_text = [];
    while ($item_row = $items_result->fetch_assoc()) {
        $items[] = [
            'name' => $item_row['name'],
            'quantity' => (int)$item_row['quantity']
        ];
        $items_text[] = $item_row['name'] . ' x ' . $item_row['quantity'];
    }
    $items_stmt->close();
    
    $orders[] = [
        'id' => 'ORD' . str_pad($row['id'], 13, '0', STR_PAD_LEFT),
        'student' => $row['customer_name'],
        'items' => implode(', ', $items_text),
        'amount' => (float)$row['total_amount'],
        'status' => strtoupper($row['status']),
        'order_date' => $row['order_date'],
        'items_detail' => $items
    ];
}

if (isset($stmt)) {
    $stmt->close();
}

sendSuccess($orders);

$conn->close();
?>
