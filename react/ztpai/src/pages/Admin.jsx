import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BET_RESULTS = [
  { result_id: 1, result_name: 'home' },
  { result_id: 2, result_name: 'draw' },
  { result_id: 3, result_name: 'away' },
];

function Admin() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedResultId, setSelectedResultId] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
  axios
    .get('http://localhost:8001/api/admin', { withCredentials: true })
    .then((res) => {
      if (res.data.error) {
        setStatus(res.data.error);
        navigate('/login');
      } else {
        setEvents(res.data.events || []);
      }
    })
    .catch((err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setStatus('Brak dostępu. Zaloguj się jako administrator.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setStatus('Błąd podczas pobierania wydarzeń.');
      }
    });
}, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Wysyłanie...');
    setSummary(null);

    const formData = new FormData();
    formData.append('event_id', selectedEventId);
    formData.append('bet_result_id', selectedResultId);

    try {
      const res = await axios.post('http://localhost:8001/api/admin/finish-event', formData, { withCredentials: true });
      setSummary({
        message: res.data.success,
        winners: res.data.winners,
        losers: res.data.losers,
      });
      setStatus('Sukces!');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setStatus('Brak dostępu. Zaloguj się jako administrator.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setStatus(
          err.response?.data?.error ||
          'Wystąpił błąd podczas rozliczania wydarzenia.'
        );
      }
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2em auto', padding: 20, border: '1px solid #ddd' }}>
      <h2>Zakończ wydarzenie i rozlicz zakłady</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Wydarzenie:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            required
          >
            <option value="">-- Wybierz wydarzenie --</option>
            {events
              .filter((ev) => ev.status !== 2 && ev.status !== "2")
              .map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.event_name} ({ev.event_date})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label>Wynik meczu:</label>
          <select
            value={selectedResultId}
            onChange={(e) => setSelectedResultId(e.target.value)}
            required
          >
            <option value="">-- Wybierz wynik --</option>
            {BET_RESULTS.map((res) => (
              <option key={res.result_id} value={res.result_id}>
                {res.result_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={status === 'Wysyłanie...'}>
          Rozlicz wydarzenie
        </button>
      </form>
      {status && <div style={{ marginTop: 10 }}>{status}</div>}
      {summary && (
        <div style={{ marginTop: 15, background: '#eee', padding: 10 }}>
          <strong>{summary.message}</strong>
          <br />
          Wygranych: {summary.winners}
          <br />
          Przegranych: {summary.losers}
        </div>
      )}
    </div>
  );
}
export default Admin;
