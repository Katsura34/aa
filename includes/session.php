<?php
/**
 * Session Security Helper
 * QuickBite Food Ordering System
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session settings
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Check if session has timed out
 */
function isSessionExpired() {
    if (isset($_SESSION['timeout']) && time() > $_SESSION['timeout']) {
        return true;
    }
    return false;
}

/**
 * Refresh session timeout
 */
function refreshSession() {
    $_SESSION['timeout'] = time() + (30 * 60); // 30 minutes
}

/**
 * Check if user is admin
 */
function isAdmin() {
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Check if user is customer
 */
function isCustomer() {
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === 'customer';
}

/**
 * Require login - redirect to login page if not logged in
 */
function requireLogin() {
    if (!isLoggedIn() || isSessionExpired()) {
        destroySession();
        header("Location: ../login.html");
        exit;
    }
    refreshSession();
}

/**
 * Require admin role
 */
function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        header("Location: ../login.html");
        exit;
    }
}

/**
 * Require customer role
 */
function requireCustomer() {
    requireLogin();
    if (!isCustomer()) {
        header("Location: ../login.html");
        exit;
    }
}

/**
 * Destroy session and logout
 */
function destroySession() {
    $_SESSION = array();
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    session_destroy();
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

/**
 * Get current username
 */
function getCurrentUsername() {
    return isset($_SESSION['username']) ? $_SESSION['username'] : null;
}

/**
 * Get current user role
 */
function getCurrentRole() {
    return isset($_SESSION['role']) ? $_SESSION['role'] : null;
}

/**
 * Sanitize input
 */
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>
