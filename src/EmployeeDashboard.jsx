import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function EmployeeDashboard() {
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanyId = async () => {
            const response = await fetch('/api/session/companyId');
            const data = await response.json();
            console.log(data)
            setCompanyId(data.companyId)
        }
    
    
        fetchCompanyId();
    });    

    //test

    useEffect(() => {
        async function fetchCompanyName() {
            try {
                const response = await fetch("/api/employee/dashboard");
                if (!response.ok) {
                    throw new Error(`status: ${response.status}`);
                }
                const body = await response.json();
                setCompanyName(body);
            } catch (error) {
                console.error("Fetching tickets failed:", error);
            }
        }
        fetchCompanyName();
        //test slut
    }, []);

    return (
        <main>
            <h1>Employee Dashboard</h1>
            <p>Company: {companyId}</p>

        </main>
        )
    }
