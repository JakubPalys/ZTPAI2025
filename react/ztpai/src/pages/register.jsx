import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
            const logout = async () => {
                try {
                    await axios.post('http://localhost:8001/api/logout', {}, { withCredentials: true });
                } catch (err) {
                }
            };
            logout();
        }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
    
        const userData = {
            name: username,
            email,
            password
        };
    
        try {
            const response = await axios.post('http://localhost:8001/api/register', userData);
            setSuccessMessage(response.data.message);
            setError('');
            navigate('/login');

        } catch (err) {
            setError('Błąd rejestracji: ' + (err.response?.data.message || 'Spróbuj ponownie.'));
            setSuccessMessage('');
        }
    };
    
    return (
        <div>
            <h2>Rejestracja</h2>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label htmlFor="username">Nazwa użytkownika</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Hasło</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Zarejestruj się</button>
            </form>
            <p>Masz już konto? <a href="/login">Zaloguj się</a></p>
        </div>
    );
}

export default Register;
