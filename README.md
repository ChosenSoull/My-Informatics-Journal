<p align="center">
  <img src="images/logo.png" alt="Лого" width="376" height="128"/>
</p>

# Вступ

Цей проект є веб-додатком, створеним для домашнього завдання з інформатики за допомогою React для фронтенду та PHP для бекенду. Він включає такі функції, як реєстрація користувачів, вхід у систему, відновлення пароля та коментування. Для управління базою даних використовується MariaDB.

# Завантажте додаток

За допомогою Code -> Download ZIP або 
```BASH
git clone https://github.com/ChosenSoull/My-Informatics-Journal.git
```

# Налаштування середовища розробки

Для розробки та запуску цього додатка вам потрібно встановити Node.js і npm на вашій системі. Node.js — це середовище виконання JavaScript, яке дозволяє запускати JavaScript поза браузером, а npm — це менеджер пакетів для Node.js.
Встановлення Node.js і npm

Windows:

Завантажте інсталятор Node.js з офіційного сайту: https://nodejs.org/
Запустіть інсталятор і дотримуйтесь інструкцій.

macOS:

Встановіть Node.js за допомогою Homebrew. Якщо Homebrew не встановлено, відвідайте https://brew.sh/ для інструкцій.
Відкрийте термінал і виконайте:

```BASH
brew install node
```

Linux (Ubuntu/Debian):

Відкрийте термінал і виконайте:

```BASH
sudo apt update
sudo apt install nodejs npm
```

Linux (Arch/Manjaro):
```BASH
sudo pacman -Syu
sudo pacman -S nodejs npm
```

Перевірте встановлення:

```BASH
node -v
npm -v
```

# Налаштування бази даних

Цей додаток використовує MariaDB як базу даних. Вам потрібно встановити MariaDB на вашу систему. Якщо вона ще не встановлена, дотримуйтесь інструкцій для вашої платформи:

Windows:

Завантажте інсталятор MariaDB з https://mariadb.org/download/
Запустіть інсталятор і дотримуйтесь інструкцій.

macOS:

Встановіть MariaDB за допомогою Homebrew:
```
brew install mariadb
```

Linux (Ubuntu/Debian):

```BASH
sudo apt update
sudo apt install mariadb-server
```

Linux (Arch/Manjaro):

```BASH
sudo pacman -Syu
sudo pacman -S mariadb
```

Після встановлення MariaDB створіть базу даних і таблиці:

Запустіть сервер MariaDB.
Відкрийте термінал або командний рядок і увійдіть до MariaDB:

```BASH
mysql -u root -p
```

Введіть пароль root.

Створіть базу даних:

```SQL
CREATE DATABASE your_database;
```

Перейдіть до бази даних:

```SQL
USE your_database;
```

Створіть таблиці, виконавши наступні SQL-команди:

```SQL
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NOT NULL DEFAULT '/assets/default_user_icon.png',
    login_key VARCHAR(255),
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE forgot_pass (
    email VARCHAR(255) NOT NULL,
    hashed_reset_key VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (email)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

# Налаштування React-додатка

Цей проект використовує Vite як інструмент для збирання React-додатка. Vite забезпечує швидке середовище розробки та оптимізовані збірки.

Перейдіть до директорії проекту: cd My-Informatics-Journal

Встановіть залежності:

```BASH
npm install
```

Запустіть сервер розробки:

```BASH
npm run dev
```

Відкрийте браузер і перейдіть за адресою http://localhost:5713, щоб побачити додаток.

Компіляція додатка для продакшену
Щоб підготувати додаток до продакшену створіть файл .env в корні проэкта і додайте в нього ключі google аналітики а також ключ OAuth від google, а після їх додавання виконайте його збірку за допомогою Vite.

Приклад файла .env 
```BASH
VITE_GA_TRACKING_ID=G-XXXXXXXX
VITE_GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

Виконайте команду збірки: 

```BASH
npm run build
```

Це створить директорію dist із скомпільованими файлами.

Запуск локального PHP-сервера
Оскільки бекенд написаний на PHP, вам потрібно запустити локальний PHP-сервер для обробки API-запитів.

Переконайтеся, що PHP встановлено на вашій системі. Якщо ні, завантажте та встановіть його з https://www.php.net/downloads

Запустіть PHP-сервер:

```BASH
php -S localhost:8000
```

Тепер ваш бекенд буде доступний за адресою http://localhost:8000.

Налаштування додатка

Вам знадобиться налаштувати додаток для підключення до бази даних.

У директорії бекенду є файл /utils/connection.php.
Додайте деталі підключення до бази даних:

```SQL
$host = 'localhost';
$dbname = 'your_database';
$username = 'your_username';
$password = 'your_password';
```

А також сгенеруйне 2 ключа довжиною 32 символи ,і помістить їх у файл в бекенді /utils/encryption.php

define('ENCRYPTION_KEY', '');
define('HASH_SALT', '');

# Запуск додатка

Запустіть PHP-сервер для бекенду.
Запустіть сервер розробки Vite для фронтенду.
Відкрийте браузер і перейдіть за адресою http://localhost:5713, щоб використовувати додаток.

# Додаткові примітки

Переконайтеся, що ви замінили your_database, your_username і your_password на реальні назву бази даних, ім’я користувача та пароль.

Якщо виникають проблеми з підключенням до бази даних, перевірте статус сервера MariaDB і правильність облікових даних.

Для розгортання в продакшені вам може знадобитися налаштувати веб-сервер, наприклад Apache або Nginx, для обслуговування PHP-файлів і скомпільованого React-додатка.А також перемістити всі файли в діректорію htdocs
