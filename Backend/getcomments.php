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
header("Access-Control-Allow-Origin: https://chosensoul.kesug.com");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'utils/connection.php';
require_once 'utils/encryption.php';
$cleanupScriptPath = __DIR__ . '/utils/cleanup_data.php';

if (file_exists($cleanupScriptPath)) {
    try {
        include_once $cleanupScriptPath;
    } catch (Exception $e) {
    }
}

$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/comments_cache.json';
$cacheTTL = 120; // 2 хвилини

if (!file_exists($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

if (file_exists($cacheFile)) {
    $cacheTime = filemtime($cacheFile);
    if (time() - $cacheTime < $cacheTTL) {
        echo file_get_contents($cacheFile);
        exit();
    }
}

try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка сервера']);
        exit();
    }

    $stmt = $conn->prepare('SELECT c.id, u.avatar, u.name, c.message FROM comments c JOIN users u ON c.email = u.email ORDER BY c.created_at DESC');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка сервера']);
        exit();
    }

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка сервера']);
        $stmt->close();
        exit();
    }

    $result = $stmt->get_result();
    $stmt->close();

    $comments = [];
    while ($row = $result->fetch_assoc()) {
        $comments[] = [
            'id' => $row['id'],
            'avatar' => htmlspecialchars($row['avatar'] ?: '/assets/default_user_icon.png', ENT_QUOTES, 'UTF-8'),
            'name' => htmlspecialchars(decryptData($row['name']), ENT_QUOTES, 'UTF-8'),
            'message' => htmlspecialchars($row['message'], ENT_QUOTES, 'UTF-8')
        ];
    }

    $jsonResponse = json_encode($comments);
    file_put_contents($cacheFile, $jsonResponse);
    echo $jsonResponse;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Помилка сервера']);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
    exit();
}
?>