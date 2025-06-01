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
import './ForgotPassword.css';
import sanitizeHtml from 'sanitize-html';
import { getCurrentLanguage } from '../../../i18n';

interface GoogleUser {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resetKey, setResetKey] = useState('');
  const [isCodeStage, setIsCodeStage] = useState(false);
  const [isPasswordStage, setIsPasswordStage] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordIconSrc = showPassword
    ? theme === 'light' ? '/assets/view-dark.png' : '/assets/view-light.png'
    : theme === 'light' ? '/assets/hide-dark.png' : '/assets/hide-light.png';

  const containerBackground = theme === 'light'
    ? '/assets/page-bg-light.jpg'
    : '/assets/page-bg-dark.jpg';

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('email_required-forgotpass'));
      return;
    }
    if (email.length > 255) {
      setError(t('email_too_long-forgotpass'));
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
          setError(data.message || t('send_error-forgotpass'));
        }
      } else {
        setError(t('no_server_connection-forgotpass'));
      }
    } catch (error) {
      setError(t('no_server_connection-forgotpass'));
      console.error(t('network_error_console-forgotpass'), error);
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
      setError(t('enter_six_digit_code-forgotpass'));
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
          setResetKey(data.reset_key);
          setIsCodeStage(false);
          setIsPasswordStage(true);
          setError('');
        } else {
          setError(data.message || t('invalid_verification_code-forgotpass'));
        }
      } else {
        setError(t('no_server_connection-forgotpass'));
      }
    } catch (error) {
      setError(t('no_server_connection-forgotpass'));
      console.error(t('network_error_console-forgotpass'), error);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError(t('email_required-forgotpass'));
      return;
    }
    if (email.length > 255) {
      setError(t('email_too_long-forgotpass'));
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
          setError(data.message || t('resend_code_failed-forgotpass'));
        }
      } else {
        setError(t('no_server_connection-forgotpass'));
      }
    } catch (error) {
      setError(t('no_server_connection-forgotpass'));
      console.error(t('resend_error_console-forgotpass'), error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword || !confirmNewPassword) {
      setError(t('all_fields_required-forgotpass'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t('passwords_do_not_match-forgotpass'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('password_too_short-forgotpass'));
      return;
    }
    if (newPassword.length > 255) {
      setError(t('password_too_long-forgotpass'));
      return;
    }
    if (!resetKey) {
      setError(t('reset_key_missing-forgotpass'));
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
          navigate('/');
        } else {
          setError(data.message || t('password_update_error-forgotpass'));
        }
      } else {
        setError(t('no_server_connection-forgotpass'));
      }
    } catch (error) {
      setError(t('no_server_connection-forgotpass'));
      console.error(t('network_error_console-forgotpass'), error);
    }
  };

  const handleGoogleForgotPassword = async () => {
    if (!googleAccessToken) {
      setError(t('google_login_required-forgotpass'));
      return;
    }

    try {
      const response = await fetch('/google-forgot-pass.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ access_token: googleAccessToken }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.status === 'ok') {
          setIsCodeStage(true);
          setError('');
        } else {
          setError(data.message || t('send_error-forgotpass'));
        }
      } else {
        setError(t('no_server_connection-forgotpass'));
      }
    } catch (error) {
      setError(t('no_server_connection-forgotpass'));
      console.error(t('network_error_console-forgotpass'), error);
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
          setError(t('google_user_info_error-forgotpass'));
          console.error(t('error_console-forgotpass'), error);
        });
    },
    onError: () => {
      setError(t('google_auth_error-forgotpass'));
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
          {!isCodeStage && !isPasswordStage && <h2>{t('forgot_password_title-forgotpass')}</h2>}
          {!isCodeStage && !isPasswordStage && (
            <button className="google-ForgotPassword" onClick={() => login()}>
              <img
                src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'}
                alt={t('google_icon_alt-forgotpass')}
                className="google-icon"
              />
              {t('google_forgot_password-forgotpass')}
            </button>
          )}
          {googleUser ? (
            <div className="google-user-info">
              {isPasswordStage ? (
                <div className="password-container">
                  <h2>{t('set_new_password_title-forgotpass')}</h2>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('new_password_placeholder-forgotpass')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                    {newPassword.length > 0 && (
                      <img
                        src={passwordIconSrc}
                        alt={showPassword ? t('hide_password_alt-forgotpass') : t('show_password_alt-forgotpass')}
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('confirm_new_password_placeholder-forgotpass')}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button className="ForgotPassword-button" onClick={handlePasswordSubmit}>
                    {t('save_button-forgotpass')}
                  </button>
                </div>
              ) : isCodeStage ? (
                <div className="code-container">
                  <h2>{t('code_verification_title-forgotpass')}</h2>
                  <p>{t('enter_code_message-forgotpass', { email: googleUser.email })}</p>
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
                    {t('verify_button-forgotpass')}
                  </button>
                  <button
                    className="resend-button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? t('resend_code_cooldown-forgotpass', { seconds: resendCooldown })
                      : t('resend_code_button-forgotpass')}
                  </button>
                </div>
              ) : (
                <>
                  {error && <div className="error-message">{error}</div>}
                  <button className="ForgotPassword-button" onClick={handleGoogleForgotPassword}>
                    {t('send_code_button-forgotpass')}
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
                    placeholder={t('email_placeholder-forgotpass')}
                    value={email}
                    onChange={(e) => setEmail(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                    className="input-field"
                  />
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              {!isCodeStage && !isPasswordStage && (
                <button className="ForgotPassword-button" onClick={handleForgotPassword}>
                  {t('send_code_button-forgotpass')}
                </button>
              )}
              {isPasswordStage && (
                <div className="password-container">
                  <h2>{t('set_new_password_title-forgotpass')}</h2>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('new_password_placeholder-forgotpass')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                    {newPassword.length > 0 && (
                      <img
                        src={passwordIconSrc}
                        alt={showPassword ? t('hide_password_alt-forgotpass') : t('show_password_alt-forgotpass')}
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('confirm_new_password_placeholder-forgotpass')}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(sanitizeHtml(e.target.value, { allowedTags: [], allowedAttributes: {} }))}
                      className="input-field"
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button className="ForgotPassword-button" onClick={handlePasswordSubmit}>
                    {t('save_button-forgotpass')}
                  </button>
                </div>
              )}
              {isCodeStage && (
                <div className="code-container">
                  <h2>{t('code_verification_title-forgotpass')}</h2>
                  <p>{t('enter_code_message-forgotpass', { email })}</p>
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
                    {t('verify_button-forgotpass')}
                  </button>
                  <button
                    className="resend-button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? t('resend_code_cooldown-forgotpass', { seconds: resendCooldown })
                      : t('resend_code_button-forgotpass')}
                  </button>
                </div>
              )}
            </>
          )}
          <div className="navigation-links">
            <span onClick={() => navigate(`/${getCurrentLanguage()}/registration`)} className="navigation-link">
              {t('registration_link-forgotpass')}
            </span>
            <span onClick={() => navigate(`/${getCurrentLanguage()}/`)} className="navigation-link">
              {t('home_link-forgotpass')}
            </span>
            <span onClick={() => navigate(`/${getCurrentLanguage()}/login`)} className="navigation-link">
              {t('login_link-forgotpass')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;