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
$password = $data['password'] ?? '';

if (empty($email) || empty($password) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) > 255) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або невірний email/пароль']);
    exit();
}

$encryptedEmail = encryptData($email);

$stmt = $conn->prepare('SELECT password FROM users WHERE email = ?');
$stmt->bind_param('s', $encryptedEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Користувача не знайдено']);
    exit();
}

$row = $result->fetch_assoc();
if (!password_verify($password, $row['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний пароль']);
    exit();
}

generateVerificationCode($email);

echo json_encode(['status' => 'ok']);
$conn->close();
?>