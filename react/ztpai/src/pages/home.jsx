import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [events, setEvents] = useState([]);
    const [betAmounts, setBetAmounts] = useState({});
    const [betChoices, setBetChoices] = useState({});
    const [error, setError] = useState('');
    const [user, setUser] = useState('');
    const [points, setPoints] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUserAndEvents = async () => {
        try {
            const eventsRes = await axios.get('http://localhost:8001/api/home', { withCredentials: true });
            setUser(eventsRes.data.user.username);
            setPoints(eventsRes.data.user.points);
            if (eventsRes.data.events) {
                setEvents(eventsRes.data.events);
            }
        } catch (err) {
            setError('Nie udało się załadować danych');
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
                setBetAmounts({ ...betAmounts, [eventId]: '' }); // czyść input
                fetchUserAndEvents(); // odśwież dane na stronie
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

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '50px' }}>
            <h2>Witaj, {user} masz {loading ? '...' : points} punktów</h2>
            <h3>Wydarzenia</h3>

            {loading ? (
                <p>Ładowanie danych...</p>
            ) : (
                <div>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div key={event.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '15px', paddingBottom: '10px' }}>
                                <p><strong>{event.event_name}</strong></p>
                                <p>Data: {formatDate(event.event_date)}</p>
                                <p>Kursy: Dom {event.home_odds.toFixed(2)} | Goście {event.away_odds.toFixed(2)} | Remis {event.draw_odds.toFixed(2)}</p>

                                <input
                                    type="number"
                                    placeholder="Kwota zakładu"
                                    value={betAmounts[event.id] || ''}
                                    onChange={(e) => setBetAmounts({ ...betAmounts, [event.id]: e.target.value })}
                                    min="1"
                                />
                                <select
                                    value={betChoices[event.id] || 'home'}
                                    onChange={(e) => setBetChoices({ ...betChoices, [event.id]: e.target.value })}
                                >
                                    <option value="home">Dom</option>
                                    <option value="away">Goście</option>
                                    <option value="draw">Remis</option>
                                </select>
                                <button onClick={() => handleBet(event.id)}>Postaw zakład</button>
                            </div>
                        ))
                    ) : (
                        <p>Brak wydarzeń w tym okresie.</p>
                    )}
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button
                onClick={handleLogout}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    left: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#d9534f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Wyloguj
            </button>
        </div>
    );
}

export default Home;
