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

$cleanupScriptPath = __DIR__ . '/utils/cleanup_data.php';

if (file_exists($cleanupScriptPath)) {
    include_once $cleanupScriptPath;
}

try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підключення до бази даних']);
        exit();
    }

    $stmt = $conn->prepare('SELECT c.id, c.message, u.name, u.avatar FROM comments c JOIN users u ON c.email = u.email ORDER BY c.created_at DESC');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка підготовки запиту до бази даних']);
        exit();
    }
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка виконання запиту до бази даних']);
        $stmt->close();
        exit();
    }
    $result = $stmt->get_result();
    $stmt->close();

    $comments = [];
    while ($row = $result->fetch_assoc()) {
        $comments[] = [
            'id' => $row['id'],
            'message' => htmlspecialchars($row['message'], ENT_QUOTES, 'UTF-8'),
            'name' => htmlspecialchars(decryptData($row['name']), ENT_QUOTES, 'UTF-8'),
            'avatar' => htmlspecialchars($row['avatar'] ?: '/assets/default_user_icon.png', ENT_QUOTES, 'UTF-8')
        ];
    }

    echo json_encode($comments);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>