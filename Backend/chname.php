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
$username = $data['username'] ?? '';
$loginKey = $data['loginKey'] ?? '';

if (empty($username) || empty($loginKey) || strlen($username) > 255 || strlen($loginKey) > 255) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або занадто довгі']);
    exit();
}

$username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');

$stmt = $conn->prepare('SELECT email FROM users WHERE login_key = ?');
$stmt->bind_param('s', $loginKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний loginKey']);
    exit();
}

$hashedEmail = $result->fetch_assoc()['email'];
$encryptedName = encryptData($username);

$stmt = $conn->prepare('UPDATE users SET name = ? WHERE email = ?');
$stmt->bind_param('ss', $encryptedName, $hashedEmail);
if ($stmt->execute()) {
    echo json_encode(['status' => 'ok']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Помилка зміни імені']);
}

$conn->close();
?>