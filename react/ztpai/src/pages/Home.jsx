import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const styleSheet = `
@media (max-width: 1200px) {
  .home-content {
    max-width: 98vw !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
}
@media (max-width: 900px) {
  .home-content {
    max-width: 100vw !important;
    padding: 18px 5px 28px 5px !important;
  }
  .home-logo {
    width: 120px !important;
  }
  .home-action-btn, .home-logout-btn {
    font-size: 13px !important;
    padding: 8px 14px !important;
  }
  .home-event-box {
    padding: 14px 8px 10px 8px !important;
  }
  .home-event-box p {
    font-size: 14px !important;
  }
}
@media (max-width: 600px) {
  .home-content {
    max-width: 100vw !important;
    padding: 8px 2px 15px 2px !important;
  }
  .home-logo {
    width: 85px !important;
  }
  .home-action-btn, .home-logout-btn {
    font-size: 11px !important;
    padding: 6px 7px !important;
  }
  .home-content h2, .home-content h3 {
    font-size: 1.0rem !important;
  }
  .home-event-box {
    padding: 8px 4px 7px 4px !important;
  }
  .home-event-box p {
    font-size: 11px !important;
  }
}
@media (max-width: 450px) {
  .home-content {
    padding: 0px 0px 12px 0px !important;
  }
  .home-content h2, .home-content h3 {
    font-size: 0.95rem !important;
  }
  .home-event-box p {
    font-size: 9.5px !important;
  }
}
`;

function Home() {
    const [events, setEvents] = useState([]);
    const [betAmounts, setBetAmounts] = useState({});
    const [betChoices, setBetChoices] = useState({});
    const [error, setError] = useState('');
    const [user, setUser] = useState('');
    const [role, setRole] = useState('');
    const [points, setPoints] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!document.getElementById('home-responsive-styles')) {
            const style = document.createElement('style');
            style.textContent = styleSheet;
            style.id = 'home-responsive-styles';
            document.head.appendChild(style);
        }
    }, []);

    const fetchUserAndEvents = async () => {
        try {
            const eventsRes = await axios.get('http://localhost:8001/api/home', { withCredentials: true });
            setUser(eventsRes.data.user.username);
            setRole(eventsRes.data.user.role);
            setPoints(eventsRes.data.user.points);
            if (eventsRes.data.events) {
                setEvents(eventsRes.data.events);
            }
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            } else {
                setError('Nie udało się załadować danych');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserAndEvents();
    }, []);

    const handleBet = async (eventId) => {
        try {
            const betAmount = parseFloat(betAmounts[eventId]) || 0;
            const betChoice = betChoices[eventId] || 'home';
            const eventData = {
                event_id: eventId,
                bet_amount: betAmount,
                bet_choice: betChoice,
            };

            const response = await axios.post('http://localhost:8001/api/place-bet',
                eventData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                alert(`Bet placed! Potential win: ${response.data.potential_win}`);
                setBetAmounts({ ...betAmounts, [eventId]: '' });
                fetchUserAndEvents();
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError('Error placing bet');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8001/api/logout', {}, { withCredentials: true });
            navigate('/login');
        } catch (err) {
            setError('Error logging out');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    const goToAdmin = () => {
        navigate('/admin');
    };

    const goToHome = () => {
        navigate('/home');
    }

    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
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
                    className="home-logo"
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
                alignItems: 'center',
            }}>
                <div
                    className="home-content"
                    style={{
                        maxWidth: '820px',
                        width: '100%',
                        background: 'rgba(24,25,26,0.98)',
                        borderRadius: '18px',
                        boxShadow: '0 6px 32px 0 rgba(0,0,0,0.12)',
                        padding: '30px 40px 40px 40px',
                        margin: '0 auto'
                    }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <h2 style={{ color: '#fff', fontWeight: 500, margin: 0 }}>
                            Witaj, {user} masz {loading ? '...' : points} punktów
                        </h2>
                        <button
                            onClick={goToProfile}
                            className="home-action-btn"
                            style={{
                                height: '38px',
                                padding: '0 24px',
                                background: 'linear-gradient(90deg, #45484d 0%, #6f7073 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                boxShadow: '0 2px 8px 0 rgba(66,134,244,0.10)',
                                transition: 'background 0.15s'
                            }}
                        >
                            <span role="img" aria-label="profile" style={{ marginRight: 7 }}>👤</span>
                            Profil
                        </button>
                        {role === 'admin' && (
                            <button
                                onClick={goToAdmin}
                                className="home-action-btn"
                                style={{
                                    height: '38px',
                                    padding: '0 24px',
                                    background: 'linear-gradient(90deg, #6c6e70 0%, #434547 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '7px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 16,
                                    boxShadow: '0 2px 8px 0 rgba(67,206,162,0.10)',
                                    transition: 'background 0.15s'
                                }}
                            >
                                <span role="img" aria-label="admin" style={{ marginRight: 7 }}>🛠️</span>
                                Panel admina
                            </button>
                        )}
                    </div>
                    <h3 style={{ color: '#fff' }}>Wydarzenia</h3>

                    {loading ? (
                        <p style={{ color: '#bbb' }}>Ładowanie danych...</p>
                    ) : (
                        <div>
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <div key={event.id} className="home-event-box" style={{
                                        borderBottom: '1px solid #313131',
                                        marginBottom: '18px',
                                        paddingBottom: '14px',
                                        background: 'rgba(44,45,46,0.92)',
                                        borderRadius: '10px',
                                        padding: '18px 18px 14px 18px',
                                        color: '#eaeaea',
                                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)'
                                    }}>
                                        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{event.event_name}</p>
                                        <p style={{ margin: 0, color: '#bbb' }}>Data: {formatDate(event.event_date)}</p>
                                        <p style={{ margin: '6px 0 10px 0', color: '#bbb' }}>
                                            Kursy: <span style={{ color: '#fff' }}>Dom {event.home_odds.toFixed(2)}</span> |{' '}
                                            <span style={{ color: '#fff' }}>Goście {event.away_odds.toFixed(2)}</span> |{' '}
                                            <span style={{ color: '#fff' }}>Remis {event.draw_odds.toFixed(2)}</span>
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <input
                                                type="number"
                                                placeholder="Kwota zakładu"
                                                value={betAmounts[event.id] || ''}
                                                onChange={(e) => setBetAmounts({ ...betAmounts, [event.id]: e.target.value })}
                                                min="1"
                                                style={{
                                                    padding: '8px 10px',
                                                    borderRadius: 6,
                                                    border: '1px solid #333',
                                                    background: '#232526',
                                                    color: '#fff',
                                                    fontSize: 15,
                                                    width: 120
                                                }}
                                            />
                                            <select
                                                value={betChoices[event.id] || 'home'}
                                                onChange={(e) => setBetChoices({ ...betChoices, [event.id]: e.target.value })}
                                                style={{
                                                    padding: '8px 10px',
                                                    borderRadius: 6,
                                                    border: '1px solid #333',
                                                    background: '#232526',
                                                    color: '#fff',
                                                    fontSize: 15
                                                }}
                                            >
                                                <option value="home">Dom</option>
                                                <option value="away">Goście</option>
                                                <option value="draw">Remis</option>
                                            </select>
                                            <button
                                                onClick={() => handleBet(event.id)}
                                                className="home-action-btn"
                                                style={{
                                                    padding: '10px 18px',
                                                    borderRadius: 6,
                                                    border: 'none',
                                                    background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    fontSize: 15,
                                                    cursor: 'pointer',
                                                    marginLeft: 6,
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                Postaw zakład
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#bbb' }}>Brak wydarzeń w tym okresie.</p>
                            )}
                        </div>
                    )}

                    {error && <p style={{ color: '#FF5252', marginTop: 16 }}>{error}</p>}
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="home-logout-btn"
                style={{
                    position: 'fixed',
                    bottom: '12px',
                    left: '12px',
                    padding: '13px 30px',
                    background: 'linear-gradient(90deg, #888 0%, #666 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: '0 2px 12px 0 rgba(217,83,79,0.10)',
                    transition: 'background 0.15s'
                }}
            >
                Wyloguj
            </button>
        </div>
    );
}

export default Home;