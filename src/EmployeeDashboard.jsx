import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function EmployeeDashboard() {
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanyId = async () => {
            const response = await fetch('/api/session/companyId');
            const data = await response.json();
            console.log(data)
            setCompanyId(data.companyId)
        };

        fetchCompanyId();
    }, []);

    return (
        <main>
            <h1>Employee Dashboard</h1>
            <p>Company: {companyId}</p>

        </main>
    )
}