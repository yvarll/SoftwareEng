import React, { useState } from 'react';
import axios from 'axios';

function Title({ addTitle }) {
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        axios.post('http://localhost:5050/api/titles', { title }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                setTitle('');
                addTitle(response.data);
            })
            .catch(error => {
                console.error('There was an error while adding the title', error);
            });
    };

    return (
        <div className="flex px-80 py-32 items-center bg-gray-50">
            <form className="w-full max-w-lg" onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-3xl font-bold mb-6 text-center">Create New Title</h2>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        required
                        className="w-full h-12 p-4 border border-gray-300 rounded mb-4"
                    />
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                    >
                        Add Title
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Title;
