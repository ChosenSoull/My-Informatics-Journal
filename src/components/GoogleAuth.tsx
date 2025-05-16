import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './GoogleAuth.css';

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

const GoogleAuth: React.FC = () => {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSuccess = (credentialResponse: any) => {
    const userObject: GoogleUser = jwtDecode(credentialResponse.credential);
    setGoogleUser(userObject);
  };

  const handleGoogleError = () => {
    setError('Помилка авторизації через Google');
  };

  const handleSubmit = async () => {
    if (!googleUser) {
      setError('Спочатку увійдіть через Google');
      return;
    }
    if (!password) {
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
          password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          window.location.href = '/';
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

  return (
    <div className="google-auth-container">
      {!googleUser ? (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}
        />
      ) : (
        <div className="google-user-info">
          <img src={googleUser.picture} alt="Profile" className="profile-picture" />
          <p>Ім'я: {googleUser.name}</p>
          <p>Email: {googleUser.email}</p>
          <div className="form-group">
            <input
              type="password"
              placeholder="Введіть пароль для акаунта"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button className="submit-button" onClick={handleSubmit}>
            Продовжити
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;