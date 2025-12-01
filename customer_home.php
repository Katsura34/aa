<?php
require_once 'includes/session.php';
requireCustomer();

// Redirect to the customer dashboard view
header("Location: views/customer/dashboard.php");
exit;
?>
