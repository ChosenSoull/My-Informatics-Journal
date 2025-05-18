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
$message = $data['message'] ?? '';
$loginKey = $data['loginKey'] ?? '';

if (empty($message) || empty($loginKey) || strlen($message) > 1000 || strlen($loginKey) > 255) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або повідомлення занадто довге']);
    exit();
}

$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$stmt = $conn->prepare('SELECT email, name, avatar FROM users WHERE login_key = ?');
$stmt->bind_param('s', $loginKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний loginKey']);
    exit();
}

$user = $result->fetch_assoc();
$hashedEmail = $user['email'];
$name = decryptData($user['name']);
$avatar = $user['avatar'] ?: '/assets/default_user_icon.png';

$stmt = $conn->prepare('INSERT INTO comments (email, name, avatar, message) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $hashedEmail, $name, $avatar, $message);
if ($stmt->execute()) {
    echo json_encode(['status' => 'ok']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Помилка збереження коментаря']);
}

$conn->close();
?>