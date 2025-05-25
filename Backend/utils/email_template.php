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
require_once dirname(__DIR__) . '/vendor/autoload.php';

function getClient() {
    $client = new Google_Client();
    $client->setApplicationName('ChosenSoul');
    $client->setScopes([Google_Service_Gmail::GMAIL_SEND]);
    $client->setAuthConfig(__DIR__ . '/credentials.json');
    $client->setAccessType('offline');
    $client->setApprovalPrompt('force');

    $tokenPath = __DIR__ . '/token.json';
    if (file_exists($tokenPath)) {
        $accessToken = json_decode(file_get_contents($tokenPath), true);
        $client->setAccessToken($accessToken);
    }
    
    if ($client->isAccessTokenExpired()) {
        $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
        file_put_contents($tokenPath, json_encode($client->getAccessToken()));
    }

    return $client;
}

function sendVerificationEmail($email, $code) {
    $client = getClient();
    $service = new Google_Service_Gmail($client);
    $subject = "Код підтвердження";
    $encodedSubject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");


    $htmlMessage = <<<HTML
    <!DOCTYPE html>
    <html lang="uk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Код підтвердження</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h2 {
                color: #333333;
                text-align: center;
            }
            .code {
                font-size: 24px;
                font-weight: bold;
                color:rgb(0, 0, 0);
                text-align: center;
                margin: 20px 0;
            }
            p {
                color: #666666;
                text-align: center;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #999999;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Код підтвердження</h2>
            <p>Ви запросили код для підтвердження вашої дії.</p>
            <div class="code">$code</div>
            <p>Будь ласка, введіть цей код на сайті. Код дійсний протягом 5 хвилин.</p>
            <div class="footer">
                <p>Якщо ви не запитували цей код, проігноруйте цей лист.</p>
                <p>© 2025 ChosenSoul. Усі права захищені.</p>
            </div>
        </div>
    </body>
    </html>
HTML;

    $message = new Google_Service_Gmail_Message();
    $rawMessage = "To: $email\r\n";
    $rawMessage .= "Subject: " . $encodedSubject . "\r\n";
    $rawMessage .= "MIME-Version: 1.0\r\n";
    $rawMessage .= "Content-Type: text/html; charset=UTF-8\r\n";
    $rawMessage .= "From: chosensouldev@gmail.com\r\n";
    $rawMessage .= "\r\n" . $htmlMessage;

    $raw = rtrim(strtr(base64_encode($rawMessage), '+/', '-_'), '=');
    $message->setRaw($raw);

    try {
        $service->users_messages->send('me', $message);
    } catch (Exception $e) {
        error_log("Помилка відправки email: " . $e->getMessage());
        return false;
    }

    return true;
}
?>