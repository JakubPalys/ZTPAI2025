import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8001/api/login', { email, password },{ withCredentials: true });
            alert(response.data.message);
            setError('');
            navigate('/home');
        } catch (err) {
            setError('Błąd logowania: ' + (err.response?.data.error || 'Spróbuj ponownie.'));
        }
    };

    return (
        <div>
            <h2>Logowanie</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
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
                <button type="submit">Zaloguj się</button>
            </form>
            <p>Nie masz konta? <a href="/register">Zarejestruj się</a></p>
        </div>
    );
}

export default Login;
