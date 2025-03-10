import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function EmployeeDashboard()
{
    const {companyId} = useParams("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (companyId) {
            fetch(`/api/company/${companyId}/init`)
                .then((response) => {
                    if (!response.ok)
                        throw new Error("Failed to initialize company session");
                    return response.json();
                })
                .then(() => {
                    setTimeout(() => {
                        navigate("/");
                    }, 3000);
                })
                .catch((err) => {
                    console.error("Error:", err);
                    setError("Could not initialize company. Please try again later.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [companyId, navigate]);

    return (
        <main>
            <h1>Employee Dashboard</h1>
            <p>Company: {companyId}</p>
            
        </main>
    )
}