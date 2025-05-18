import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../theme';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface GoogleUser {
  email: string;
}

const Login: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isCodeStage, setIsCodeStage] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Усі поля повинні бути заповнені!');
      return;
    }

    try {
      const response = await fetch('/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setIsCodeStage(true);
        } else {
          setError(data.message || 'Помилка входу');
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
            navigate('/');
          } else {
            setError('Невірний код підтвердження');
          }
        } else {
          setError('Немає зв’язку з сервером');
        }
      } catch (error) {
        setError('Немає зв’язку з сервером');
        console.error('Помилка мережі:', error);
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
      setError('Немає зв’язку з сервером');
      console.error('Помилка при повторному надсиланні:', error);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleUser) {
      setError('Спочатку увійдіть через Google');
      return;
    }

    try {
      const response = await fetch('/google-login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleUser.email }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          navigate('/');
        } else {
          setError(data.message || 'Помилка входу');
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
    <div className="container-login" style={{ backgroundImage: `url('${containerBackground}')` }}>
      <div className="position-container-login">
        <div className="form-container-login">
          {!isCodeStage && <h2>Вхід</h2>}
          {!isCodeStage && (
            <button className="google-login_login" onClick={() => login()}>
              <img
                src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                alt="Google icon"
                className="google-icon"
              />
              Увійти за допомогою Google
            </button>
          )}
          {googleUser && !isCodeStage && (
            <div className="google-user-info">
              {error && <div className="error-message">{error}</div>}
              <button className="login-button" onClick={handleGoogleLogin}>
                Увійти
              </button>
            </div>
          )}
          {!googleUser && !isCodeStage && (
            <>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Електронна пошта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  value={password}
                  onChange={handlePasswordChange}
                  className="input-field"
                />
                {password.length > 0 && (
                  <img
                    src={passwordIconSrc}
                    alt={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>
              {error && <div className="error-message">{error}</div>}
              <button className="login-button" onClick={handleLogin}>
                Увійти
              </button>
            </>
          )}
          <div className="navigation-links">
            <span onClick={() => navigate('/registration')} className="navigation-link">
              Реєстрація
            </span>
            <span onClick={() => navigate('/forgot-password')} className="navigation-link">
              Забули пароль?
            </span>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Login;