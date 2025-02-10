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
        
        []});

        const [input, setInput] = useState("")
    async function sendData() {
        
        /*try {
            const req = await fetch ("http://localhost:5073/api/adduser"), {
                method: "POST",
                body: JSON.stringify(input)}
        } catch (error) {
            console.log(error)
        }*/
        await fetch ("http://localhost:5073/api/adduser"), {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify({input})}
    }
   
        
    return <>
        <h1>Enter something</h1>
        <input onChange={(e) => setInput(e.target.value)} placeholder={"Hej"} type="text"/>
        <button onClick={sendData}>SEND DATA</button>
        {name.map((name) => (
            <div key={name.id}>

                <ul>
                    <li>
                        <p>Name: {name.name}</p>
                    </li>
                </ul>
            </div>
        ))}
    </>
    };
    
    
            