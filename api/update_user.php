<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

// Only admins can update users
if (!isAdmin()) {
    sendError('Unauthorized access', 403);
}

$data = getJsonInput();

if (!$data || !isset($data['id'])) {
    sendError('User ID is required');
}

$id = (int)$data['id'];
$updates = [];
$params = [];
$types = '';

if (isset($data['username'])) {
    // Check if username already exists for another user
    $check_sql = "SELECT id FROM users WHERE username = ? AND id != ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("si", $data['username'], $id);
    $check_stmt->execute();
    if ($check_stmt->get_result()->num_rows > 0) {
        sendError('Username already exists');
    }
    $check_stmt->close();
    
    $updates[] = "username = ?";
    $params[] = sanitize($data['username']);
    $types .= 's';
}

if (isset($data['email'])) {
    // Check if email already exists for another user
    $check_sql = "SELECT id FROM users WHERE email = ? AND id != ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("si", $data['email'], $id);
    $check_stmt->execute();
    if ($check_stmt->get_result()->num_rows > 0) {
        sendError('Email already exists');
    }
    $check_stmt->close();
    
    $updates[] = "email = ?";
    $params[] = sanitize($data['email']);
    $types .= 's';
}

if (isset($data['role']) && in_array($data['role'], ['customer', 'admin'])) {
    $updates[] = "role = ?";
    $params[] = $data['role'];
    $types .= 's';
}

if (isset($data['password']) && !empty($data['password'])) {
    $updates[] = "password_hash = ?";
    $params[] = password_hash($data['password'], PASSWORD_BCRYPT);
    $types .= 's';
}

if (empty($updates)) {
    sendError('No fields to update');
}

$sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
$params[] = $id;
$types .= 'i';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendSuccess(null, 'User updated successfully');
    } else {
        sendSuccess(null, 'No changes made');
    }
} else {
    sendError('Failed to update user: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
