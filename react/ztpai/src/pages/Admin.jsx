import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.svg';

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

  const [addEventName, setAddEventName] = useState('');
  const [addEventDate, setAddEventDate] = useState('');
  const [addHomeOdds, setAddHomeOdds] = useState('');
  const [addAwayOdds, setAddAwayOdds] = useState('');
  const [addDrawOdds, setAddDrawOdds] = useState('');
  const [addEventStatus, setAddEventStatus] = useState('');

  const [deleteEventId, setDeleteEventId] = useState('');
  const [deleteEventStatus, setDeleteEventStatus] = useState('');

  const [addPoints, setAddPoints] = useState('');
  const [addPointsStatus, setAddPointsStatus] = useState('');

  const navigate = useNavigate();

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
          navigate('/login');
        } else {
          setStatus('Błąd podczas pobierania wydarzeń.');
        }
      });
  };

  useEffect(() => {
    fetchEvents();

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
      fetchEvents();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setStatus('Brak dostępu. Zaloguj się jako administrator.');
        navigate('/login');
      } else {
        setStatus(
          err.response?.data?.error ||
          'Wystąpił błąd podczas rozliczania wydarzenia.'
        );
      }
    }
  };

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
        navigate('/login');
      } else {
        setAddEventStatus(err.response?.data?.error || 'Błąd przy dodawaniu wydarzenia.');
      }
    }
  };

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
        navigate('/login');
      } else {
        setDeleteEventStatus(err.response?.data?.error || 'Błąd przy usuwaniu wydarzenia.');
      }
    }
  };

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

  const goToHome = () => {
    navigate('/home');
  };

  const goToAdminUsers = () => {
    navigate('/admin/users');
  };

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
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
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        <button
          onClick={goToAdminUsers}
          style={{
            padding: '12px 24px',
            borderRadius: 7,
            border: 'none',
            background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            marginTop: 0,
            transition: 'background 0.15s'
          }}
        >
          Zarządzaj użytkownikami
        </button>
      </div>

      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          maxWidth: '820px',
          width: '100%',
          background: 'rgba(24,25,26,0.98)',
          borderRadius: '18px',
          boxShadow: '0 6px 32px 0 rgba(0,0,0,0.12)',
          padding: '30px 40px 40px 40px',
          margin: '0 auto'
        }}>
          <h2 style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Zakończ wydarzenie i rozlicz zakłady</h2>
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: '#bbb', marginRight: 8 }}>Wydarzenie:</label>
              <select
                style={{
                  borderRadius: 6, border: '1px solid #333', background: '#232526', color: '#fff', padding: '8px 10px'
                }}
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
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: '#bbb', marginRight: 8 }}>Wynik meczu:</label>
              <select
                style={{
                  borderRadius: 6, border: '1px solid #333', background: '#232526', color: '#fff', padding: '8px 10px'
                }}
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
            <button
              type="submit"
              disabled={status === 'Wysyłanie...'}
              style={{
                padding: '10px 22px',
                borderRadius: 7,
                border: 'none',
                background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                marginTop: 8,
                transition: 'background 0.15s'
              }}
            >
              Rozlicz wydarzenie
            </button>
          </form>
          {status && <div style={{ marginTop: 10, color: status === 'Sukces!' ? '#2ecc40' : '#FF5252' }}>{status}</div>}
          {summary && (
            <div style={{ marginTop: 15, background: '#2c2c2e', padding: 12, color: '#fff', borderRadius: 8 }}>
              <strong>{summary.message}</strong>
              <br />
              Wygranych: {summary.winners}
              <br />
              Przegranych: {summary.losers}
            </div>
          )}

          <hr style={{ margin: '2em 0', borderColor: '#222' }} />
          <h2 style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Dodaj wydarzenie</h2>
          <form onSubmit={handleAddEvent} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', display: 'block', marginBottom: 2 }}>Nazwa wydarzenia:</label>
              <input
                type="text"
                value={addEventName}
                onChange={(e) => setAddEventName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #333', background: '#232526', color: '#fff'
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', display: 'block', marginBottom: 2 }}>Data wydarzenia:</label>
              <input
                type="datetime-local"
                value={addEventDate}
                onChange={(e) => setAddEventDate(e.target.value)}
                required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #333', background: '#232526', color: '#fff'
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', display: 'block', marginBottom: 2 }}>Kurs na gospodarza (home_odds):</label>
              <input
                type="number"
                value={addHomeOdds}
                step="0.01"
                min="1"
                onChange={(e) => setAddHomeOdds(e.target.value)}
                required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #333', background: '#232526', color: '#fff'
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', display: 'block', marginBottom: 2 }}>Kurs na remis (draw_odds):</label>
              <input
                type="number"
                value={addDrawOdds}
                step="0.01"
                min="1"
                onChange={(e) => setAddDrawOdds(e.target.value)}
                required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #333', background: '#232526', color: '#fff'
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', display: 'block', marginBottom: 2 }}>Kurs na gości (away_odds):</label>
              <input
                type="number"
                value={addAwayOdds}
                step="0.01"
                min="1"
                onChange={(e) => setAddAwayOdds(e.target.value)}
                required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #333', background: '#232526', color: '#fff'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={addEventStatus === 'Wysyłanie...'}
              style={{
                padding: '10px 22px',
                borderRadius: 7,
                border: 'none',
                background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                marginTop: 8,
                transition: 'background 0.15s'
              }}
            >
              Dodaj wydarzenie
            </button>
          </form>
          {addEventStatus && <div style={{ marginTop: 10, color: addEventStatus.includes('dodano') || addEventStatus.includes('Dodano') ? '#2ecc40' : '#FF5252' }}>{addEventStatus}</div>}

          <hr style={{ margin: '2em 0', borderColor: '#222' }} />
          <h2 style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Usuń wydarzenie</h2>
          <form onSubmit={handleDeleteEvent} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', marginRight: 8 }}>Wydarzenie:</label>
              <select
                style={{
                  borderRadius: 6, border: '1px solid #333', background: '#232526', color: '#fff', padding: '8px 10px'
                }}
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
            <button
              type="submit"
              disabled={deleteEventStatus === 'Usuwanie...'}
              style={{
                padding: '10px 22px',
                borderRadius: 7,
                border: 'none',
                background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                marginTop: 8,
                transition: 'background 0.15s'
              }}
            >
              Usuń wydarzenie
            </button>
          </form>
          {deleteEventStatus && <div style={{ marginTop: 10, color: deleteEventStatus.includes('Usunięto') ? '#2ecc40' : '#FF5252' }}>{deleteEventStatus}</div>}

          <hr style={{ margin: '2em 0', borderColor: '#222' }} />
          <h2 style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Dodaj punkty wszystkim użytkownikom</h2>
          <form onSubmit={handleAddPoints} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: '#bbb', marginRight: 10 }}>Liczba punktów do dodania:</label>
              <input
                type="number"
                value={addPoints}
                onChange={e => setAddPoints(e.target.value)}
                required
                min="1"
                style={{
                  width: 100, padding: '8px 10px', borderRadius: 6,
                  border: '1px solid #333', background: '#232526', color: '#fff'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={addPointsStatus === 'Wysyłanie...'}
              style={{
                padding: '10px 22px',
                borderRadius: 7,
                border: 'none',
                background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                marginTop: 8,
                transition: 'background 0.15s'
              }}
            >
              Dodaj punkty
            </button>
          </form>
          {addPointsStatus && <div style={{ marginTop: 10, color: addPointsStatus.includes('dodane') || addPointsStatus.includes('Dodano') ? '#2ecc40' : '#FF5252' }}>{addPointsStatus}</div>}

          <hr style={{ margin: '2em 0', borderColor: '#222' }} />
          <h2 style={{ color: '#fff', fontWeight: 600, marginBottom: 12 }}>Lista wydarzeń</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: 'rgba(44,45,46,0.92)',
              borderRadius: '10px',
              color: '#fff'
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Nazwa</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Data</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Kurs home</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Kurs draw</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Kurs away</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{ev.event_name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{ev.event_date}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{ev.home_odds}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{ev.draw_odds}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{ev.away_odds}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{ev.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;