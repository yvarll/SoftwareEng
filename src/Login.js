import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated, setUsername }) {
    const [username, setUsernameState] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5050/api/login', { username, password })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                setIsAuthenticated(true);
                setUsername(username);
                navigate('/');
            })
            .catch(error => {
                console.error('There was an error logging in!', error);
                alert('Login failed!');
            });
    };

    return (
        <div className="flex px-80 py-32 bg-gray-50">
            <form className="w-full max-w-lg" onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsernameState(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded"
                            required
                        />
                        
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Login;
