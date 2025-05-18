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

require_once 'utils/connection.php';
require_once 'utils/encryption.php';
require_once 'utils/two_factor_auth.php';

$conn = getDatabaseConnection();

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$code = $data['code'] ?? '';

if (empty($email) || empty($code) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або невірний email']);
    exit();
}

if (!verifyCode($email, $code)) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний код']);
    exit();
}

$hashedEmail = hashData($email);
$loginKey = bin2hex(random_bytes(16));
setcookie('login-key', $loginKey, [
    'expires' => time() + 3600 * 24 * 30,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict'
]);

$stmt = $conn->prepare('UPDATE users SET login_key = ? WHERE email = ?');
$stmt->bind_param('ss', $loginKey, $hashedEmail);
$stmt->execute();

echo json_encode(['status' => 'verified']);
$conn->close();
?>