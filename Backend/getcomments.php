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
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'utils/connection.php';
require_once 'utils/encryption.php';

$conn = getDatabaseConnection();

$stmt = $conn->prepare('SELECT c.id, c.message, c.name, c.avatar FROM comments c ORDER BY c.created_at DESC');
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = [
        'id' => $row['id'],
        'message' => htmlspecialchars($row['message'], ENT_QUOTES, 'UTF-8'),
        'name' => htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8'),
        'avatar' => htmlspecialchars($row['avatar'] ?: '/assets/default_user_icon.png', ENT_QUOTES, 'UTF-8')
    ];
}

echo json_encode($comments);
$conn->close();
?>