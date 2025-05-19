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

try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    // Перевірка автентифікації (loginKey)
    $loginKey = $_COOKIE['login-key'] ?? '';
    if (empty($loginKey) || strlen($loginKey) > 255) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Відсутній або невалідний login-key']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $message = $data['message'] ?? '';

    // Перевірка вхідних даних
    if (empty($message) || strlen($message) > 1000) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Повідомлення обов’язкове або занадто довге']);
        exit();
    }

    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    // Отримуємо email користувача
    $stmt = $conn->prepare('SELECT email FROM users WHERE login_key = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('s', $loginKey);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка виконання запиту до бази даних']);
        $stmt->close();
        exit();
    }
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Невірний login-key']);
        $stmt->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $hashedEmail = $user['email'];
    $stmt->close();

    // Зберігаємо коментар із email як ідентифікатором користувача
    $stmt = $conn->prepare('INSERT INTO comments (email, message) VALUES (?, ?)');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('ss', $hashedEmail, $message);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка збереження коментаря']);
        $stmt->close();
        exit();
    }

    echo json_encode(['status' => 'ok']);
    $stmt->close();
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>