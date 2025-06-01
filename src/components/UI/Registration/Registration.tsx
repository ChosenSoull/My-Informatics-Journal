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
import './Registration.css';
import sanitizeHtml from 'sanitize-html';
import { getCurrentLanguage } from '../../../i18n';

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

const Registration: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

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
  const [googleAccessToken, setGoogleAccessToken] = useState('');

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return '';
    if (pass.length < 8) return t('weak_password-registration');
    if (!/[A-Z]/.test(pass)) return t('medium_password-registration');
    if (!/[0-9]/.test(pass)) return t('strong_password_number-registration');
    if (!/[!@#$%^&*]/.test(pass)) return t('strong_password_special-registration');
    return t('very_strong_password-registration');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeHtml(e.target.value, {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 255);
    setName(sanitizedValue);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeHtml(e.target.value, {
      allowedTags: [],
      allowedAttributes: {},
    });
    setEmail(sanitizedValue);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeHtml(e.target.value, {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 255);
    setPassword(sanitizedValue);
    setPasswordStrength(checkPasswordStrength(sanitizedValue));
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

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (name.length === 0 || password.length === 0 || email.length === 0 || confirmPassword.length === 0) {
      setError(t('all_fields_required-registration'));
      return;
    }
    if (name.length > 255) {
      setError(t('name_too_long-registration'));
      return;
    }
    if (email.length > 255) {
      setError(t('email_too_long-registration'));
      return;
    }
    if (password.length > 255) {
      setError(t('password_too_long-registration'));
      return;
    }
    if (password.length < 8) {
      setError(t('password_too_short-registration'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwords_do_not_match-registration'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('invalid_email_format-registration'));
      return;
    }

    try {
      const response = await fetch('/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setIsCodeStage(true);
          setError('');
        } else {
          setError(data.message || t('server_error-registration'));
        }
      } else {
        setError(t('no_server_connection-registration'));
      }
    } catch (error) {
      setError(t('no_server_connection-registration'));
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
      setError(t('enter_six_digit_code-registration'));
      return;
    }

    try {
      const response = await fetch('/verify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: codeString, action: 'registration' }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'verified') {
          navigate('/');
        } else {
          setError(data.message || t('invalid_verification_code-registration'));
          setCode(['', '', '', '', '', '']);
        }
      } else {
        setError(t('no_server_connection-registration'));
      }
    } catch (error) {
      setError(t('no_server_connection-registration'));
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError(t('email_required-registration'));
      return;
    }
    if (email.length > 255) {
      setError(t('email_too_long-registration'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('invalid_email_format-registration'));
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
          setError(data.message || t('resend_code_failed-registration'));
        }
      } else {
        setError(t('no_server_connection-registration'));
      }
    } catch (error) {
      setError(t('no_server_connection-registration'));
      console.error(t('resend_error_console-registration'), error);
    }
  };

  const handleGoogleSubmit = async () => {
    if (!googleAccessToken) {
      setError(t('google_login_required-registration'));
      return;
    }
    if (!googlePassword) {
      setError(t('password_required-registration'));
      return;
    }
    if (googlePassword.length < 8) {
      setError(t('password_too_short-registration'));
      return;
    }
    if (googlePassword.length > 255) {
      setError(t('password_too_long-registration'));
      return;
    }

    try {
      const response = await fetch('/google-auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ access_token: googleAccessToken, password: googlePassword }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          navigate('/');
        } else {
          setError(data.message || t('server_error-registration'));
        }
      } else {
        setError(t('no_server_connection-registration'));
      }
    } catch (error) {
      setError(t('no_server_connection-registration'));
      console.error(t('network_error_console-registration'), error);
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
          setError('');
        })
        .catch(() => {
          setError(t('google_user_info_error-registration'));
        });
    },
    onError: () => {
      setError(t('google_auth_error-registration'));
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
              <h2>{t('registration_title-registration')}</h2>
              <div className="google-auth-container">
                <button className="google-login" onClick={() => login()}>
                  <img
                    src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                    alt={t('google_icon_alt-registration')}
                    className="google-icon"
                  />
                  {t('google_registration-registration')}
                </button>
                {googleUser && (
                  <div className="google-user-info">
                    <img src={googleUser.picture} alt={t('profile_picture_alt-registration')} className="profile-picture" />
                    <p>{t('name_label-registration')}: {googleUser.name}</p>
                    <p>{t('email_label-registration')}: {googleUser.email}</p>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder={t('enter_password_placeholder-registration')}
                        value={googlePassword}
                        onChange={(e) => setGooglePassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                        className="input-field"
                      />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button className="register-button" onClick={handleGoogleSubmit}>
                      {t('continue_button-registration')}
                    </button>
                  </div>
                )}
              </div>
              {!googleUser && (
                <>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder={t('email_placeholder-registration')}
                      value={email}
                      onChange={handleEmailChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder={t('name_placeholder-registration')}
                      value={name}
                      onChange={handleNameChange}
                      className="input-field"
                      maxLength={255}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('password_placeholder-registration')}
                      value={password}
                      onChange={handlePasswordChange}
                      className="input-field"
                      maxLength={255}
                    />
                    {password.length > 0 && (
                      <img
                        src={passwordIconSrc}
                        alt={showPassword ? t('hide_password_alt-registration') : t('show_password_alt-registration')}
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                    {password.length > 0 && <span className="password-strength">{passwordStrength}</span>}
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('confirm_password_placeholder-registration')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                      maxLength={255}
                    />
                  </div>
                </>
              )}
              {error && !googleUser && <div className="error-message">{error}</div>}
              {!googleUser && (
                <button className="register-button" onClick={handleRegister}>
                  {t('register_button-registration')}
                </button>
              )}
              <div className="navigation-links">
                <span onClick={() => navigate(`/${getCurrentLanguage()}/login`)} className="navigation-link">
                  {t('login_link-registration')}
                </span>
                <span onClick={() => navigate(`/${getCurrentLanguage()}/`)} className="navigation-link">
                  {t('home_link-registration')}
                </span>
                <span onClick={() => navigate(`/${getCurrentLanguage()}/forgot-password`)} className="navigation-link">
                  {t('forgot_password_link-registration')}
                </span>
              </div>
            </>
          ) : (
            <div className="code-container">
              <h2>{t('code_verification_title-registration')}</h2>
              <p>{t('enter_code_message-registration', { email })}</p>
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
                {t('verify_button-registration')}
              </button>
              <button
                className="resend-button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? t('resend_code_cooldown-registration', { seconds: resendCooldown })
                  : t('resend_code_button-registration')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;