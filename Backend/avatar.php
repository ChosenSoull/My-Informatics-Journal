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
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'utils/connection.php';
require_once 'utils/encryption.php';

$conn = getDatabaseConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $loginKey = $_POST['loginKey'] ?? '';
    if (empty($loginKey) || strlen($loginKey) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний або відсутній loginKey']);
        exit();
    }

    $stmt = $conn->prepare('SELECT email FROM users WHERE login_key = ?');
    $stmt->bind_param('s', $loginKey);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Невірний loginKey']);
        exit();
    }

    $hashedEmail = $result->fetch_assoc()['email'];

    if (!isset($_FILES['avatar'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Файл аватара відсутній']);
        exit();
    }

    $file = $_FILES['avatar'];
    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Файл занадто великий']);
        exit();
    }

    $allowedTypes = ['image/png', 'image/jpeg'];
    $fileType = mime_content_type($file['tmp_name']);
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Недозволений тип файлу']);
        exit();
    }

    $uploadDir = 'uploads/avatars/';
    $hash = substr(bin2hex(random_bytes(4)), 0, 8);
    $fileName = $hashedEmail . '_' . $hash . '.png';
    $filePath = $uploadDir . $fileName;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        $avatarUrl = '/uploads/avatars/' . $fileName;
        $stmt = $conn->prepare('UPDATE users SET avatar = ? WHERE email = ?');
        $stmt->bind_param('ss', $avatarUrl, $hashedEmail);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'ok']);
        } else {
            unlink($filePath);
            echo json_encode(['status' => 'error', 'message' => 'Помилка оновлення аватарки']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка завантаження файлу']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $loginKey = $_GET['loginKey'] ?? '';
    if (empty($loginKey) || strlen($loginKey) > 255) {
        http_response_code(400);
        exit();
    }

    $stmt = $conn->prepare('SELECT email FROM users WHERE login_key = ?');
    $stmt->bind_param('s', $loginKey);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        exit();
    }

    $hashedEmail = $result->fetch_assoc()['email'];
    $filePath = 'uploads/avatars/' . $hashedEmail . '_' . $hash . '.png';

    if (file_exists($filePath)) {
        header('Content-Type: image/png');
        readfile($filePath);
    } else {
        header('Content-Type: image/png');
        readfile('assets/default_user_icon.png');
    }
}

$conn->close();
?>