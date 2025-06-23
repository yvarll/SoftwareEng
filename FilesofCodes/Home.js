import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function Home() {
    const [titles, setTitles] = useState([]);

    

    useEffect(() => {
        axios.get('http://localhost:5050/api/titles')
            .then(response => {
                setTitles(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the titles!', error);
            });
    }, []);

    return (
        <div className="px-64 py-20">
            {/*<h2 className="pr-40 text-3xl font-bold mb-6 text-center">Home</h2>*/}


            <h2 className="text-7xl font-bold italic">
    Welcome to BlogSite
</h2>

        
  {/* 
            <div className="space-y-1">
                {titles.map((title) => (
                    <div key={title.id} className="p-8 bg-white rounded-lg shadow ">
                        <Link to={`/title/${title.id}`} className="text-xl font-semibold text-black hover:underline">
                            {title.title}
                        </Link>
                    </div>
                ))}
            </div>
                        */}
        </div>
    );
}

export default Home;
