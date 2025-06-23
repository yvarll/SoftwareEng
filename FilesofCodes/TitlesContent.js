import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TitlesContent() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [posts, setPosts] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // İlk başlık ve ilk 20 postu fetch etmek için kullanılır
    useEffect(() => {
        setPosts([]); // Eski postları temizler
        setCurrentPage(0);
        setHasMore(true);
        
        axios.get(`http://localhost:5050/api/titles/${id}`)
        .then(response => {
                setTitle(response.data.title);
            })
            .catch(error => {
                console.error('There was an error fetching the title!', error);
            });
            
            fetchPosts(1, 10);
    }, [id]);

    // Scroll eventini handle eden kısım
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 5 && hasMore) {
                setCurrentPage(prevPage => prevPage + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore]);

    // Sayfa değiştikçe postları fetch eden kısım
    useEffect(() => {
        if (currentPage > 1) {
            fetchPosts(currentPage, 10);
        }
    }, [currentPage]);

    // Post fetch fonksiyonu
    const fetchPosts = (page, limit) => {
        axios.get(`http://localhost:5050/api/posts/${id}?page=${page}&limit=${limit}`)
            .then(response => {
                const sortedPosts = response.data;
                setPosts(prevPosts => [...prevPosts, ...sortedPosts]);
                if (response.data.length < limit) {
                    setHasMore(false);
                }
            })
            .catch(error => {
                console.error('There was an error fetching the posts!', error);
            });
    };

    // Yeni post eklemek için kullanılan fonksiyon
    const addPost = () => {
        if (inputValue.trim() === '') {
            return;
        }
        const token = localStorage.getItem('token');
        axios.post('http://localhost:5050/api/posts', { post: inputValue, title_id: id }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                setPosts([]);
                setCurrentPage(1);
                setHasMore(true);
                fetchPosts(1, 20);
                setInputValue('');
                setError('');
            })
            .catch(error => {
                console.error('There was an error adding the post!', error);
                if (error.response && error.response.status === 401) {
                    setError(<span className="text-red-500 text-xl">You must login to write a post.</span>);
                } else {
                    setError('An error occurred while adding the post.');
                }
            });
    };

    return (
        <div className="px-80 py-20">
            <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-4 h-32 border border-gray-300 rounded mb-4"
                />
            </div>
            <button
                onClick={addPost}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-400 transition duration-300"
            >
                Send
            </button>
            <div className="mt-8 space-y-4">
                {posts.map((post, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg shadow">
                        <p className="mb-2">{post.content}</p>
                        <p className="text-sm text-gray-600">Posted by: {post.username} {new Date(post.created_at).toLocaleString()} </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TitlesContent;
