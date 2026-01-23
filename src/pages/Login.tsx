import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Login = () => {
  const { loginGoogle, session, loading } = useAuth();

  // Se já estiver logado, chuta para a Home
  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f3f4f6' 
    }}>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '1rem', color: '#1f2937' }}>BR Clube Interno</h1>
        <p style={{ marginBottom: '2rem', color: '#4b5563' }}>
          Sistema administrativo exclusivo para colaboradores.
        </p>
        
        <button 
          onClick={loginGoogle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {/* Ícone do Google (SVG) */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.566 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
};