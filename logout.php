<?php
require_once 'includes/session.php';

// Destroy the session
destroySession();

// Redirect to login page
header("Location: login.html");
exit;
?>
