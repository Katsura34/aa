<?php
require_once '../includes/session.php';
require_once '../includes/api_helpers.php';
require_once '../config/database.php';

$date = isset($_GET['date']) ? sanitize($_GET['date']) : date('Y-m-d');

// Get sales report for the date
$sql = "SELECT sr.*, mi.name as top_item_name 
        FROM sales_reports sr 
        LEFT JOIN menu_items mi ON sr.top_item_id = mi.id 
        WHERE sr.report_date = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();
$report = $result->fetch_assoc();
$stmt->close();

// Get orders for the date
$orders_sql = "SELECT o.*, u.username as customer_name 
               FROM orders o 
               JOIN users u ON o.user_id = u.id 
               WHERE DATE(o.order_date) = ?";
$orders_stmt = $conn->prepare($orders_sql);
$orders_stmt->bind_param("s", $date);
$orders_stmt->execute();
$orders_result = $orders_stmt->get_result();

$orders = [];
$calculated_revenue = 0;

while ($row = $orders_result->fetch_assoc()) {
    $order_id = $row['id'];
    
    // Fetch order items
    $items_sql = "SELECT oi.quantity, mi.name 
                  FROM order_items oi 
                  JOIN menu_items mi ON oi.menu_item_id = mi.id 
                  WHERE oi.order_id = ?";
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $order_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $items = [];
    while ($item_row = $items_result->fetch_assoc()) {
        $items[] = [
            'name' => $item_row['name'],
            'quantity' => (int)$item_row['quantity']
        ];
    }
    $items_stmt->close();
    
    $calculated_revenue += (float)$row['total_amount'];
    
    $orders[] = [
        'id' => 'ORD-' . $row['id'],
        'customer_name' => $row['customer_name'],
        'order_date' => $row['order_date'],
        'status' => $row['status'],
        'total_amount' => (float)$row['total_amount'],
        'items' => $items
    ];
}
$orders_stmt->close();

$response = [
    'report' => $report ? [
        'total_orders' => (int)$report['total_orders'],
        'total_revenue' => (float)$report['total_revenue'],
        'top_item' => $report['top_item_name'] ?? 'N/A'
    ] : [
        'total_orders' => count($orders),
        'total_revenue' => $calculated_revenue,
        'top_item' => 'N/A'
    ],
    'orders' => $orders
];

sendSuccess($response);

$conn->close();
?>
