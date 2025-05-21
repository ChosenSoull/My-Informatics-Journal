<?php
require_once __DIR__ . '/vendor/autoload.php';

$client = new Google_Client();
$client->setAuthConfig(__DIR__ . '/credentials.json');
$client->setRedirectUri('https://chosensoul.kesug.com/oauth2callback.php');
$client->addScope(Google_Service_Gmail::GMAIL_SEND);
$client->setAccessType('offline');
$client->setApprovalPrompt('force');

if (!isset($_GET['code'])) {
    $authUrl = $client->createAuthUrl();
    header('Location: ' . $authUrl);
    exit;
}

$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
$client->setAccessToken($token);
file_put_contents(__DIR__ . '/token.json', json_encode($token));
echo "Токен успішно збережений! Можете видалити цей файл.";
exit;
?>