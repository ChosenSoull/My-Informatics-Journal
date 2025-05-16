import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../theme';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom'; // Додаємо імпорт useNavigate
import './Registration.css';

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

const Registration: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate(); // Ініціалізуємо useNavigate

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isCodeStage, setIsCodeStage] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googlePassword, setGooglePassword] = useState('');

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return '';
    if (pass.length < 8) return 'Слабкий (мінімум 8 символів)';
    if (!/[A-Z]/.test(pass)) return 'Середній (потрібна велика літера)';
    if (!/[0-9]/.test(pass)) return 'Сильний (потрібна цифра)';
    if (!/[!@#$%^&*]/.test(pass)) return 'Сильний (потрібен спецсимвол)';
    return 'Дуже сильний';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20);
    setName(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.slice(0, 50);
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
          setIsCodeStage(true);
        } else {
          setError('Помилка на сервері: ' + (data.message || 'Спробуйте ще раз'));
        }
      } else {
        setError('Помилка при відправці даних на сервер');
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      setError('Сталася мережева помилка');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    setError('');

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
            const loginKey = document.cookie.match(/login-key=[^;]+/);
            if (loginKey) {
              navigate('/'); // Замінюємо window.location.href на navigate
            } else {
              throw new Error('Куки login-key не отримані');
            }
          } else {
            throw new Error('Невірний код підтвердження');
          }
        } else {
          throw new Error('Помилка сервера при перевірці коду');
        }
      } catch (error: any) {
        setError(error.message);
        setCode(['', '', '', '', '', '']);
      }
    } else {
      setError('Введіть 6-значний код');
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch('/resend-code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setResendCooldown(30);
        setError('');
        setCode(['', '', '', '', '', '']);
      } else {
        setError('Не вдалося надіслати код повторно');
      }
    } catch (error) {
      setError('Сталася помилка при повторному надсиланні');
      console.error('Помилка при повторному надсиланні:', error);
    }
  };

  const handleGoogleSubmit = async () => {
    if (!googleUser) {
      setError('Спочатку увійдіть через Google');
      return;
    }
    if (!googlePassword) {
      setError('Введіть пароль');
      return;
    }

    try {
      const response = await fetch('/google-auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          password: googlePassword,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          navigate('/'); // Замінюємо window.location.href на navigate
        } else {
          setError('Помилка на сервері: ' + (data.message || 'Спробуйте ще раз'));
        }
      } else {
        setError('Помилка при відправці даних на сервер');
      }
    } catch (error) {
      console.error('Помилка мережі:', error);
      setError('Сталася мережева помилка');
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((userInfo: GoogleUser) => {
          setGoogleUser(userInfo);
          setError('');
        })
        .catch((error) => {
          setError('Помилка при отриманні даних користувача');
          console.error('Помилка:', error);
        });
    },
    onError: () => {
      setError('Помилка авторизації через Google');
    },
    scope: 'profile email',
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  return (
    <div className="container-registration" style={{ backgroundImage: `url('${containerBackground}')` }}>
      <div className="position-container">
        <div className="form-container">
          {!isCodeStage ? (
            <>
              <h2>Реєстрація</h2>
              <div className="google-auth-container">
                <button className="google-login" onClick={() => login()}>
                  <img
                    src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                    alt="Google icon"
                    className="google-icon"
                  />
                  Реєстрація за допомогою Google
                </button>
                {googleUser && (
                  <div className="google-user-info">
                    <img src={googleUser.picture} alt="Profile" className="profile-picture" />
                    <p>Ім'я: {googleUser.name}</p>
                    <p>Email: {googleUser.email}</p>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="Введіть пароль для акаунта"
                        value={googlePassword}
                        onChange={(e) => setGooglePassword(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button className="register-button" onClick={handleGoogleSubmit}>
                      Продовжити
                    </button>
                  </div>
                )}
              </div>
              {!googleUser && (
                <>
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
                      maxLength={20}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Пароль"
                      value={password}
                      onChange={handlePasswordChange}
                      className="input-field"
                      maxLength={50}
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
                      maxLength={50}
                    />
                  </div>
                </>
              )}
              {error && !googleUser && <div className="error-message">{error}</div>}
              {!googleUser && (
                <button className="register-button" onClick={handleRegister}>
                  Зареєструватися
                </button>
              )}
              <div className="navigation-links">
                <span onClick={() => navigate('/login')} className="navigation-link">
                  Вхід
                </span>
                <span onClick={() => navigate('/forgot-password')} className="navigation-link">
                  Забули пароль?
                </span>
              </div>
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
              {error && <div className="error-message">{error}</div>}
              <button className="verify-button" onClick={handleCodeSubmit}>
                Підтвердити
              </button>
              <button
                className="resend-button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Надіслати повторно через ${resendCooldown} сек`
                  : 'Надіслати код повторно'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;