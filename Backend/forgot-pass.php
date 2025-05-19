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

try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';

    // Перевірка вхідних даних (email)
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний, відсутній або занадто довгий email']);
        exit();
    }

    $hashedEmail = hashData($email);

    // Перевірка наявності користувача
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

    // Завжди повертаємо однакове повідомлення, незалежно від наявності користувача
    if ($result->num_rows === 0) {
        // Користувача не знайдено, але повертаємо те саме повідомлення для безпеки
        echo json_encode(['status' => 'ok', 'message' => 'Код надіслано, якщо email зареєстровано']);
        exit();
    }
    
    // Користувач існує, генеруємо та надсилаємо код
    if (!generateVerificationCode($email)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка генерації або надсилання коду']);
        exit();
    }

    echo json_encode(['status' => 'ok', 'message' => 'Код надіслано, якщо email зареєстровано']);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>