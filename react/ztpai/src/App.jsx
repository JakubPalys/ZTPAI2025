import React, { useState } from 'react';
import Login from './pages/login'; // zaimportowanie komponentu Login
import Home from './pages/home';   // zaimportowanie komponentu Home

function App() {
    const [user, setUser] = useState(null);

    if (!user) {
        return <Login setUser={setUser} />;
    }

    return <Home user={user} />;
}

export default App;
