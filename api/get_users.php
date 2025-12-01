<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

// Only admins can view users
if (!isAdmin()) {
    sendError('Unauthorized access', 403);
}

$sql = "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC";
$result = $conn->query($sql);

$users = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => (int)$row['id'],
            'username' => $row['username'],
            'email' => $row['email'],
            'role' => $row['role'],
            'created_at' => $row['created_at']
        ];
    }
}

sendSuccess($users);

$conn->close();
?>
