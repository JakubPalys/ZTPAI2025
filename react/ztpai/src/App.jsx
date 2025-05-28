
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import UsersList from "./pages/UsersList"; 
import Profile from "./pages/Profile";
import UserDetails from "./pages/UserDetails";
import Home from "./pages/Home";

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<UsersList />} /> 
                <Route path="/profile" element={<Profile />} /> 
                <Route path="/admin" element={<Admin />} /> 
                <Route path="/home" element={<Home />} />
                <Route path="/users/:id" element={<UserDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
