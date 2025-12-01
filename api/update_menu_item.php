<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$data = getJsonInput();

if (!$data || !isset($data['id'])) {
    sendError('Item ID is required');
}

$id = (int)$data['id'];
$updates = [];
$params = [];
$types = '';

if (isset($data['name'])) {
    $updates[] = "name = ?";
    $params[] = sanitize($data['name']);
    $types .= 's';
}

if (isset($data['price'])) {
    $updates[] = "price = ?";
    $params[] = (float)$data['price'];
    $types .= 'd';
}

if (isset($data['description'])) {
    $updates[] = "description = ?";
    $params[] = sanitize($data['description']);
    $types .= 's';
}

if (isset($data['category'])) {
    $updates[] = "category = ?";
    $params[] = sanitize($data['category']);
    $types .= 's';
}

if (isset($data['inventory_quantity'])) {
    $updates[] = "inventory_quantity = ?";
    $params[] = (int)$data['inventory_quantity'];
    $types .= 'i';
}

if (isset($data['is_available'])) {
    $updates[] = "is_available = ?";
    $params[] = (int)$data['is_available'];
    $types .= 'i';
}

if (empty($updates)) {
    sendError('No fields to update');
}

$sql = "UPDATE menu_items SET " . implode(", ", $updates) . " WHERE id = ?";
$params[] = $id;
$types .= 'i';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendSuccess(null, 'Menu item updated successfully');
    } else {
        sendSuccess(null, 'No changes made');
    }
} else {
    sendError('Failed to update menu item: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
