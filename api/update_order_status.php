<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$data = getJsonInput();

if (!$data || !isset($data['order_id']) || !isset($data['status'])) {
    sendError('Order ID and status are required');
}

// Extract numeric ID from ORD-XX format if needed
$order_id = $data['order_id'];
if (strpos($order_id, 'ORD-') === 0) {
    $order_id = substr($order_id, 4);
}
$order_id = (int)$order_id;

$status = sanitize($data['status']);
$valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

if (!in_array($status, $valid_statuses)) {
    sendError('Invalid status');
}

$sql = "UPDATE orders SET status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $order_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendSuccess(null, 'Order status updated successfully');
    } else {
        sendError('Order not found', 404);
    }
} else {
    sendError('Failed to update order status: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
