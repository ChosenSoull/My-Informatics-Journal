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
function getDatabaseConnection() {
    $host = '';
    $dbname = '';
    $username = '';
    $password = '';
    
    try {
        $conn = new mysqli($host, $username, $password, $dbname);
        if ($conn->connect_error) {
            throw new Exception('Помилка підключення до бази: ' . $conn->connect_error);
        }
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка сервера']);
        exit();
    }
}
?>