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
    $currentPassword = $data['currentPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';

    // Перевірка вхідних даних
    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Усі поля (поточний та новий пароль) обов’язкові']);
        exit();
    }
    if (strlen($newPassword) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Новий пароль занадто довгий']);
        exit();
    }
    // Валідація складності нового пароля
    if (strlen($newPassword) < 8 || !preg_match('/[0-9]/', $newPassword) || !preg_match('/[a-zA-Z]/', $newPassword)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Новий пароль має містити щонайменше 8 символів, одну літеру та одну цифру']);
        exit();
    }

    // Отримуємо email та поточний пароль користувача
    $stmt = $conn->prepare('SELECT email, password FROM users WHERE login_key = ?');
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

    $row = $result->fetch_assoc();
    $hashedEmail = $row['email'];
    $storedPasswordHash = $row['password'];
    $stmt->close();

    // Перевірка поточного пароля
    if (!password_verify($currentPassword, $storedPasswordHash)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний поточний пароль']);
        exit();
    }

    // Хешування нового пароля
    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $stmt = $conn->prepare('UPDATE users SET password = ? WHERE email = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('ss', $hashedNewPassword, $hashedEmail);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка виконання оновлення пароля']);
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