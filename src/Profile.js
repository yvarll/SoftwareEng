import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile({ username }) {
    const [titles, setTitles] = useState([]);
    const [titleCount, setTitleCount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:5050/api/user-titles/${username}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setTitles(response.data);
        })
        .catch(error => {
            setError("There was an error fetching the profile!");
            console.error("There was an error fetching the profile!", error);
        });
    }, [username]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:5050/api/user-title-count/${username}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
        .then(response => {
            setTitleCount(response.data.titleCount);
        })
        .catch(error => {
            setError('There was an error occurred while fetching');
            console.error('There was an error occurred', error);
        });
    }, [username]);

    return (
        <div className="px-64 py-20">
            <h2 className="text-3xl font-bold mb-6 text-center">Titles by {username} - Title count: {titleCount}</h2>
            {error && <p className="text-red-500">{error}</p>}
            <ul className="space-y-4">
                {titles.map((title, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-lg shadow mb-4">
                        <Link to={`/title/${title.id}`}>
                            {title.title}
                        </Link>
                        <p className="text-sm text-gray-600">Created at: {new Date(title.created_at).toLocaleString()}</p>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default Profile;
