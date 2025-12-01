<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

// Only admins can add users
if (!isAdmin()) {
    sendError('Unauthorized access', 403);
}

$data = getJsonInput();

if (!$data || !isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    sendError('Username, email and password are required');
}

$username = sanitize($data['username']);
$email = sanitize($data['email']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$role = isset($data['role']) && in_array($data['role'], ['customer', 'admin']) ? $data['role'] : 'customer';

// Check if username already exists
$check_sql = "SELECT id FROM users WHERE username = ? OR email = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("ss", $username, $email);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    sendError('Username or email already exists');
}
$check_stmt->close();

$sql = "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $username, $password, $email, $role);

if ($stmt->execute()) {
    $new_id = $conn->insert_id;
    sendSuccess(['id' => $new_id], 'User added successfully');
} else {
    sendError('Failed to add user: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
