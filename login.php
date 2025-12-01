<?php
require_once 'includes/session.php';
require_once 'config/database.php';

// Regenerate session ID for security
session_regenerate_id(true);

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: login.html");
    exit;
}

// Sanitize and validate inputs
$username = isset($_POST["username"]) ? sanitize($_POST["username"]) : '';
$password = isset($_POST["password"]) ? $_POST["password"] : '';

// Validate inputs
if (empty($username) || empty($password)) {
    echo "<script>alert('All fields are required!'); window.location='login.html';</script>";
    exit;
}

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password_hash'])) {
        // Set session variables
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["username"] = $user["username"];
        $_SESSION["email"] = $user["email"];
        $_SESSION["role"] = $user["role"];
        $_SESSION["logged_in"] = true;
        $_SESSION["login_time"] = time();
        
        // Set session timeout (30 minutes)
        $_SESSION["timeout"] = time() + (30 * 60);

        if ($user["role"] === "admin") {
            header("Location: admin_dashboard.php");
        } else {
            header("Location: customer_home.php");
        }
        exit;
    } else {
        echo "<script>alert('Incorrect password!'); window.location='login.html';</script>";
    }
} else {
    echo "<script>alert('User not found!'); window.location='login.html';</script>";
}

$stmt->close();
$conn->close();
?>
