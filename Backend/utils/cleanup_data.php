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
set_time_limit(300);
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 0);

require_once __DIR__ . '/connection.php';

$lastRunFile = __DIR__ . '/last_cleanup_run.txt';
$intervalSeconds = 24 * 3600;

$lastRunTimestamp = 0;
if (file_exists($lastRunFile)) {
    $lastRunTimestamp = (int)file_get_contents($lastRunFile);
}

if (time() - $lastRunTimestamp < $intervalSeconds) {
    return;
}

file_put_contents($lastRunFile, time());

$conn = null;
try {
    $conn = getDatabaseConnection();
    if (!$conn) {
        return;
    }

    $stmt_codes = $conn->prepare("DELETE FROM verification_codes WHERE expires_at < NOW()");
    if ($stmt_codes && $stmt_codes->execute()) {
        $stmt_codes->close();
    }

    $stmt_forgot = $conn->prepare("DELETE FROM forgot_pass WHERE expires_at < NOW()");
    if ($stmt_forgot && $stmt_forgot->execute()) {
        $stmt_forgot->close();
    }

    $stmt_users = $conn->prepare("DELETE FROM users WHERE is_verified = 0 AND created_at < NOW() - INTERVAL 24 HOUR");
    if ($stmt_users && $stmt_users->execute()) {
        $stmt_users->close();
    }

} catch (Exception $e) {
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>