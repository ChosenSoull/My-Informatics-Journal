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

$conn = getDatabaseConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
    exit();
}

$loginKey = $_COOKIE['login-key'] ?? '';
if (empty($loginKey) || strlen($loginKey) > 255) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Невірний або відсутній login-key']);
    exit();
}

$stmt = $conn->prepare('SELECT name, avatar FROM users WHERE login_key = ?');
$stmt->bind_param('s', $loginKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Невірний login-key']);
    exit();
}

$user = $result->fetch_assoc();
echo json_encode([
    'status' => 'ok',
    'name' => htmlspecialchars(decryptData($user['name']), ENT_QUOTES, 'UTF-8'),
    'avatarsrc' => htmlspecialchars($user['avatar'] ?: '/assets/default_user_icon.png', ENT_QUOTES, 'UTF-8')
]);

$conn->close();
?>