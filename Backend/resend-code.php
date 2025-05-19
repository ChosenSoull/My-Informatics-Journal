<?php
header('Content-Type: application/json; charset=UTF-8');

$allowedOrigin = 'https://chosensoul.kesug.com';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== $allowedOrigin) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Недозволений домен']);
    exit();
}

header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'utils/encryption.php';
require_once 'utils/two_factor_auth.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';

    // Повна валідація email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний або недійсний email']);
        exit();
    }

    // Виклик resendCode з обробкою результату
    if (!resendCode($email)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка повторного надсилання коду']);
        exit();
    }

    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Якщо email зареєстровано, код надіслано.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Внутрішня помилка сервера: ' . $e->getMessage()]);
}
?>