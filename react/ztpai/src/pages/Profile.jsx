import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
    const [user, setUser] = useState(null);
    const [activeBets, setActiveBets] = useState([]);
    const [completedBets, setCompletedBets] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:8001/api/profile', { withCredentials: true });
            setUser(res.data.user);
            setActiveBets(res.data.activeBets);
            setCompletedBets(res.data.completedBets);
        } catch (err) {
            setError('Failed to fetch profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const res = await axios.post(
                'http://localhost:8001/api/profile/change-password',
                {
                    old_password: oldPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (res.data.success) {
                setSuccessMsg(res.data.success);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(res.data.error || 'Failed to change password.');
            }
        } catch (err) {
            setError('Failed to change password.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This cannot be undone!')) {
            return;
        }
        setError('');
        setSuccessMsg('');
        try {
            const res = await axios.post(
                'http://localhost:8001/api/profile/delete',
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                setSuccessMsg(res.data.success + ' (You will be logged out)');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(res.data.error || 'Failed to delete account.');
            }
        } catch (err) {
            setError('Failed to delete account.');
        }
    };

    const formatDate = (input) => {
        if (!input) return '';
        if (typeof input === 'object' && input.date) {
            return new Date(input.date).toLocaleString('pl-PL');
        }
        if (typeof input === 'string') {
            return new Date(input).toLocaleString('pl-PL');
        }
        return '';
    };

    return (
        <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
            <h2>Profile</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <>
                    {user && (
                        <div style={{ marginBottom: 20 }}>
                            <p><b>Username:</b> {user.username}</p>
                            <p><b>Email:</b> {user.email}</p>
                            <p><b>Points:</b> {user.points}</p>
                        </div>
                    )}

                    <h3>Active Bets</h3>
                    {activeBets.length === 0 ? (
                        <p>No active bets.</p>
                    ) : (
                        <ul>
                            {activeBets.map((bet, idx) => (
                                <li key={idx}>
                                    Event: {bet.event_name || 'N/A'},
                                    Amount: {bet.bet_amount},
                                    Choice: {bet.bet_choice},
                                    Potential win: {bet.potential_win},
                                    Date: {formatDate(bet.bet_date)}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3>Completed Bets</h3>
                    {completedBets.length === 0 ? (
                        <p>No completed bets.</p>
                    ) : (
                        <ul>
                            {completedBets.map((bet, idx) => (
                                <li key={idx}>
                                    Event: {bet.event_name || 'N/A'},
                                    Amount: {bet.bet_amount},
                                    Choice: {bet.bet_choice},
                                    Potential win: {bet.potential_win},
                                    Date: {formatDate(bet.bet_date)},
                                    Result: {bet.outcome === 1 ? 'Win' : bet.outcome === 2 ? 'Lose' : 'N/A'}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3>Change Password</h3>
                    <form onSubmit={handleChangePassword} style={{ marginBottom: 20 }}>
                        <div>
                            <input
                                type="password"
                                placeholder="Old password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Change Password</button>
                    </form>

                    <h3>Danger Zone</h3>
                    <button style={{ backgroundColor: '#d9534f', color: 'white' }} onClick={handleDeleteAccount}>
                        Delete Account
                    </button>
                </>
            )}
            {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
        </div>
    );
}

export default Profile;