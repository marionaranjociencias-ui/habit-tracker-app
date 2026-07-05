import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { signInWithGoogle, error, clearError, isConfigured } = useAuth();

  return (
    <div className="login-screen">
      <div className="login-screen__card">
        <p className="login-screen__tagline">Rastreador de hábitos gamificado</p>
        <h1 className="login-screen__title">Habit Tracker App</h1>
        <p className="login-screen__subtitle">
          Inicia sesión con tu cuenta de Google para acceder a tus hábitos.
        </p>

        {!isConfigured && (
          <div className="login-screen__alert login-screen__alert--warning" role="alert">
            Firebase no está configurado. Copia <code>.env.example</code> a{' '}
            <code>.env.local</code> y añade tus credenciales de Firebase.
          </div>
        )}

        {error && (
          <div className="login-screen__alert login-screen__alert--error" role="alert">
            {error}
            <button type="button" className="login-screen__dismiss" onClick={clearError}>
              ×
            </button>
          </div>
        )}

        <button
          type="button"
          className="login-screen__google-btn"
          onClick={signInWithGoogle}
          disabled={!isConfigured}
        >
          <span className="login-screen__google-icon" aria-hidden="true">
            G
          </span>
          Continuar con Google
        </button>

        <p className="login-screen__note">
          Fase 3 — Tus datos se sincronizan en la nube con tu cuenta de Google.
        </p>
      </div>
    </div>
  );
}
