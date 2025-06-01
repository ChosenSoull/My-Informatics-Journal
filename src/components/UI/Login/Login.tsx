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
import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../theme';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Login.css';
import sanitizeHtml from 'sanitize-html';
import { getCurrentLanguage } from '../../../i18n';

interface GoogleUser {
  email: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation();
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
  const [googleAccessToken, setGoogleAccessToken] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeHtml(e.target.value, {
      allowedTags: [],
      allowedAttributes: {},
    });
    setPassword(sanitizedValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordIconSrc = showPassword
    ? theme === 'light' ? '/assets/view-dark.png' : '/assets/view-light.png'
    : theme === 'light' ? '/assets/hide-dark.png' : '/assets/hide-light.png';

  const containerBackground = theme === 'light'
    ? '/assets/page-bg-light.jpg'
    : '/assets/page-bg-dark.jpg';

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('all_fields_required-login'));
      return;
    }
    if (email.length > 255) {
      setError(t('email_too_long-login'));
      return;
    }
    if (password.length > 255) {
      setError(t('password_too_long-login'));
      return;
    }

    try {
      const response = await fetch('/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setIsCodeStage(true);
          setError('');
        } else {
          setError(data.message || t('login_error-login'));
        }
      } else {
        setError(t('no_server_connection-login'));
      }
    } catch (error) {
      setError(t('no_server_connection-login'));
      console.error(t('network_error_console-login'), error);
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
      setError(t('enter_six_digit_code-login'));
      return;
    }

    try {
      const response = await fetch('/verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: codeString, action: 'login' }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'verified') {
          navigate('/');
        } else {
          setError(data.message || t('invalid_verification_code-login'));
        }
      } else {
        setError(t('no_server_connection-login'));
      }
    } catch (error) {
      setError(t('no_server_connection-login'));
      console.error(t('network_error_console-login'), error);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError(t('email_required-login'));
      return;
    }
    if (email.length > 255) {
      setError(t('email_too_long-login'));
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
          setError(data.message || t('resend_code_failed-login'));
        }
      } else {
        setError(t('no_server_connection-login'));
      }
    } catch (error) {
      setError(t('no_server_connection-login'));
      console.error(t('resend_error_console-login'), error);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleAccessToken) {
      setError(t('google_login_required-login'));
      return;
    }

    try {
      const response = await fetch('/google-login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ access_token: googleAccessToken }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          navigate('/');
        } else {
          setError(data.message || t('login_error-login'));
        }
      } else {
        setError(t('no_server_connection-login'));
      }
    } catch (error) {
      setError(t('no_server_connection-login'));
      console.error(t('network_error_console-login'), error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleAccessToken(tokenResponse.access_token);
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
          setError(t('google_user_info_error-login'));
          console.error(t('error_console-login'), error);
        });
    },
    onError: () => {
      setError(t('google_auth_error-login'));
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
          {!isCodeStage && <h2>{t('login_title-login')}</h2>}
          {!isCodeStage && (
            <button className="google-login_login" onClick={() => login()}>
              <img
                src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                alt={t('google_icon_alt-login')}
                className="google-icon"
              />
              {t('google_login-login')}
            </button>
          )}
          {googleUser && !isCodeStage && (
            <div className="google-user-info">
              {error && <div className="error-message">{error}</div>}
              <button className="login-button" onClick={handleGoogleLogin}>
                {t('login_button-login')}
              </button>
            </div>
          )}
          {!googleUser && !isCodeStage && (
            <>
              <div className="form-group">
                <input
                  type="email"
                  placeholder={t('email_placeholder-login')}
                  value={email}
                  onChange={(e) => setEmail(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password_placeholder-login')}
                  value={password}
                  onChange={handlePasswordChange}
                  className="input-field"
                />
                {password.length > 0 && (
                  <img
                    src={passwordIconSrc}
                    alt={showPassword ? t('hide_password_alt-login') : t('show_password_alt-login')}
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>
              {error && <div className="error-message">{error}</div>}
              <button className="login-button" onClick={handleLogin}>
                {t('login_button-login')}
              </button>
            </>
          )}
          {isCodeStage && (
            <div className="code-container">
              <h2>{t('code_verification_title-login')}</h2>
              <p>{t('enter_code_message-login', { email })}</p>
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
                {t('verify_button-login')}
              </button>
              <button
                className="resend-button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? t('resend_code_cooldown-login', { seconds: resendCooldown })
                  : t('resend_code_button-login')}
              </button>
            </div>
          )}
          <div className="navigation-links">
            <span onClick={() => navigate(`/${getCurrentLanguage()}/registration`)} className="navigation-link">
              {t('registration_link-login')}
            </span>
            <span onClick={() => navigate(`/${getCurrentLanguage()}/`)} className="navigation-link">
              {t('home_link-login')}
            </span>
            <span onClick={() => navigate(`/${getCurrentLanguage()}/forgot-password`)} className="navigation-link">
              {t('forgot_password_link-login')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;