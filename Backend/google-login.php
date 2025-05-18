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
$accessToken = $data['accessToken'] ?? '';

if (empty($email) || empty($accessToken) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або невірний email']);
    exit();
}

$clientId = ''; // Замініть на ваш clientId
$client = new Google_Client(['client_id' => $clientId]);
$payload = $client->verifyIdToken($accessToken);
if (!$payload || $payload['email'] !== $email) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний токен Google']);
    exit();
}

$encryptedEmail = encryptData($email);

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $encryptedEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Користувача не знайдено']);
    exit();
}

$loginKey = bin2hex(random_bytes(16));
setcookie('login-key', $loginKey, [
    'expires' => time() + 3600 * 24 * 30,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict'
]);

$stmt = $conn->prepare('UPDATE users SET login_key = ? WHERE email = ?');
$stmt->bind_param('ss', $loginKey, $encryptedEmail);
$stmt->execute();

echo json_encode(['status' => 'ok']);
$conn->close();
?>