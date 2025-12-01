<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

// Only admins can delete users
if (!isAdmin()) {
    sendError('Unauthorized access', 403);
}

$data = getJsonInput();

if (!$data || !isset($data['id'])) {
    sendError('User ID is required');
}

$id = (int)$data['id'];

// Prevent deleting the current logged-in user
if ($id === getCurrentUserId()) {
    sendError('You cannot delete your own account');
}

$sql = "DELETE FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendSuccess(null, 'User deleted successfully');
    } else {
        sendError('User not found', 404);
    }
} else {
    sendError('Failed to delete user: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>
