import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.svg";

const styleSheet = `
@media (max-width: 900px) {
  .userdetails-container {
    max-width: 97vw !important;
    padding: 22px 5px 24px 5px !important;
  }
  .userdetails-logo {
    width: 120px !important;
    margin-bottom: 14px !important;
  }
  .userdetails-card {
    padding: 10px 8px !important;
  }
  .userdetails-title {
    font-size: 1.15rem !important;
  }
  .userdetails-btn {
    font-size: 13px !important;
    padding: 10px 0 !important;
  }
  .userdetails-input {
    font-size: 13px !important;
    padding: 9px 9px !important;
  }
}
@media (max-width: 600px) {
  .userdetails-container {
    max-width: 100vw !important;
    padding: 7px 1vw 11px 1vw !important;
  }
  .userdetails-logo {
    width: 85px !important;
    margin-bottom: 10px !important;
  }
  .userdetails-card {
    padding: 7px 3px !important;
  }
  .userdetails-title {
    font-size: 1.0rem !important;
  }
  .userdetails-btn {
    font-size: 11px !important;
    padding: 7px 0 !important;
  }
  .userdetails-input {
    font-size: 11px !important;
    padding: 7px 6px !important;
  }
}
`;

function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [points, setPoints] = useState("");

    useEffect(() => {
        if (!document.getElementById('userdetails-responsive-styles')) {
            const style = document.createElement('style');
            style.textContent = styleSheet;
            style.id = 'userdetails-responsive-styles';
            document.head.appendChild(style);
        }
        axios.get(`http://localhost:8001/api/admin/users/${id}`, { withCredentials: true })
            .then(response => {
                setUser(response.data);
                setUsername(response.data.username);
                setEmail(response.data.email);
                setRole(response.data.role);
                setPoints(response.data.points);
                setError("");
            })
            .catch((err) => {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate("/login");
                } else {
                    setError("Błąd pobierania danych użytkownika.");
                }
            });

    }, [id, navigate]);

    const handleEdit = () => setEditMode(true);

    const handleCancel = () => {
        setEditMode(false);
        if (user) {
            setUsername(user.username);
            setEmail(user.email);
            setRole(user.role);
            setPoints(user.points);
        }
        setStatus("");
    };

    const handleSave = (e) => {
        e.preventDefault();
        setStatus("Zapisywanie...");
        axios.put(
            `http://localhost:8001/api/admin/users/${id}`,
            { username, email, role, points },
            { withCredentials: true, headers: { "Content-Type": "application/json" } }
        )
        .then(res => {
            setStatus("Zapisano!");
            setUser(prev => ({ ...prev, username, email, role, points }));
            setEditMode(false);
        })
        .catch((err) => {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate("/login");
            } else {
                setStatus("Błąd podczas zapisywania.");
            }
        });
    };

    const handleDelete = () => {
        if (!window.confirm("Na pewno usunąć użytkownika?")) return;
        setStatus("Usuwanie...");
        axios.delete(`http://localhost:8001/api/admin/users/${id}`, { withCredentials: true })
            .then(() => {
                setStatus("Użytkownik usunięty.");
                setTimeout(() => navigate("/admin/users"), 1000);
            })
            .catch((err) => {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate("/login");
                } else {
                    setStatus("Błąd podczas usuwania.");
                }
            });
    };

    const goToHome = () => {
        navigate('/home');
    };

    if (error) return (
        <div style={{ color: "#FF5252", margin: "2em auto", textAlign: 'center' }}>{error}</div>
    );
    if (!user) return (
        <div style={{ color: "#bbb", margin: "2em auto", textAlign: 'center' }}>Ładowanie...</div>
    );

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
                    className="userdetails-logo"
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
                <div className="userdetails-container" style={{
                    maxWidth: '520px',
                    width: '100%',
                    background: 'rgba(24,25,26,0.98)',
                    borderRadius: '18px',
                    boxShadow: '0 6px 32px 0 rgba(0,0,0,0.12)',
                    padding: '30px 40px 40px 40px',
                    margin: '0 auto'
                }}>
                    <h2 className="userdetails-title" style={{ color: "#fff", marginBottom: 26 }}>Szczegóły użytkownika</h2>
                    {editMode ? (
                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: "#bbb", display: "block", marginBottom: 4 }}>
                                    Nazwa użytkownika:
                                    <input
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        required
                                        className="userdetails-input"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            marginTop: 3,
                                            outline: 'none'
                                        }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: "#bbb", display: "block", marginBottom: 4 }}>
                                    Email:
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="userdetails-input"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            marginTop: 3,
                                            outline: 'none'
                                        }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: "#bbb", display: "block", marginBottom: 4 }}>
                                    Rola:
                                    <input
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        required
                                        className="userdetails-input"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            marginTop: 3,
                                            outline: 'none'
                                        }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ color: "#bbb", display: "block", marginBottom: 4 }}>
                                    Punkty:
                                    <input
                                        type="number"
                                        value={points}
                                        onChange={e => setPoints(e.target.value)}
                                        required
                                        className="userdetails-input"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 7,
                                            border: '1.5px solid #333',
                                            background: '#232526',
                                            color: '#fff',
                                            fontSize: 16,
                                            marginTop: 3,
                                            outline: 'none'
                                        }}
                                    />
                                </label>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    type="submit"
                                    className="userdetails-btn"
                                    style={{
                                        flex: 1,
                                        padding: '13px 0',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Zapisz
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="userdetails-btn"
                                    style={{
                                        flex: 1,
                                        padding: '13px 0',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: 'linear-gradient(90deg, #bbb 0%, #888 100%)',
                                        color: '#232526',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="userdetails-card" style={{
                                marginBottom: 22,
                                background: 'rgba(44,45,46,0.92)',
                                borderRadius: 10,
                                padding: '16px 18px',
                                color: '#eaeaea',
                                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)'
                            }}>
                                <p><b>Nazwa użytkownika:</b> {user.username}</p>
                                <p><b>Email:</b> {user.email}</p>
                                <p><b>Rola:</b> {user.role}</p>
                                <p><b>Punkty:</b> {user.points}</p>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    onClick={handleEdit}
                                    className="userdetails-btn"
                                    style={{
                                        flex: 1,
                                        padding: '13px 0',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: 'linear-gradient(90deg, #5a5a5a 0%, #818181 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Edytuj
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="userdetails-btn"
                                    style={{
                                        flex: 1,
                                        padding: '13px 0',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: 'linear-gradient(90deg, #d9534f 0%, #c9302c 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        boxShadow: '0 2px 12px 0 rgba(217,83,79,0.10)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Usuń
                                </button>
                            </div>
                        </>
                    )}
                    {status && <div style={{ marginTop: 16, color: status === "Zapisano!" || status === "Użytkownik usunięty." ? "#2ecc40" : "#FF5252" }}>{status}</div>}
                </div>
            </div>
        </div>
    );
}

export default UserDetails;