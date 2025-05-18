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
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$picture = $data['picture'] ?? '';
$password = $data['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові']);
    exit();
}

$encryptedEmail = encryptData($email);
$encryptedName = encryptData($name);

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $encryptedEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Користувач із таким email уже існує']);
    exit();
}

// Завантаження аватарки
$uploadDir = 'uploads/avatars/';
$hash = substr(bin2hex(random_bytes(4)), 0, 8);
$fileName = $email . '_' . $hash . '.png';
$filePath = $uploadDir . $fileName;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$imageData = file_get_contents($picture);
if ($imageData === false || file_put_contents($filePath, $imageData) === false) {
    echo json_encode(['status' => 'error', 'message' => 'Помилка завантаження аватарки']);
    exit();
}

$avatarUrl = 'uploads/avatars/' . $fileName;
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$loginKey = bin2hex(random_bytes(16));

$stmt = $conn->prepare('INSERT INTO users (name, email, password, avatar, login_key) VALUES (?, ?, ?, ?, ?)');
$stmt->bind_param('sssss', $encryptedName, $encryptedEmail, $hashedPassword, $avatarUrl, $loginKey);
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
    unlink($filePath);
    echo json_encode(['status' => 'error', 'message' => 'Помилка збереження користувача']);
}

$conn->close();
?>