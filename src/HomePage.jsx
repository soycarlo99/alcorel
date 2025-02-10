import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

    export default function HomePage() {
    const [name, SetName] = useState([]);

    useEffect(() => {
        async function fetchnames() {
            try {
                const response = await fetch("http://localhost:5073/api/user");
                const body = await response.json();
                console.log("Fetched names data:", body);
                SetName(body);
            } catch (error) {
                console.error("Failed to fetch names from database:", error);
            }
        }
        fetchnames();
        });

    return <>
        {name.map((name) => (
            <div key={name.id}>
                <ul>
                    <li>
                        <p>Name: {name.name}</p>
                    </li>
                </ul>
            </div>
        ))}
        </>};
            