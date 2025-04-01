import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function UserDetails() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:8001/api/users/${id}`)
            .then(response => {
                setUser(response.data);
                setError("");
            })
            .catch(() => {
                setError("Błąd pobierania danych użytkownika.");
            });
    }, [id]);

    if (error) return <p>{error}</p>;
    if (!user) return <p>Ładowanie...</p>;

    return (
        <div>
            <h2>Szczegóły użytkownika</h2>
            <p><strong>Nazwa:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rola:</strong> {user.role}</p>
            <p><strong>Punkty:</strong> {user.points}</p>
        </div>
    );
}

export default UserDetails;
