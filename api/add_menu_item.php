<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$data = getJsonInput();

if (!$data || !isset($data['name']) || !isset($data['price'])) {
    sendError('Name and price are required');
}

$name = sanitize($data['name']);
$price = (float)$data['price'];
$description = isset($data['description']) ? sanitize($data['description']) : '';
$category = isset($data['category']) ? sanitize($data['category']) : 'New Item';
$inventory_quantity = isset($data['inventory_quantity']) ? (int)$data['inventory_quantity'] : 0;

$sql = "INSERT INTO menu_items (name, description, price, category, inventory_quantity, is_available) VALUES (?, ?, ?, ?, ?, 1)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssdsi", $name, $description, $price, $category, $inventory_quantity);

if ($stmt->execute()) {
    $new_id = $conn->insert_id;
    sendSuccess(['id' => $new_id], 'Menu item added successfully');
} else {
    sendError('Failed to add menu item: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
