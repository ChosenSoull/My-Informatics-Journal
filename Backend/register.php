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
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($name) || empty($email) || empty($password) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($name) > 255 || strlen($password) > 255) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або невірний формат']);
    exit();
}

$encryptedEmail = encryptData($email);
$encryptedName = encryptData($name);

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $encryptedEmail);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Користувач із таким email уже існує']);
    exit();
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$loginKey = bin2hex(random_bytes(16));

$stmt = $conn->prepare('INSERT INTO users (name, email, password, avatar, login_key) VALUES (?, ?, ?, ?, ?)');
$defaultAvatar = '/assets/default_user_icon.png';
$stmt->bind_param('sssss', $encryptedName, $encryptedEmail, $hashedPassword, $defaultAvatar, $loginKey);
if (!$stmt->execute()) {
    echo json_encode(['status' => 'error', 'message' => 'Помилка збереження користувача']);
    exit();
}

generateVerificationCode($email);

echo json_encode(['status' => 'ok']);
$conn->close();
?>