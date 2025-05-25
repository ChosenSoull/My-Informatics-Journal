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

try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $loginKey = $_COOKIE['login-key'] ?? '';
    if (empty($loginKey) || strlen($loginKey) > 255) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Відсутній або невалідний login-key']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';

    if (empty($username) || strlen($username) > 255) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Ім’я користувача обов’язкове або занадто довге']);
        exit();
    }

    $username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');

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

    $hashedEmail = $result->fetch_assoc()['email'];
    $stmt->close();

    $encryptedName = encryptData($username);

    $stmt = $conn->prepare('UPDATE users SET name = ? WHERE email = ?');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    $stmt->bind_param('ss', $encryptedName, $hashedEmail);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка виконання оновлення імені']);
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