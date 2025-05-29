import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    // Edycja pól
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [points, setPoints] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:8001/api/admin/users/${id}`, { withCredentials: true })
            .then(response => {
                setUser(response.data);
                setUsername(response.data.username);
                setEmail(response.data.email);
                setRole(response.data.role);
                setPoints(response.data.points);
                setError("");
            })
            .catch(() => {
                setError("Błąd pobierania danych użytkownika.");
            });
    }, [id]);

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
        .catch(() => {
            setStatus("Błąd podczas zapisywania.");
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
            .catch(() => {
                setStatus("Błąd podczas usuwania.");
            });
    };

    if (error) return <p>{error}</p>;
    if (!user) return <p>Ładowanie...</p>;

    return (
        <div style={{ maxWidth: 500, margin: "2em auto", padding: 20, border: "1px solid #ddd" }}>
            <h2>Szczegóły użytkownika</h2>
            {editMode ? (
                <form onSubmit={handleSave}>
                    <div>
                        <label>Nazwa:&nbsp;
                            <input value={username} onChange={e => setUsername(e.target.value)} required />
                        </label>
                    </div>
                    <div>
                        <label>Email:&nbsp;
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </label>
                    </div>
                    <div>
                        <label>Rola:&nbsp;
                            <input value={role} onChange={e => setRole(e.target.value)} required />
                        </label>
                    </div>
                    <div>
                        <label>Punkty:&nbsp;
                            <input type="number" value={points} onChange={e => setPoints(e.target.value)} required />
                        </label>
                    </div>
                    <button type="submit">Zapisz</button>
                    <button type="button" onClick={handleCancel} style={{ marginLeft: 10 }}>Anuluj</button>
                </form>
            ) : (
                <>
                    <p><strong>Nazwa:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Rola:</strong> {user.role}</p>
                    <p><strong>Punkty:</strong> {user.points}</p>
                    <button onClick={handleEdit}>Edytuj</button>
                    <button onClick={handleDelete} style={{ marginLeft: 10, color: "red" }}>Usuń</button>
                </>
            )}
            {status && <div style={{ marginTop: 10 }}>{status}</div>}
        </div>
    );
}

export default UserDetails;