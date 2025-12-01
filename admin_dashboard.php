<?php
require_once 'includes/session.php';
requireAdmin();

// Redirect to the admin dashboard view
header("Location: views/admin/dashboard.php");
exit;
?>
