
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UsersList from "./pages/UsersList"; 
import UserDetails from "./pages/UserDetails";
function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<UsersList />} /> 
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/users/:id" element={<UserDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
