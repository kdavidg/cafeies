import React, { useState } from 'react';

function LoginForm({ onLogin, onGoogleLogin }) {
  const [loginMode, setLoginMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <>
      <div className="login-tabs">
        <button
          className={`login-tab ${loginMode === 'signin' ? 'active' : ''}`}
          onClick={() => setLoginMode('signin')}
        >
          Iniciar sesión
        </button>

        <button
          className={`login-tab ${loginMode === 'signup' ? 'active' : ''}`}
          onClick={() => setLoginMode('signup')}
        >
          Registrarse
        </button>
      </div>

      {loginMode === 'signin' ? (
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="tu@email.com"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-register">
            Iniciar sesión
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Nombre completo"
            className="login-input"
            required
          />
          <input
            type="email"
            placeholder="tu@email.com"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-register">
            Crear cuenta
          </button>
        </form>
      )}

      <button className="btn-google" onClick={onGoogleLogin}>
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    style={{ marginRight: '12px' }}
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
  Continuar con cuenta de Google
</button>
    </>
  );
}

export default LoginForm;