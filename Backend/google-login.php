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
require_once 'vendor/autoload.php'; // Для Google API Client

use Google_Client;
use Google_Exception;

$conn = null;
try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $idToken = $data['id_token'] ?? '';

    if (empty($idToken)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID Token є обов’язковим']);
        exit();
    }

    // Верифікація Google ID Token
    $client = new Google_Client(['client_id' => 'YOUR_GOOGLE_CLIENT_ID']); // Замінити на ваш Client ID
    $payload = $client->verifyIdToken($idToken);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Недійсний ID Token']);
        exit();
    }

    $email = $payload['email'] ?? '';

    // Валідація email із токена
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний або занадто довгий email у токені']);
        exit();
    }

    $hashedEmail = hashData($email);

    // Перевірка наявності користувача та отримання login_key
    $stmt = $conn->prepare('SELECT login_key FROM users WHERE email = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('s', $hashedEmail);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка виконання запиту до бази даних']);
        $stmt->close();
        exit();
    }
    $result = $stmt->get_result();
    $stmt->close();

    // Якщо користувача немає, повертаємо загальне повідомлення
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Авторизація не вдалася']);
        exit();
    }

    // Отримання login_key
    $row = $result->fetch_assoc();
    $loginKey = $row['login_key'];

    // Перевірка, чи є login_key
    if (empty($loginKey)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Авторизація не вдалася: ключ доступу відсутній']);
        exit();
    }

    // Встановлення кукі
    setcookie('login-key', $loginKey, [
        'expires' => time() + 3600 * 24 * 30,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Успішна авторизація']);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>