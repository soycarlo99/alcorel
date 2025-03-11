import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function EmployeeDashboard() {
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    //const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanyId = async () => {
            const response = await fetch('/api/session/companyId');
            const data = await response.json();
            console.log(data)
            setCompanyId(data.companyId)
        }
        
        async function fetchCompanyName() {
            try {
                const response = await fetch("/api/employee/dashboard");
                if (!response.ok) {
                    throw new Error(`status: ${response.status}`);
                }
                const data = await response.json();

                console.log("API Response:", data);
                setCompanyName(data.companyName);
                
            } catch (error) {
                console.error("Fetching company name failed:", error);
            }
        }
        
        fetchCompanyName();
        fetchCompanyId();
    }, [companyId, companyName]);

    //test

    return (
        <main>
            
            <h1>Employee Dashboard</h1>
            <h2>CompanyId: {companyId || "Loading..."}</h2>
            <h3>CompanyName: {companyName || "Loading..."}</h3>
        </main>
    )
}
