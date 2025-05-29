import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.svg';

function Profile() {
    const [user, setUser] = useState(null);
    const [activeBets, setActiveBets] = useState([]);
    const [completedBets, setCompletedBets] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:8001/api/profile', { withCredentials: true });
            setUser(res.data.user);
            setActiveBets(res.data.activeBets);
            setCompletedBets(res.data.completedBets);
        } catch (err) {
            // Autoryzacja - jeśli nie zalogowany, przekieruj do login
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            } else {
                setError('Failed to fetch profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const res = await axios.post(
                'http://localhost:8001/api/profile/change-password',
                {
                    old_password: oldPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (res.data.success) {
                setSuccessMsg(res.data.success);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(res.data.error || 'Failed to change password.');
            }
        } catch (err) {
            setError('Failed to change password.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This cannot be undone!')) {
            return;
        }
        setError('');
        setSuccessMsg('');
        try {
            const res = await axios.post(
                'http://localhost:8001/api/profile/delete',
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                setSuccessMsg(res.data.success + ' (You will be logged out)');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(res.data.error || 'Failed to delete account.');
            }
        } catch (err) {
            setError('Failed to delete account.');
        }
    };

    const formatDate = (input) => {
        if (!input) return '';
        if (typeof input === 'object' && input.date) {
            return new Date(input.date).toLocaleString('pl-PL');
        }
        if (typeof input === 'string') {
            return new Date(input).toLocaleString('pl-PL');
        }
        return '';
    };

    // Logo click
    const goToHome = () => {
        navigate('/home');
    };

    // Stylizacja kafelków zakładów
    const betCardStyle = outcome => ({
        background: outcome === 1
            ? 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)'           // ciemniejszy gradient
            : outcome === 2
            ? 'linear-gradient(90deg, #d9534f 0%, #c9302c 100%)'
            : 'rgba(44,45,46,0.92)',
        color: '#fff',
        borderRadius: 10,
        padding: '18px 20px 14px 20px',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.09)',
        marginBottom: 16,
        border: outcome === 1
            ? '2px solid #18e06f'
            : outcome === 2
            ? '2px solid #d9534f'
            : '1.5px solid #232526',
        display: 'flex',
        flexDirection: 'column',
        gap: 7
    });

    // Badge typu zakładu
    const badgeStyle = (choice) => ({
        display: 'inline-block',
        padding: '3px 11px',
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 14,
        background: choice === 'home'
            ? 'rgba(20, 63, 131, 0.18)'
            : choice === 'draw'
            ? 'rgba(180, 180, 180, 0.18)'
            : 'rgba(46, 204, 112, 0.18)',
        color: choice === 'home'
            ? '#337ab7'
            : choice === 'draw'
            ? '#bbb'
            : '#18e06f',
        marginLeft: 5,
    });

    // Badge wyniku
    const resultBadge = (outcome) => ({
        display: 'inline-block',
        padding: '3px 11px',
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 14,
        background: outcome === 1
            ? 'rgba(34, 49, 63, 0.22)' 
            : outcome === 2
            ? 'rgba(34, 49, 63, 0.22)'
            : 'rgba(180, 180, 180, 0.22)',
        color: outcome === 1
            ? '#18e06f'
            : outcome === 2
            ? '#d9534f'
            : '#bbb',
        marginLeft: 10,
        border: outcome === 1 ? '1.5px solid #fff' : undefined,
        textShadow: outcome === 1 ? '0 1px 4px rgba(17,153,142,0.4)' : undefined
});
    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Logo u góry, wyśrodkowane */}
            <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '34px 0 20px 0',
                boxSizing: 'border-box'
            }}>
                <img
                    src={logo}
                    alt="Bettson"
                    style={{
                        width: 180,
                        height: 'auto',
                        cursor: 'pointer',
                        filter: 'brightness(0) invert(1)',
                        transition: 'transform 0.15s',
                    }}
                    onClick={goToHome}
                    title="Strona główna"
                />
            </div>
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{
                    maxWidth: '600px',
                    width: '100%',
                    background: 'rgba(24,25,26,0.98)',
                    borderRadius: '18px',
                    boxShadow: '0 6px 32px 0 rgba(0,0,0,0.12)',
                    padding: '30px 40px 40px 40px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ color: '#fff', fontWeight: 600, marginBottom: 18 }}>Profil</h2>
                    {loading ? (
                        <p style={{ color: '#bbb' }}>Ładowanie...</p>
                    ) : error ? (
                        <p style={{ color: '#FF5252' }}>{error}</p>
                    ) : (
                        <>
                            {user && (
                                <div style={{
                                    marginBottom: 24,
                                    background: 'rgba(44,45,46,0.92)',
                                    borderRadius: 10,
                                    padding: '16px 18px',
                                    color: '#eaeaea',
                                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)'
                                }}>
                                    <p><b>Nazwa użytkownika:</b> {user.username}</p>
                                    <p><b>Email:</b> {user.email}</p>
                                    <p><b>Punkty:</b> {user.points}</p>
                                </div>
                            )}

                            <h3 style={{ color: '#fff', marginBottom: 8 }}>Aktywne zakłady</h3>
                            {activeBets.length === 0 ? (
                                <p style={{ color: '#bbb', marginBottom: 14 }}>Brak aktywnych zakładów.</p>
                            ) : (
                                <div style={{ marginBottom: 18 }}>
                                    {activeBets.map((bet, idx) => (
                                        <div key={idx} style={betCardStyle()}>
                                            <div style={{ fontWeight: 600, fontSize: 17, color: '#fff', marginBottom: 2 }}>
                                                {bet.event_name || 'N/A'}
                                                <span style={badgeStyle(bet.bet_choice)}>{bet.bet_choice === 'home' ? 'Dom' : bet.bet_choice === 'draw' ? 'Remis' : 'Goście'}</span>
                                            </div>
                                            <div style={{ color: '#ddd', fontSize: 15 }}>
                                                <span style={{ marginRight: 16 }}><b>Kwota:</b> {bet.bet_amount} pkt</span>
                                                <span style={{ marginRight: 16 }}><b>Możliwa wygrana:</b> {bet.potential_win} pkt</span>
                                                <span><b>Data:</b> {formatDate(bet.bet_date)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3 style={{ color: '#fff', marginBottom: 8 }}>Zakończone zakłady</h3>
                            {completedBets.length === 0 ? (
                                <p style={{ color: '#bbb', marginBottom: 14 }}>Brak zakończonych zakładów.</p>
                            ) : (
                                <div style={{ marginBottom: 18 }}>
                                    {completedBets.map((bet, idx) => (
                                        <div key={idx} style={betCardStyle(bet.outcome)}>
                                            <div style={{ fontWeight: 600, fontSize: 17, color: '#fff', marginBottom: 2 }}>
                                                {bet.event_name || 'N/A'}
                                                <span style={badgeStyle(bet.bet_choice)}>{bet.bet_choice === 'home' ? 'Dom' : bet.bet_choice === 'draw' ? 'Remis' : 'Goście'}</span>
                                                <span style={resultBadge(bet.outcome)}>
                                                    {bet.outcome === 1 ? 'Wygrana' : bet.outcome === 2 ? 'Przegrana' : 'Nierozliczony'}
                                                </span>
                                            </div>
                                            <div style={{ color: '#ddd', fontSize: 15 }}>
                                                <span style={{ marginRight: 16 }}><b>Kwota:</b> {bet.bet_amount} pkt</span>
                                                <span style={{ marginRight: 16 }}><b>Możliwa wygrana:</b> {bet.potential_win} pkt</span>
                                                <span style={{ marginRight: 16 }}><b>Data:</b> {formatDate(bet.bet_date)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3 style={{ color: '#fff', marginBottom: 8 }}>Zmiana hasła</h3>
                            <form onSubmit={handleChangePassword} style={{ marginBottom: 26 }}>
                                <div style={{ marginBottom: 10 }}>
                                    <input
                                        type="password"
                                        placeholder="Stare hasło"
                                        value={oldPassword}
                                        onChange={e => setOldPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            marginBottom: 7,
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: 10 }}>
                                    <input
                                        type="password"
                                        placeholder="Nowe hasło"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            marginBottom: 7,
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: 18 }}>
                                    <input
                                        type="password"
                                        placeholder="Powtórz nowe hasło"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '13px 0',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 17,
                                        letterSpacing: 1,
                                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Zmień hasło
                                </button>
                            </form>

                            <h3 style={{ color: '#fff', marginBottom: 8 }}>Strefa niebezpieczna</h3>
                            <button
                                style={{
                                    width: '100%',
                                    padding: '13px 0',
                                    border: 'none',
                                    borderRadius: 8,
                                    background: 'linear-gradient(90deg, #d9534f 0%, #c9302c 100%)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 17,
                                    letterSpacing: 1,
                                    boxShadow: '0 2px 12px 0 rgba(217,83,79,0.10)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onClick={handleDeleteAccount}
                            >
                                Usuń konto
                            </button>
                        </>
                    )}
                    {successMsg && <p style={{ color: '#2ecc40', marginTop: 14 }}>{successMsg}</p>}
                </div>
            </div>
        </div>
    );
}

export default Profile;