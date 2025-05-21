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

$conn = null;
try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $accessToken = $data['access_token'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($accessToken)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Access Token є обов’язковим']);
        exit();
    }
    if (empty($password) || strlen($password) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Пароль є обов’язковим або перевищує 255 символів']);
        exit();
    }

    $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $accessToken"
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || $response === false) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Недійсний Access Token']);
        exit();
    }

    $userInfo = json_decode($response, true);
    if (!$userInfo || empty($userInfo['email'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Не вдалося отримати інформацію про користувача']);
        exit();
    }

    $email = $userInfo['email'] ?? '';
    $name = $userInfo['name'] ?? '';
    $picture = $userInfo['picture'] ?? '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний або недійсний email']);
        exit();
    }
    if (empty($name) || strlen($name) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірне або недійсне ім’я']);
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
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Користувач із таким email уже існує']);
        exit();
    }

    $uploadDir = 'uploads/avatars/';
    $hash = substr(bin2hex(random_bytes(4)), 0, 8);
    $fileName = $hashedEmail . '_' . $hash . '.png';
    $filePath = $uploadDir . $fileName;

    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка створення директорії']);
            exit();
        }
    }

    $ch = curl_init($picture);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_MAXFILESIZE, 2 * 1024 * 1024);
    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || $imageData === false || strlen($imageData) > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Помилка завантаження аватарки']);
        exit();
    }

    $finfo = finfo_open();
    $mimeType = finfo_buffer($finfo, $imageData, FILEINFO_MIME_TYPE);
    finfo_close($finfo);
    if (!in_array($mimeType, ['image/png', 'image/jpeg'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Недозволений тип аватарки']);
        exit();
    }

    if (file_put_contents($filePath, $imageData) === false) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка збереження аватарки']);
        exit();
    }

    $avatarUrl = '/uploads/avatars/' . $fileName;
    $loginKey = bin2hex(random_bytes(16));
    $isVerified = 1;

    $stmt = $conn->prepare('INSERT INTO users (name, email, password, avatar, login_key, is_verified) VALUES (?, ?, ?, ?, ?, ?)');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        unlink($filePath);
        exit();
    }
    $stmt->bind_param('sssisi', $encryptedName, $hashedEmail, $hashedPassword, $avatarUrl, $loginKey, $isVerified);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка створення користувача']);
        $stmt->close();
        unlink($filePath);
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
    echo json_encode(['status' => 'ok', 'message' => 'Успішна реєстрація']);
} catch (Exception $e) {
    error_log('Помилка: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Внутрішня помилка сервера: ' . $e->getMessage()]);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>