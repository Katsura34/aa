<?php
require_once 'includes/session.php';
require_once 'config/database.php';

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: login.html");
    exit;
}

// Sanitize and validate inputs
$username = isset($_POST["username"]) ? sanitize($_POST["username"]) : '';
$email    = isset($_POST["email"]) ? sanitize($_POST["email"]) : '';
$password = isset($_POST["password"]) ? $_POST["password"] : '';
$role     = isset($_POST["role"]) ? sanitize($_POST["role"]) : '';

// Validate inputs
if (empty($username) || empty($email) || empty($password) || empty($role)) {
    echo "<script>alert('All fields are required!'); window.location='login.html';</script>";
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "<script>alert('Invalid email format!'); window.location='login.html';</script>";
    exit;
}

// Validate role
if (!in_array($role, ['admin', 'customer'])) {
    echo "<script>alert('Invalid role selected!'); window.location='login.html';</script>";
    exit;
}

// Validate password strength (minimum 6 characters)
if (strlen($password) < 6) {
    echo "<script>alert('Password must be at least 6 characters!'); window.location='login.html';</script>";
    exit;
}

// Check if username or email already exists
$check_sql = "SELECT id FROM users WHERE username = ? OR email = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("ss", $username, $email);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    echo "<script>alert('Username or email already exists!'); window.location='login.html';</script>";
    $check_stmt->close();
    exit;
}
$check_stmt->close();

// Hash password securely
$password_hash = password_hash($password, PASSWORD_BCRYPT);

$sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $username, $email, $password_hash, $role);

if ($stmt->execute()) {
    echo "<script>alert('Account created successfully!'); window.location='login.html';</script>";
} else {
    echo "<script>alert('Error creating account. Please try again.'); window.location='login.html';</script>";
}

$stmt->close();
$conn->close();
?>
