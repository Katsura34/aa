<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$data = getJsonInput();

if (!$data || !isset($data['id'])) {
    sendError('Item ID is required');
}

$id = (int)$data['id'];

$sql = "DELETE FROM menu_items WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendSuccess(null, 'Menu item deleted successfully');
    } else {
        sendError('Menu item not found', 404);
    }
} else {
    sendError('Failed to delete menu item: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
