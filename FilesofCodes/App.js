import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useParams } from 'react-router-dom';
import Home from './Home';
import Title from './Title';
import TitleDetail from './TitlesContent';
import Register from './Register';
import Login from './Login';
import Profile from './Profile';

function App() {
    const [titles, setTitles] = useState([]);
    const { id } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');

    const [search, setSearch] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postvaluestitles, setPostValuesTitles] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        if (token) {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            setUsername(decodedToken.username);
        }

        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 5
            ) {
                fetchData(currentPage + 1, 10);
                setCurrentPage((prevPage) => prevPage + 1);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [currentPage]);

    const fetchData = (page, limit) => {
        axios.get(`http://localhost:5050/api/titles?page=${page}&limit=${limit}`)
            .then(response => {
                const sortedTitles = response.data;
                setTitles(prevTitles => [...prevTitles, ...sortedTitles]);
            })
            .catch(error => {
                console.error('There was an error fetching the titles!', error);
            });
    };

    const addTitle = (newTitle) => {
        setTitles([...titles, newTitle]);
    };

    const PrivateRoute = ({ element }) => {
        return isAuthenticated ? element : <Navigate to="/login" />;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUsername('');
    };

    useEffect(() => {
        fetchData(1, 10);
    }, [id]);

    function useDebouncedValue(value, delay) {
        const [state, setState] = useState(value);
        useEffect(
            () => {
                const t = setTimeout(setState, delay, value);
                return () => { clearTimeout(t); };
            },
            [value, delay]
        );
        return state;
    }
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        axios.get(`http://localhost:5050/api/search?query=${search}`)
            .then(response => {
                setFilteredResults(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the search results!', error);
            });
    };
    
    
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <nav className="bg-black text-white p-4 shadow-lg ">
                    <div className="px-6 flex justify-between items-center ">
                        <div className="text-2xl font-bold">
                            <Link to="/" className="">
                                BlogSite
                            </Link>
                        </div>

                        <div className="relative flex items-center space-x-2">
                            <form onSubmit={handleSearchSubmit} className="w-full relative">
                                <input
                                    onChange={(e) => setSearch(e.target.value)} // onChange handler ekliyoruz
                                    value={search}
                                    type="text"
                                    minLength={3}
                                    className="w-96 p-2 px-8 border border-gray-300 rounded-3xl focus:outline-none focus:ring focus:border-blue-300 text-black "
                                    placeholder="Search..."
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button type="submit" className="hidden">
                                    Search
                                </button>
                                <svg
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M19.5 18.616l-4.515-4.516a8.528 8.528 0 1 0-.884.884l4.515 4.515.884-.884ZM1.301 8.553a7.253 7.253 0 1 1 7.252 7.253 7.261 7.261 0 0 1-7.252-7.253Z" />
                                </svg>
                            </form>
                            {filteredResults.length > 0 && (
                                <ul
                                    className="absolute top-12 right-0 w-full bg-white border border-gray-300 rounded-3xl shadow-lg z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {filteredResults.map((result) => (
                                        <li key={result.id}>
                                            <Link
                                                to={
                                                    result.type === "title"
                                                        ? `/title/${result.id}`
                                                        : `/title/${result.title_id}`
                                                }
                                                className="block px-4 py-3 text-black text-base rounded-3xl hover:bg-gray-100"
                                            >
                                                {result.type === "title"
                                                    ? `A title: ${result.content}, by user: ${result.username}`
                                                    : `A post: ${result.content}, From title: ${result.title_name || "Unknown Title"}, by user: ${result.username || "Unknown"}`}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="space-x-4">
                            <Link
                                to="/"
                                className="hover:text-gray-400 transition duration-300 text-md"
                            >
                                Home
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/title"
                                    className="hover:text-gray-400 text-md transition duration-300  "
                                >
                                    New Title+
                                </Link>
                            )}
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="hover:text-gray-400 text-md transition duration-300 rounded-xl bg-green-600 px-4 py-1"
                                >
                                    Login
                                </Link>
                            )}
                            {!isAuthenticated && (
                                <Link
                                    to="/register"
                                    className="hover:text-gray-400 text-md transition duration-300"
                                >
                                    Register
                                </Link>
                            )}
                            {isAuthenticated && (
                                <Link
                                    to={`/profile/${username}`}
                                    className="hover:text-gray-400 text-md transition duration-300"
                                >
                                    Profile
                                </Link>
                            )}
                            {isAuthenticated && (
                                <button onClick={logout} className="hover:text-gray-400">
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </nav>

                <div className="flex flex-grow w-full">
                    <aside className="w-72 py-8  shadow-inner">
                        <ul className="space-y-0.5">
                            {titles.map((title) => (
                                <li key={title.id}>
                                    <Link
                                        to={`/title/${title.id}`}
                                        className="block px-4 py-6 bg-white border hover:bg-gray-100 rounded-lg transition duration-300 focus:bg-gray-300"
                                    >
                                        {title.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="flex-1 p-6 bg-gray-50">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/title"
                                element={
                                    <PrivateRoute element={<Title addTitle={addTitle} />} />
                                }
                            />
                            <Route path="/title/:id" element={<TitleDetail />} />
                            <Route
                                path="/login"
                                element={
                                    <Login
                                        setIsAuthenticated={setIsAuthenticated}
                                        setUsername={setUsername}
                                    />
                                }
                            />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/profile/:username"
                                element={
                                    <PrivateRoute element={<Profile username={username} />} />
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;