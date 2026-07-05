import { useAuth } from '../hooks/useAuth';

export function AuthHeader() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const displayName = user.displayName ?? 'Usuario';
  const email = user.email ?? '';
  const photoURL = user.photoURL;

  return (
    <div className="auth-header">
      <div className="auth-header__info">
        {photoURL ? (
          <img src={photoURL} alt="" className="auth-header__avatar" />
        ) : (
          <span className="auth-header__avatar auth-header__avatar--placeholder" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="auth-header__text">
          <span className="auth-header__name">{displayName}</span>
          {email && <span className="auth-header__email">{email}</span>}
        </div>
      </div>
      <button type="button" className="auth-header__logout" onClick={signOut}>
        Cerrar sesión
      </button>
    </div>
  );
}
