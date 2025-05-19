import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../theme';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import sanitizeHtml from 'sanitize-html';

interface GoogleUser {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resetKey, setResetKey] = useState(''); // Зберігаємо reset_key
  const [isCodeStage, setIsCodeStage] = useState(false);
  const [isPasswordStage, setIsPasswordStage] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleIdToken, setGoogleIdToken] = useState(''); // Зберігаємо id_token

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordIconSrc = showPassword
    ? theme === 'light' ? '/assets/view-dark.png' : '/assets/view-light.png'
    : theme === 'light' ? '/assets/hide-dark.png' : '/assets/hide-light.png';

  const containerBackground = theme === 'light'
    ? '/assets/page-bg-light.png'
    : '/assets/page-bg-dark.png';

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Електронна пошта повинна бути заповнена!');
      return;
    }
    if (email.length > 255) {
      setError('Електронна пошта не може перевищувати 255 символів!');
      return;
    }

    try {
      const response = await fetch('/forgot-pass.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setIsCodeStage(true);
          setError('');
        } else {
          setError(data.message || 'Помилка відправки');
        }
      } else {
        setError('Немає зв’язку з сервером');
      }
    } catch (error) {
      setError('Немає зв’язку з сервером');
      console.error('Помилка мережі:', error);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const sanitizedValue = sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 1);
    const newCode = [...code];
    newCode[index] = sanitizedValue;
    setCode(newCode);
    setError('');

    if (sanitizedValue && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Введіть 6-значний код');
      return;
    }

    try {
      const response = await fetch('/verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: codeString, action: 'forgot-password' }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'verified') {
          setResetKey(data.reset_key); // Зберігаємо reset_key
          setIsCodeStage(false);
          setIsPasswordStage(true);
          setError('');
        } else {
          setError(data.message || 'Невірний код підтвердження');
        }
      } else {
        setError('Немає зв’язку з сервером');
      }
    } catch (error) {
      setError('Немає зв’язку з сервером');
      console.error('Помилка мережі:', error);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Електронна пошта повинна бути заповнена!');
      return;
    }
    if (email.length > 255) {
      setError('Електронна пошта не може перевищувати 255 символів!');
      return;
    }

    try {
      const response = await fetch('/resend-code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setResendCooldown(30);
          setError('');
          setCode(['', '', '', '', '', '']);
        } else {
          setError(data.message || 'Не вдалося надіслати код повторно');
        }
      } else {
        setError('Немає зв’язку з сервером');
      }
    } catch (error) {
      setError('Немає зв’язку з сервером');
      console.error('Помилка при повторному надсиланні:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword || !confirmNewPassword) {
      setError('Усі поля повинні бути заповнені!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Паролі не збігаються!');
      return;
    }
    if (newPassword.length < 8) {
      setError('Пароль повинен містити щонайменше 8 символів!');
      return;
    }
    if (newPassword.length > 255) {
      setError('Пароль не може перевищувати 255 символів!');
      return;
    }
    if (!resetKey) {
      setError('Ключ скидання пароля відсутній!');
      return;
    }

    try {
      const response = await fetch('/update-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, newPassword, reset_key: resetKey }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          navigate('/'); // Перенаправлення після успішної зміни пароля
        } else {
          setError(data.message || 'Помилка оновлення пароля');
        }
      } else {
        setError('Немає зв’язку з сервером');
      }
    } catch (error) {
      setError('Немає зв’язку з сервером');
      console.error('Помилка мережі:', error);
    }
  };

  const handleGoogleForgotPassword = async () => {
    if (!googleIdToken) {
      setError('Спочатку увійдіть через Google');
      return;
    }

    try {
      const response = await fetch('/google-forgot-pass.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_token: googleIdToken }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setIsCodeStage(true);
          setError('');
        } else {
          setError(data.message || 'Помилка відправки');
        }
      } else {
        setError('Немає зв’язку з сервером');
      }
    } catch (error) {
      setError('Немає зв’язку з сервером');
      console.error('Помилка мережі:', error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleIdToken(tokenResponse.access_token); // Зберігаємо id_token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((userInfo: GoogleUser) => {
          setGoogleUser(userInfo);
          setEmail(userInfo.email);
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
    scope: 'email',
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
    <div className="container-ForgotPassword" style={{ backgroundImage: `url('${containerBackground}')` }}>
      <div className="position-container-ForgotPassword">
        <div className="form-container-ForgotPassword">
          {!isCodeStage && !isPasswordStage && <h2>Відновлення пароля</h2>}
          {/* Показуємо кнопку Google лише на початковому етапі */}
          {!isCodeStage && !isPasswordStage && (
            <button className="google-ForgotPassword" onClick={() => login()}>
              <img
                src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                alt="Google icon"
                className="google-icon"
              />
              Відновити за допомогою Google
            </button>
          )}
          {googleUser ? (
            <div className="google-user-info">
              {isPasswordStage ? (
                <div className="password-container">
                  <h2>Задай новий пароль</h2>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Новий пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                    {newPassword.length > 0 && (
                      <img
                        src={passwordIconSrc}
                        alt={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Повторити новий пароль"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button className="ForgotPassword-button" onClick={handlePasswordSubmit}>
                    Зберегти
                  </button>
                </div>
              ) : isCodeStage ? (
                <div className="code-container">
                  <h2>Підтвердження коду</h2>
                  <p>Введіть 6-значний код, відправлений на {googleUser.email}</p>
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
              ) : (
                <>
                  {error && <div className="error-message">{error}</div>}
                  <button className="ForgotPassword-button" onClick={handleGoogleForgotPassword}>
                    Надіслати код
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {!isCodeStage && !isPasswordStage && (
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Електронна пошта"
                    value={email}
                    onChange={(e) => setEmail(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                    className="input-field"
                  />
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              {!isCodeStage && !isPasswordStage && (
                <button className="ForgotPassword-button" onClick={handleForgotPassword}>
                  Надіслати код
                </button>
              )}
              {isPasswordStage && (
                <div className="password-container">
                  <h2>Задай новий пароль</h2>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Новий пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                    {newPassword.length > 0 && (
                      <img
                        src={passwordIconSrc}
                        alt={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Повторити новий пароль"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button className="ForgotPassword-button" onClick={handlePasswordSubmit}>
                    Зберегти
                  </button>
                </div>
              )}
              {isCodeStage && (
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
            </>
          )}
          {/* Завжди відображаємо navigation-links внизу */}
          <div className="navigation-links">
            <span onClick={() => navigate('/registration')} className="navigation-link">
              Реєстрація
            </span>
            <span onClick={() => navigate('/login')} className="navigation-link">
              Вхід
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;