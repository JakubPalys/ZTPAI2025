import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.svg";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8001/api/admin/users", { withCredentials: true })
            .then(response => {
                setUsers(response.data.users || []);
                setError("");
            })
            .catch((err) => {
                // Zabezpieczenie: jeśli 401/403, przekieruj do login
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate("/login");
                } else {
                    setError("Błąd pobierania danych");
                }
            });
        // eslint-disable-next-line
    }, []);

    // Logo click
    const goToHome = () => {
        navigate('/home');
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
                    maxWidth: '820px',
                    width: '100%',
                    background: 'rgba(24,25,26,0.98)',
                    borderRadius: '18px',
                    boxShadow: '0 6px 32px 0 rgba(0,0,0,0.12)',
                    padding: '30px 40px 40px 40px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ color: "#fff", marginBottom: 26 }}>Lista użytkowników</h2>
                    {error && <p style={{ color: "#FF5252" }}>{error}</p>}
                    {users.length === 0 ? (
                        <p style={{ color: "#bbb" }}>Brak użytkowników do wyświetlenia.</p>
                    ) : (
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
                                        <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>ID</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Nazwa użytkownika</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Email</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Rola</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Punkty</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #333' }}>Szczegóły</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{user.id}</td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{user.username}</td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{user.email}</td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{user.role}</td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>{user.points}</td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #232526' }}>
                                                <Link
                                                    to={`/admin/users/${user.id}`}
                                                    style={{
                                                        color: "#4286f4",
                                                        textDecoration: "underline",
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Zarządzaj
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UsersList;