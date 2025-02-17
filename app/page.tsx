// filepath: /c:/Users/patry/Desktop/Path-finder/study-path-finder/app/page.tsx
"use client";

import React, { useState } from "react";
import { searchPrograms } from "../frontend/api/search";

const Page = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);  // Show "Loading..."
        try {
            const data = await searchPrograms(query);
            setResults(data.programs || []);
        } catch (error) {
            console.error("Search failed:", error);
        }
        setLoading(false);  // Hide "Loading..."
    };

    return (
        <div>
            <h1>Study Path Finder</h1>
            <input
                type="text"
                placeholder="Enter your study interests..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            <div>
                {results.map((program, index) => (
                    <div key={index}>
                        <h2>{program.name}</h2>
                        <p>{program.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;