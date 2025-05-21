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

$conn = null;
try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($name) || empty($email) || empty($password) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($name) > 255 || strlen($email) > 255 || strlen($password) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний формат або довжина полів']);
        exit();
    }

    $hashedEmail = hashData($email);
    $encryptedName = encryptData($name);
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
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

    if ($result->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Реєстрація не вдалася']);
        exit();
    }

    $defaultAvatar = '/assets/default_user_icon.png';
    $isVerified = 0;
    $stmt = $conn->prepare('INSERT INTO users (name, email, password, avatar, is_verified) VALUES (?, ?, ?, ?, ?)');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('sssii', $encryptedName, $hashedEmail, $hashedPassword, $defaultAvatar, $isVerified);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка створення користувача']);
        $stmt->close();
        exit();
    }
    $stmt->close();

    try {
        if (!generateVerificationCode($email)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка генерації або надсилання коду']);
            exit();
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка генерації або надсилання коду: ' . $e->getMessage()]);
        exit();
    }

    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Код верифікації надіслано']);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>