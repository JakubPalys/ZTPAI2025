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

  // Add Event
  const [addEventName, setAddEventName] = useState('');
  const [addEventDate, setAddEventDate] = useState('');
  const [addHomeOdds, setAddHomeOdds] = useState('');
  const [addAwayOdds, setAddAwayOdds] = useState('');
  const [addDrawOdds, setAddDrawOdds] = useState('');
  const [addEventStatus, setAddEventStatus] = useState('');

  // Delete Event
  const [deleteEventId, setDeleteEventId] = useState('');
  const [deleteEventStatus, setDeleteEventStatus] = useState('');

  // Add Points To All Users
  const [addPoints, setAddPoints] = useState('');
  const [addPointsStatus, setAddPointsStatus] = useState('');

  const navigate = useNavigate();

  // Fetch events on mount or after add/delete
  const fetchEvents = () => {
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
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [navigate]);

  // Finish Event
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
      fetchEvents();
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

  // Add Event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setAddEventStatus('Wysyłanie...');
    const formData = new FormData();
    formData.append('event_name', addEventName);
    formData.append('event_date', addEventDate);
    formData.append('home_odds', addHomeOdds);
    formData.append('away_odds', addAwayOdds);
    formData.append('draw_odds', addDrawOdds);

    try {
      const res = await axios.post('http://localhost:8001/api/admin/add-event', formData, { withCredentials: true });
      setAddEventStatus(res.data.success || 'Dodano wydarzenie!');
      setAddEventName('');
      setAddEventDate('');
      setAddHomeOdds('');
      setAddAwayOdds('');
      setAddDrawOdds('');
      fetchEvents();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAddEventStatus('Brak dostępu. Zaloguj się jako administrator.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setAddEventStatus(err.response?.data?.error || 'Błąd przy dodawaniu wydarzenia.');
      }
    }
  };

  // Delete Event
  const handleDeleteEvent = async (e) => {
    e.preventDefault();
    setDeleteEventStatus('Usuwanie...');
    const formData = new FormData();
    formData.append('event_id', deleteEventId);

    try {
      const res = await axios.post('http://localhost:8001/api/admin/delete-event', formData, { withCredentials: true });
      setDeleteEventStatus(res.data.success || 'Usunięto wydarzenie!');
      setDeleteEventId('');
      fetchEvents();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setDeleteEventStatus('Brak dostępu. Zaloguj się jako administrator.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setDeleteEventStatus(err.response?.data?.error || 'Błąd przy usuwaniu wydarzenia.');
      }
    }
  };

  // Add Points To All Users
  const handleAddPoints = async (e) => {
    e.preventDefault();
    setAddPointsStatus('Wysyłanie...');
    try {
      const response = await axios.post(
        'http://localhost:8001/api/admin/add-points',
        { points: addPoints },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      setAddPointsStatus(response.data.success || 'Punkty zostały dodane!');
      setAddPoints('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAddPointsStatus('Brak dostępu. Zaloguj się jako administrator.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setAddPointsStatus(err.response?.data?.error || 'Błąd przy dodawaniu punktów.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2em auto', padding: 20, border: '1px solid #ddd' }}>
      {/* Panel: Zakończ wydarzenie */}
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
                  {ev.event_name} ({ev.event_date}) [Kursy: {ev.home_odds}/{ev.draw_odds}/{ev.away_odds}]
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

      {/* Panel: Dodaj wydarzenie */}
      <hr style={{ margin: '2em 0' }} />
      <h2>Dodaj wydarzenie</h2>
      <form onSubmit={handleAddEvent}>
        <div>
          <label>Nazwa wydarzenia:</label>
          <input
            type="text"
            value={addEventName}
            onChange={(e) => setAddEventName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Data wydarzenia:</label>
          <input
            type="datetime-local"
            value={addEventDate}
            onChange={(e) => setAddEventDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kurs na gospodarza (home_odds):</label>
          <input
            type="number"
            value={addHomeOdds}
            step="0.01"
            min="1"
            onChange={(e) => setAddHomeOdds(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kurs na remis (draw_odds):</label>
          <input
            type="number"
            value={addDrawOdds}
            step="0.01"
            min="1"
            onChange={(e) => setAddDrawOdds(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kurs na gości (away_odds):</label>
          <input
            type="number"
            value={addAwayOdds}
            step="0.01"
            min="1"
            onChange={(e) => setAddAwayOdds(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={addEventStatus === 'Wysyłanie...'}>
          Dodaj wydarzenie
        </button>
      </form>
      {addEventStatus && <div style={{ marginTop: 10 }}>{addEventStatus}</div>}

      {/* Panel: Usuń wydarzenie */}
      <hr style={{ margin: '2em 0' }} />
      <h2>Usuń wydarzenie</h2>
      <form onSubmit={handleDeleteEvent}>
        <div>
          <label>Wydarzenie:</label>
          <select
            value={deleteEventId}
            onChange={(e) => setDeleteEventId(e.target.value)}
            required
          >
            <option value="">-- Wybierz wydarzenie do usunięcia --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.event_name} ({ev.event_date})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={deleteEventStatus === 'Usuwanie...'}>
          Usuń wydarzenie
        </button>
      </form>
      {deleteEventStatus && <div style={{ marginTop: 10 }}>{deleteEventStatus}</div>}

      {/* Panel: Dodaj punkty wszystkim użytkownikom */}
      <hr style={{ margin: '2em 0' }} />
      <h2>Dodaj punkty wszystkim użytkownikom</h2>
      <form onSubmit={handleAddPoints}>
        <div>
          <label>Liczba punktów do dodania:</label>
          <input
            type="number"
            value={addPoints}
            onChange={e => setAddPoints(e.target.value)}
            required
            min="1"
          />
        </div>
        <button type="submit" disabled={addPointsStatus === 'Wysyłanie...'}>Dodaj punkty</button>
      </form>
      {addPointsStatus && <div style={{ marginTop: 10 }}>{addPointsStatus}</div>}

      {/* Tabela wydarzeń */}
      <hr style={{ margin: '2em 0' }} />
      <h2>Lista wydarzeń</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Data</th>
            <th>Kurs home</th>
            <th>Kurs draw</th>
            <th>Kurs away</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id}>
              <td>{ev.event_name}</td>
              <td>{ev.event_date}</td>
              <td>{ev.home_odds}</td>
              <td>{ev.draw_odds}</td>
              <td>{ev.away_odds}</td>
              <td>{ev.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;