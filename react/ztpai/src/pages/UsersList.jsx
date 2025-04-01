import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8001/api/users")
            .then(response => {
                setUsers(response.data);
                setError("");
            })
            .catch(() => {
                setError("Błąd pobierania danych");
            });
    }, []);

    return (
        <div>
            <h2>Lista Użytkowników</h2>
            {error && <p>{error}</p>}
            {users.length === 0 ? (
                <p>Brak użytkowników do wyświetlenia.</p>
            ) : (
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            <Link to={`/users/${user.id}`}>{user.username}</Link> - {user.email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UsersList;
