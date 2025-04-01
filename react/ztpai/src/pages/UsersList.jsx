import React, { useEffect, useState } from "react";
import axios from "axios";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    const fetchUsers = () => {
        axios.get("http://localhost:8001/api/users")
            .then(response => {
                setUsers(response.data);
                setError("");
            })
            .catch(err => {
                setError("Błąd pobierania danych");
            });
    };

    useEffect(() => {
        fetchUsers();
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
                        <li key={user.id}>{user.username} - {user.email}</li>
                    ))}
                </ul>
            )}
            <button onClick={fetchUsers}>Odśwież listę</button>
        </div>
    );
}

export default UsersList;
