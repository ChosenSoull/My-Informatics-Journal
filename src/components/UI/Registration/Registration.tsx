import React, { useState, useContext } from 'react';
import { ThemeContext } from '../theme';
import './Registration.css';

const Registration: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isCodeStage, setIsCodeStage] = useState(false);

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return '';
    if (pass.length < 8) return 'Слабкий (мінімум 8 символів)';
    if (!/[A-Z]/.test(pass)) return 'Середній (потрібна велика літера)';
    if (!/[0-9]/.test(pass)) return 'Сильний (потрібна цифра)';
    if (!/[!@#$%^&*]/.test(pass)) return 'Сильний (потрібен спецсимвол)';
    return 'Дуже сильний';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // Обмеження до 20 символів
    setName(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.slice(0, 50); // Обмеження до 50 символів
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordIconSrc = showPassword
    ? theme === 'light' ? '/assets/view-dark.png' : '/assets/view-light.png'
    : theme === 'light' ? '/assets/hide-dark.png' : '/assets/hide-light.png';

  const containerBackground = theme === 'light'
    ? '/assets/page-bg-light.png'
    : '/assets/page-bg-dark.png';

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@(gmail\.com|mail\.ru|yahoo\.com|outlook\.com)$/i;
    return emailRegex.test(email) && email.includes('@');
  };

  const handleRegister = async () => {
    if (name.length === 0 || password.length === 0 || email.length === 0 || confirmPassword.length === 0) {
      alert('Усі поля повинні бути заповнені!');
      return;
    }
    if (password !== confirmPassword) {
      alert('Паролі не збігаються!');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Невірний формат email. Використовуйте @ і домени: mail.ru, gmail.com, yahoo.com, outlook.com');
      return;
    }
    if (password.length > 50) {
      alert('Пароль не може перевищувати 50 символів!');
      return;
    }

    try {
      const response = await fetch('/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          setIsCodeStage(true); // Переходимо до екрану введення коду
        } else {
          alert('Помилка на сервері: ' + (data.message || 'Спробуйте ще раз'));
        }
      } else {
        alert('Помилка при відправці даних на сервер');
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      alert('Сталася мережева помилка');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value.slice(0, 1); // Обмежуємо до 1 символа
    setCode(newCode);

    // Перехід до наступного поля
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length === 6) {
      try {
        const response = await fetch('/verify.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: codeString }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'verified') {
            alert('Реєстрація завершена! Перейдіть до входу.');
            // Тут можна перенаправити на сторінку входу, наприклад, window.location.href = '/login';
          } else {
            alert('Невірний код підтвердження');
          }
        }
      } catch (error) {
        console.error('Помилка при перевірці коду:', error);
        alert('Сталася помилка при перевірці коду');
      }
    } else {
      alert('Введіть 6-значний код');
    }
  };

  return (
    <div className="container-registration" style={{ backgroundImage: `url('${containerBackground}')` }}>
      <div className="position-container">
        <div className="form-container">
          {!isCodeStage ? (
            <>
              <h2>Реєстрація</h2>
              <button className="google-login">
                <img
                  src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                  alt="Google icon"
                  className="google-icon"
                />
                Увійти за допомогою Google
              </button>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Електронна пошта"
                  value={email}
                  onChange={handleEmailChange}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Ім'я"
                  value={name}
                  onChange={handleNameChange}
                  className="input-field"
                  maxLength={20} // Додаткове обмеження через HTML
                />
              </div>
              <div className="form-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  value={password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  maxLength={50} // Додаткове обмеження через HTML
                />
                {password.length > 0 && (
                  <img
                    src={passwordIconSrc}
                    alt={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  />
                )}
                {password.length > 0 && <span className="password-strength">{passwordStrength}</span>}
              </div>
              <div className="form-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Повторити пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  maxLength={50} // Додаткове обмеження через HTML
                />
              </div>
              <button className="register-button" onClick={handleRegister}>Зареєструватися</button>
            </>
          ) : (
            <div className="code-container">
              <h2>Підтвердження коду</h2>
              <p>Введіть 6-значний код, відправлений на {email}</p>
              <div className="code-inputs">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="code-input"
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <button className="verify-button" onClick={handleCodeSubmit}>Підтвердити</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;