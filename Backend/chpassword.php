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
$currentPassword = $data['currentPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';
$loginKey = $data['loginKey'] ?? '';

if (empty($currentPassword) || empty($newPassword) || empty($loginKey) || strlen($newPassword) > 255) {
    echo json_encode(['status' => 'error', 'message' => 'Усі поля обов’язкові або пароль занадто довгий']);
    exit();
}

$stmt = $conn->prepare('SELECT email, password FROM users WHERE login_key = ?');
$stmt->bind_param('s', $loginKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний loginKey']);
    exit();
}

$row = $result->fetch_assoc();
$hashedEmail = $row['email'];
$hashedCurrentPassword = hashData($currentPassword);
if ($hashedCurrentPassword !== $row['password']) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний поточний пароль']);
    exit();
}

$hashedNewPassword = hashData($newPassword);
$stmt = $conn->prepare('UPDATE users SET password = ? WHERE email = ?');
$stmt->bind_param('ss', $hashedNewPassword, $hashedEmail);
if ($stmt->execute()) {
    echo json_encode(['status' => 'ok']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Помилка зміни пароля']);
}

$conn->close();
?>