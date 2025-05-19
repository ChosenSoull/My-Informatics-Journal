<?php
set_time_limit(300); 
error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1); 
ini_set('error_log', __DIR__ . '/cleanup_errors.log'); 

require_once __DIR__ . '/connection.php';

$lastRunFile = __DIR__ . '/last_cleanup_run.txt';

$intervalSeconds = 24 * 3600;

$lastRunTimestamp = 0;
if (file_exists($lastRunFile)) {
    $lastRunTimestamp = (int)file_get_contents($lastRunFile);
}

if (time() - $lastRunTimestamp < $intervalSeconds) {
    exit();
}

file_put_contents($lastRunFile, time());

$conn = null;
try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        error_log("Cleanup Error: Failed to connect to database.");
        exit();
    }

    $stmt_codes = $conn->prepare("DELETE FROM verification_codes WHERE expires_at < NOW()");
    if ($stmt_codes && $stmt_codes->execute()) {
        error_log("Cleanup: Deleted " . $stmt_codes->affected_rows . " expired verification codes.");
        $stmt_codes->close();
    } else {
        error_log("Cleanup Error: Failed to delete expired verification codes. " . $conn->error);
    }

    $stmt_forgot = $conn->prepare("DELETE FROM forgot_pass WHERE expires_at < NOW()");
    if ($stmt_forgot && $stmt_forgot->execute()) {
        error_log("Cleanup: Deleted " . $stmt_forgot->affected_rows . " expired password reset keys.");
        $stmt_forgot->close();
    } else {
        error_log("Cleanup Error: Failed to delete expired password reset keys. " . $conn->error);
    }

    $stmt_users = $conn->prepare("DELETE FROM users WHERE is_verified = 0 AND created_at < NOW() - INTERVAL 24 HOUR");
    if ($stmt_users && $stmt_users->execute()) {
        error_log("Cleanup: Deleted " . $stmt_users->affected_rows . " unverified users.");
        $stmt_users->close();
    } else {
        error_log("Cleanup Error: Failed to delete unverified users. " . $conn->error);
    }

    error_log("Cleanup: All cleanup tasks completed successfully.");

} catch (Exception $e) {
    error_log("Cleanup General Exception: " . $e->getMessage());
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>