<?php
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
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=UTF-8');

    $loginKey = $_COOKIE['login-key'] ?? '';
    if (empty($loginKey) || strlen($loginKey) > 255) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Невірний або відсутній login-key']);
        $conn->close();
        exit();
    }

    $stmt = $conn->prepare('SELECT email, avatar FROM users WHERE login_key = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        $conn->close();
        exit();
    }
    $stmt->bind_param('s', $loginKey);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка виконання запиту до бази даних']);
        $stmt->close();
        $conn->close();
        exit();
    }
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Невірний login-key']);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $hashedEmail = $user['email'];
    $currentAvatarPathFromDB = $user['avatar'] ?: '/assets/default_user_icon.png';
    $stmt->close();

    if (!isset($_FILES['avatar'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Файл аватара відсутній']);
        $conn->close();
        exit();
    }

    $file = $_FILES['avatar'];
    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Файл занадто великий']);
        $conn->close();
        exit();
    }

    $allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($file['tmp_name']);
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Недозволений тип файлу']);
        $conn->close();
        exit();
    }

    $extensionMap = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    $extension = $extensionMap[$fileType] ?? 'png';
    $uploadDir = 'uploads/avatars/';
    $hash = substr(bin2hex(random_bytes(4)), 0, 8);
    $fileName = $hashedEmail . '_' . $hash . '.' . $extension;
    $filePath = $uploadDir . $fileName;

    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Не вдалося створити директорію для завантаження']);
            $conn->close();
            exit();
        }
    }

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        $avatarUrl = '/uploads/avatars/' . $fileName;

        if ($currentAvatarPathFromDB !== '/assets/default_user_icon.png') {
            $oldFileName = basename($currentAvatarPathFromDB);
            $oldFilePath = $uploadDir . $oldFileName;
            $realOldPath = realpath($oldFilePath);

            if ($realOldPath && strpos($realOldPath, realpath($uploadDir)) === 0) {
                if (file_exists($realOldPath)) {
                    unlink($realOldPath);
                }
            }
        }

        $stmt = $conn->prepare('UPDATE users SET avatar = ? WHERE email = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
            unlink($filePath);
            $conn->close();
            exit();
        }
        $stmt->bind_param('ss', $avatarUrl, $hashedEmail);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'ok']);
        } else {
            unlink($filePath);
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Помилка оновлення аватарки']);
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка завантаження файлу']);
        $conn->close();
        exit();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $loginKey = $_COOKIE['login-key'] ?? '';
    if (empty($loginKey) || strlen($loginKey) > 255) {
        http_response_code(401);
        $conn->close();
        exit();
    }

    $stmt = $conn->prepare('SELECT email, avatar FROM users WHERE login_key = ?');
    if (!$stmt) {
        http_response_code(500);
        $conn->close();
        exit();
    }
    $stmt->bind_param('s', $loginKey);
    if (!$stmt->execute()) {
        http_response_code(500);
        $stmt->close();
        $conn->close();
        exit();
    }
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $currentAvatarPathFromDB = $user['avatar'] ?: '/assets/default_user_icon.png';
    $stmt->close();

    $fileName = basename($currentAvatarPathFromDB);
    $filePath = 'uploads/avatars/' . $fileName;
    $realFilePath = realpath($filePath);

    if ($realFilePath && strpos($realFilePath, realpath('uploads/avatars/')) === 0 && file_exists($realFilePath)) {
        $extension = pathinfo($realFilePath, PATHINFO_EXTENSION);
        $mimeMap = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp'
        ];
        $contentType = $mimeMap[$extension] ?? 'image/png';
        header('Content-Type: ' . $contentType);
        readfile($realFilePath);
    } else {
        header('Content-Type: image/png');
        readfile($_SERVER['DOCUMENT_ROOT'] . '/assets/default_user_icon.png');
    }
}

$conn->close();
?>