<?php
/*
 / My-Informatics-Journal - A project from Informatics class on 05/09/2025
 / Copyright (C) 2025 ChosenSoul
 /
 / This program is free software: you can redistribute it and/or modify
 / it under the terms of the GNU General Public License as published by
 / the Free Software Foundation, either version 3 of the License, or
 / (at your option) any later version.

 / This program is distributed in the hope that it will be useful,
 / but WITHOUT ANY WARRANTY; without even the implied warranty of
 / MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 / GNU General Public License for more details.

 / You should have received a copy of the GNU General Public License
 / along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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

$conn = null;
try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $newPassword = $data['newPassword'] ?? '';
    $resetKey = $data['reset_key'] ?? '';

    if (empty($email) || empty($newPassword) || empty($resetKey) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255 || strlen($newPassword) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Невірний формат або відсутні поля']);
        exit();
    }

    $hashedEmail = hashData($email);

    $stmt = $conn->prepare('SELECT hashed_reset_key FROM forgot_pass WHERE email = ? AND expires_at > NOW()');
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
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Недійсний або прострочений ключ']);
        $stmt->close();
        exit();
    }

    $row = $result->fetch_assoc();
    $stmt->close();

    if (!password_verify($resetKey, $row['hashed_reset_key'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Недійсний ключ']);
        exit();
    }

    $stmt = $conn->prepare('DELETE FROM forgot_pass WHERE email = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту для видалення ключа']);
        exit();
    }
    $stmt->bind_param('s', $hashedEmail);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка видалення ключа']);
        $stmt->close();
        exit();
    }
    $stmt->close();

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

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Помилка скидання пароля']);
        exit();
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $loginKey = bin2hex(random_bytes(16));

    $stmt = $conn->prepare('UPDATE users SET password = ?, login_key = ? WHERE email = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('sss', $hashedPassword, $loginKey, $hashedEmail);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка оновлення пароля']);
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
    echo json_encode(['status' => 'ok', 'message' => 'Пароль успішно скинуто']);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>