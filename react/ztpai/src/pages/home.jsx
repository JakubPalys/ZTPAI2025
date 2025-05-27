import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [events, setEvents] = useState([]);
    const [betAmount, setBetAmount] = useState(0);
    const [betChoice, setBetChoice] = useState('home');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState('');

    useEffect(() => {
    const fetchUserAndEvents = async () => {
        try {
            const userRes = await axios.get('http://localhost:8001/api/me', { withCredentials: true });
            setUser(userRes.data.username);

            const eventsRes = await axios.get('http://localhost:8001/home', { withCredentials: true });
            if (eventsRes.data.events) {
                setEvents(eventsRes.data.events);
            }
        } catch (err) {
            setError('Nie udało się załadować danych');
        }
    };

    fetchUserAndEvents();
}, []);

    const handleBet = async (eventId) => {
        try {
            const response = await axios.post('http://localhost:8001/place-bet', {
                event_id: eventId,
                bet_amount: betAmount,
                bet_choice: betChoice,
            }, { withCredentials: true });

            if (response.data.success) {
                alert(`Bet placed! Potential win: ${response.data.potential_win}`);
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError('Error placing bet');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8001/logout', {}, { withCredentials: true });
            navigate('/login');
        } catch (err) {
            setError('Error logging out');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '50px' }}>
            <h2>Welcome, {user}</h2>
            <h3>Events</h3>
            <div>
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.id}>
                            <p>{event.home_team} vs {event.away_team}</p>
                            <p>{event.event_date}</p>
                            <p>Home Odds: {event.home_odds} | Away Odds: {event.away_odds} | Draw Odds: {event.draw_odds}</p>
                            <input
                                type="number"
                                placeholder="Bet Amount"
                                onChange={(e) => setBetAmount(e.target.value)}
                            />
                            <select onChange={(e) => setBetChoice(e.target.value)}>
                                <option value="home">Home</option>
                                <option value="away">Away</option>
                                <option value="draw">Draw</option>
                            </select>
                            <button onClick={() => handleBet(event.id)}>Place Bet</button>
                        </div>
                    ))
                ) : (
                    <p>Loading events...</p>
                )}
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Logout button in bottom-left corner */}
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
                Logout
            </button>
        </div>
    );
}

export default Home;
