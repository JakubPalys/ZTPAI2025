import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.svg';

const styleSheet = `
@media (max-width: 900px) {
  .register-container {
    min-width: 250px !important;
    width: 95vw !important;
    padding: 32px 10px 28px 10px !important;
  }
  .register-logo {
    width: 180px !important;
    margin-bottom: 24px !important;
  }
  .register-title {
    font-size: 24px !important;
    margin-bottom: 16px !important;
  }
}
@media (max-width: 600px) {
  .register-container {
    min-width: 0 !important;
    width: 99vw !important;
    padding: 14px 2vw 12px 2vw !important;
  }
  .register-logo {
    width: 120px !important;
    margin-bottom: 16px !important;
  }
  .register-title {
    font-size: 18px !important;
    margin-bottom: 9px !important;
  }
  .register-link-login {
    font-size: 12px !important;
  }
  .register-label {
    font-size: 13px !important;
  }
  .register-input {
    font-size: 13px !important;
    padding: 10px 7px !important;
  }
  .register-btn {
    font-size: 14px !important;
    padding: 10px 0 !important;
  }
}
`;

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!document.getElementById('register-responsive-styles')) {
            const style = document.createElement('style');
            style.textContent = styleSheet;
            style.id = 'register-responsive-styles';
            document.head.appendChild(style);
        }
        const logout = async () => {
            try {
                await axios.post('http://localhost:8001/api/logout', {}, { withCredentials: true });
            } catch (err) {}
        };
        logout();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        const userData = { name: username, email, password };
        try {
            const response = await axios.post('http://localhost:8001/api/register', userData);
            alert(response.data.message);
            setError('');
            navigate('/login');
        } catch (err) {
            setError('Błąd rejestracji: ' + (err.response?.data.message || 'Spróbuj ponownie.'));
            setSuccessMessage('');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Inter, Arial, sans-serif'
        }}>
            <div className="register-container" style={{
                background: '#18191A',
                borderRadius: '18px',
                boxShadow: '0 8px 40px 0 rgba(0,0,0,0.22)',
                padding: '64px 56px 48px 56px',
                minWidth: 400,
                width: 420,
                maxWidth: '95vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <img
                    src={logo}
                    alt="Bettson"
                    className="register-logo"
                    style={{
                        width: 300, 
                        maxWidth: '90%',
                        marginBottom: 38,
                        filter: 'brightness(0) invert(1)',  
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        transition: 'width 0.2s'
                    }}
                />
                <h2 className="register-title" style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 32,
                    marginBottom: 24,
                    letterSpacing: 2
                }}>Rejestracja</h2>
                {successMessage && <p style={{ color: 'green', marginBottom: 18 }}>{successMessage}</p>}
                {error && <p style={{ color: '#FF5252', marginBottom: 18, fontSize: 16 }}>{error}</p>}
                <form onSubmit={handleRegister} style={{ width: '100%' }}>
                    <div style={{ marginBottom: 22 }}>
                        <label htmlFor="username" className="register-label" style={{ color: '#bbb', fontSize: 16, marginBottom: 6, display: 'block' }}>Nazwa użytkownika</label>
                        <input
                            type="text"
                            id="username"
                            className="register-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 15px',
                                borderRadius: 8,
                                border: '1.5px solid #333',
                                background: '#232526',
                                color: '#fff',
                                fontSize: 17,
                                outline: 'none',
                                transition: 'border 0.2s',
                                marginTop: 2
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label htmlFor="email" className="register-label" style={{ color: '#bbb', fontSize: 16, marginBottom: 6, display: 'block' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className="register-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 15px',
                                borderRadius: 8,
                                border: '1.5px solid #333',
                                background: '#232526',
                                color: '#fff',
                                fontSize: 17,
                                outline: 'none',
                                transition: 'border 0.2s',
                                marginTop: 2
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 32 }}>
                        <label htmlFor="password" className="register-label" style={{ color: '#bbb', fontSize: 16, marginBottom: 6, display: 'block' }}>Hasło</label>
                        <input
                            type="password"
                            id="password"
                            className="register-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 15px',
                                borderRadius: 8,
                                border: '1.5px solid #333',
                                background: '#232526',
                                color: '#fff',
                                fontSize: 17,
                                outline: 'none',
                                transition: 'border 0.2s',
                                marginTop: 2
                            }}
                        />
                    </div>
                    <button type="submit" className="register-btn" style={{
                        width: '100%',
                        padding: '15px 0',
                        border: 'none',
                        borderRadius: 8,
                        background: 'linear-gradient(90deg, #2c2c2e 0%, #1f1f1f 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: 1,
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}>
                        Zarejestruj się
                    </button>
                </form>
                <p className="register-link-login" style={{ color: '#aaa', marginTop: 28, fontSize: 15 }}>
                    Masz już konto?{' '}
                    <a href="/login" style={{
                        color: '#fff',
                        textDecoration: 'underline',
                        fontWeight: 600
                    }}>Zaloguj się</a>
                </p>
            </div>
        </div>
    );
}

export default Register;