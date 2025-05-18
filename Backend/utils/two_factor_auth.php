<?php
require_once 'connection.php';
require_once 'encryption.php';
require_once 'email_template.php';

function generateVerificationCode($email) {
    $code = sprintf("%06d", mt_rand(100000, 999999));
    $hashedEmail = hashData($email);
    $conn = getDatabaseConnection();

    $conn->query("DELETE FROM verification_codes WHERE email = '$hashedEmail'");

    $stmt = $conn->prepare('INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))');
    $stmt->bind_param('ss', $hashedEmail, $code);
    if (!$stmt->execute()) {
        error_log('Помилка збереження коду в базі для email: ' . $email);
    }

    $stmt->close();
    $conn->close();

    sendVerificationEmail($email, $code);
}

function verifyCode($email, $code) {
    $hashedEmail = hashData($email);
    $conn = getDatabaseConnection();

    $stmt = $conn->prepare('SELECT code FROM verification_codes WHERE email = ? AND expires_at > NOW()');
    $stmt->bind_param('s', $hashedEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $storedCode = $result->fetch_assoc()['code'];
        if ($storedCode === $code) {
            $conn->query("DELETE FROM verification_codes WHERE email = '$hashedEmail'");
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
    $hashedEmail = hashData($email);
    $conn = getDatabaseConnection();

    $conn->query("DELETE FROM verification_codes WHERE email = '$hashedEmail'");

    $conn->close();
    generateVerificationCode($email);
}
?>