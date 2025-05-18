<?php
require_once 'connection.php';
require_once 'encryption.php';
require_once 'email_template.php';

function generateVerificationCode($email) {
    $code = sprintf("%06d", mt_rand(100000, 999999));
    $encryptedEmail = encryptData($email);
    $conn = getDatabaseConnection();

    // Видаляємо старі коди для цього email
    $conn->query("DELETE FROM verification_codes WHERE email = '$encryptedEmail'");

    // Зберігаємо новий код у базі (на 5 хвилин)
    $stmt = $conn->prepare('INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))');
    $stmt->bind_param('ss', $encryptedEmail, $code);
    if (!$stmt->execute()) {
        error_log('Помилка збереження коду в базі для email: ' . $email);
    }

    $stmt->close();
    $conn->close();

    sendVerificationEmail($email, $code); // Надсилаємо код на email
}

function verifyCode($email, $code) {
    $encryptedEmail = encryptData($email);
    $conn = getDatabaseConnection();

    // Отримуємо код із бази
    $stmt = $conn->prepare('SELECT code FROM verification_codes WHERE email = ? AND expires_at > NOW()');
    $stmt->bind_param('s', $encryptedEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $storedCode = $result->fetch_assoc()['code'];
        if ($storedCode === $code) {
            // Код правильний, видаляємо його з бази
            $conn->query("DELETE FROM verification_codes WHERE email = '$encryptedEmail'");
            $stmt->close();
            $conn->close();
            return true;
        }
    }

    $stmt->close();
    $conn->close();
    return false;
}

function resendCode($email) {
    $encryptedEmail = encryptData($email);
    $conn = getDatabaseConnection();

    // Видаляємо старі коди
    $conn->query("DELETE FROM verification_codes WHERE email = '$encryptedEmail'");

    $conn->close();
    generateVerificationCode($email); // Генеруємо новий код
}
?>