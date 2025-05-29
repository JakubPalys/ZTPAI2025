import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8001/api/admin/users", { withCredentials: true })
            .then(response => {
                setUsers(response.data.users || []);
                setError("");
            })
            .catch(() => {
                setError("Błąd pobierania danych");
            });
    }, []);

    return (
        <div style={{ maxWidth: 600, margin: "2em auto", padding: 20, border: "1px solid #ddd" }}>
            <h2>Lista użytkowników</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {users.length === 0 ? (
                <p>Brak użytkowników do wyświetlenia.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nazwa użytkownika</th>
                            <th>Email</th>
                            <th>Rola</th>
                            <th>Punkty</th>
                            <th>Szczegóły</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.points}</td>
                                <td>
                                    <Link to={`/admin/users/${user.id}`}>Zarządzaj</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsersList;