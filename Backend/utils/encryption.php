<?php
// Ключ шифрування (згенеруйте унікальний ключ для вашого проєкту)
define('ENCRYPTION_KEY', '');
define('HASH_SALT', '');

// Функція шифрування
function encryptData($data) {
    $key = ENCRYPTION_KEY;
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
    $encrypted = openssl_encrypt($data, 'aes-256-cbc', $key, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}

// Функція дешифрування
function decryptData($data) {
    $key = ENCRYPTION_KEY;
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, 'aes-256-cbc', $key, 0, $iv);
}

function hashData($data) {
    $salt = HASH_SALT;
    return hash('sha256', $salt . $data);
}
?>