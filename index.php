<?php
/**
 * QuickBite Food Ordering System
 * Main entry point - redirects to login or dashboard
 */

require_once 'includes/session.php';

// Check if user is already logged in
if (isLoggedIn() && !isSessionExpired()) {
    // Redirect based on role
    if (isAdmin()) {
        header("Location: admin_dashboard.php");
    } else {
        header("Location: customer_home.php");
    }
    exit;
}

// Redirect to login page
header("Location: login.html");
exit;
?>
