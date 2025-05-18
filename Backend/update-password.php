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

$conn = getDatabaseConnection();

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$newPassword = $data['newPassword'] ?? '';

if (empty($email) || empty($newPassword) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($newPassword) > 255) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або невірний формат']);
    exit();
}

$encryptedEmail = encryptData($email);
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

$stmt = $conn->prepare('UPDATE users SET password = ?, login_key = ? WHERE email = ?');
$loginKey = bin2hex(random_bytes(16));
$stmt->bind_param('sss', $hashedPassword, $loginKey, $encryptedEmail);
if ($stmt->execute()) {
    setcookie('login-key', $loginKey, [
        'expires' => time() + 3600 * 24 * 30,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    echo json_encode(['status' => 'ok']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Помилка оновлення пароля']);
}

$conn->close();
?>