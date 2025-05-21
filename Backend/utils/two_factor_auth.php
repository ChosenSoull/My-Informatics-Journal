<?php
require_once 'connection.php';
require_once 'encryption.php';
require_once 'email_template.php';

function generateVerificationCode($email) {
    $code = sprintf("%06d", mt_rand(100000, 999999));
    $hashedEmail = hashData($email);

    $conn = getDatabaseConnection();
    if (!$conn) {
        throw new Exception('Помилка підключення до бази даних');
    }

    try {
        $stmt = $conn->prepare('DELETE FROM verification_codes WHERE email = ?');
        if (!$stmt) {
            throw new Exception('Помилка підготовки запиту для видалення коду');
        }
        $stmt->bind_param('s', $hashedEmail);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception('Помилка виконання запиту для видалення коду');
        }
        $stmt->close();

        $stmt = $conn->prepare('INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))');
        if (!$stmt) {
            throw new Exception('Помилка підготовки запиту для вставки коду');
        }
        $stmt->bind_param('ss', $hashedEmail, $code);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception('Помилка збереження коду в базі даних');
        }
        $stmt->close();

        if (!sendVerificationEmail($email, $code)) {
            throw new Exception('Помилка надсилання email із кодом');
        }

        return true;
    } finally {
        if (isset($conn) && $conn) {
            $conn->close();
        }
    }
}

function verifyCode($email, $code) {
    $hashedEmail = hashData($email);

    $conn = getDatabaseConnection();
    if (!$conn) {
        throw new Exception('Помилка підключення до бази даних');
    }

    try {
        $stmt = $conn->prepare('SELECT code FROM verification_codes WHERE email = ? AND expires_at > NOW()');
        if (!$stmt) {
            throw new Exception('Помилка підготовки запиту для перевірки коду');
        }
        $stmt->bind_param('s', $hashedEmail);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception('Помилка виконання запиту для перевірки коду');
        }
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $stmt->close();
            return false;
        }

        $storedCode = $result->fetch_assoc()['code'];
        $stmt->close();

        if (!hash_equals($storedCode, $code)) {
            return false;
        }

        $stmt = $conn->prepare('DELETE FROM verification_codes WHERE email = ?');
        if (!$stmt) {
            throw new Exception('Помилка підготовки запиту для видалення коду');
        }
        $stmt->bind_param('s', $hashedEmail);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception('Помилка виконання запиту для видалення коду');
        }
        $stmt->close();

        return true;
    } finally {
        if (isset($conn) && $conn) {
            $conn->close();
        }
    }
}

function resendCode($email) {
    $hashedEmail = hashData($email);

    $conn = getDatabaseConnection();
    if (!$conn) {
        throw new Exception('Помилка підключення до бази даних');
    }

    try {
        $stmt = $conn->prepare('SELECT COUNT(*) as active_codes FROM verification_codes WHERE email = ? AND expires_at > NOW()');
        if (!$stmt) {
            throw new Exception('Помилка підготовки запиту для перевірки активного коду');
        }
        $stmt->bind_param('s', $hashedEmail);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception('Помилка виконання запиту для перевірки активного коду');
        }
        $result = $stmt->get_result();
        $activeCodes = $result->fetch_assoc()['active_codes'];
        $stmt->close();

        if ($activeCodes === 0) {
            return false;
        }

        $stmt = $conn->prepare('DELETE FROM verification_codes WHERE email = ?');
        if (!$stmt) {
            throw new Exception('Помилка підготовки запиту для видалення коду');
        }
        $stmt->bind_param('s', $hashedEmail);
        if (!$stmt->execute()) {
            $stmt->close();
            throw new Exception('Помилка виконання запиту для видалення коду');
        }
        $stmt->close();

        return generateVerificationCode($email);
    } finally {
        if (isset($conn) && $conn) {
            $conn->close();
        }
    }
}
?>