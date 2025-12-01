<?php
/**
 * API Response Helper
 * QuickBite Food Ordering System
 */

/**
 * Send JSON response
 */
function sendResponse($success, $data = null, $message = '') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type');
    
    $response = ['success' => $success];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    if ($message) {
        $response['message'] = $message;
    }
    
    echo json_encode($response);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $code = 400) {
    http_response_code($code);
    sendResponse(false, null, $message);
}

/**
 * Send success response
 */
function sendSuccess($data = null, $message = '') {
    sendResponse(true, $data, $message);
}

/**
 * Get JSON input data
 */
function getJsonInput() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

/**
 * Validate required fields
 */
function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return false;
        }
    }
    return true;
}
?>
