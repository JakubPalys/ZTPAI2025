import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home({ user }) {
    const [events, setEvents] = useState([]);
    const [betAmount, setBetAmount] = useState(0);
    const [betChoice, setBetChoice] = useState('home');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8001/home', { withCredentials: true });
                if (response.data.events) {
                    setEvents(response.data.events);
                }
            } catch (err) {
                setError('Failed to fetch events');
            }
        };
        fetchEvents();
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

    return (
        <div>
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
            {error && <p>{error}</p>}
        </div>
    );
}

export default Home;
