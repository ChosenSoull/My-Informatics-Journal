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
    $action = $data['action'] ?? '';
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';

    $allowedActions = ['registration', 'login', 'forgot-password'];
    if (empty($action) || !in_array($action, $allowedActions)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірна або відсутня дія']);
        exit();
    }
    if (empty($email) || empty($code) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255 || strlen($code) !== 6) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний формат або відсутні поля']);
        exit();
    }

    if (!verifyCode($email, $code)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Недійсний код']);
        exit();
    }

    $hashedEmail = hashData($email);

    $stmt = $conn->prepare('SELECT id, is_verified, login_key FROM users WHERE email = ?');
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

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Помилка верифікації']);
        exit();
    }

    $user = $result->fetch_assoc();
    $isVerified = (int)$user['is_verified'];
    $loginKey = $user['login_key'];

    if ($action === 'registration') {
        if ($isVerified === 1) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Користувач уже верифікований']);
            exit();
        }

        $loginKey = bin2hex(random_bytes(16));
        $stmt = $conn->prepare('UPDATE users SET login_key = ?, is_verified = 1 WHERE email = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
            exit();
        }
        $stmt->bind_param('ss', $loginKey, $hashedEmail);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка оновлення користувача']);
            $stmt->close();
            exit();
        }
        $stmt->close();

        setcookie('login-key', $loginKey, [
            'expires' => time() + 3600 * 24 * 30,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);

        http_response_code(200);
        echo json_encode(['status' => 'verified', 'message' => 'Реєстрація завершена']);
    } elseif ($action === 'login') {
        if ($isVerified !== 1) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Користувач не верифікований']);
            exit();
        }

        if (empty($loginKey)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Авторизація не вдалася: ключ доступу відсутній']);
            exit();
        }

        setcookie('login-key', $loginKey, [
            'expires' => time() + 3600 * 24 * 30,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);

        http_response_code(200);
        echo json_encode(['status' => 'verified', 'message' => 'Вхід виконано']);
    } elseif ($action === 'forgot-password') {
        if ($isVerified !== 1) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Користувач не верифікований']);
            exit();
        }

        $resetKey = substr(str_replace(['+', '/', '='], ['@', '#', '$'], base64_encode(random_bytes(24))), 0, 32);

        $hashedResetKey = password_hash($resetKey, PASSWORD_DEFAULT);

        $stmt = $conn->prepare('DELETE FROM forgot_pass WHERE email = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту для видалення старих ключів']);
            exit();
        }
        $stmt->bind_param('s', $hashedEmail);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка видалення старих ключів']);
            $stmt->close();
            exit();
        }
        $stmt->close();

        $stmt = $conn->prepare('INSERT INTO forgot_pass (email, hashed_reset_key, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту для збереження ключа']);
            exit();
        }
        $stmt->bind_param('ss', $hashedEmail, $hashedResetKey);
        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка збереження ключа']);
            $stmt->close();
            exit();
        }
        $stmt->close();

        http_response_code(200);
        echo json_encode(['status' => 'verified', 'reset_key' => $resetKey]);
    }
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>