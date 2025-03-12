import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function EmployeeDashboard() {
    const [companyId, setCompanyId] = useState();
    const [companyName, setCompanyName] = useState();
    //const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const Logotype2 = "https://reactjs.org/logo-og.png";
    
    useEffect(() => {
        const fetchCompanyId = async () => {
            const response = await fetch('/api/session/companyId');
            const data = await response.json();
            console.log(data)
            setCompanyId(data.companyId)
        }

        fetchCompanyId();
    }, []);

    useEffect(() => {
        if (companyId) {
            fetchCompanyName();
        }
    }, [companyId]);

    async function fetchCompanyName() {
        try {
            // Only proceed if companyId is available
            if (companyId) {
                const response = await fetch(`/api/employee/dashboard?companyId=${companyId}`);
                if (!response.ok) {
                    throw new Error(`status: ${response.status}`);
                }
                const data = await response.json();
                console.log("API Response:", data);
                const companyName = data;
                console.log(companyName[0].name);
                setCompanyName(companyName[0].name);
            }
        } catch (error) {
            console.error("Fetching company name failed:", error);
            setError("Failed to load company name");
        }
    }

    return (
        <main>
            <h1>Employee Dashboard</h1>
            <h2>CompanyId: {companyId || "Loading..."}</h2>
            <h3>CompanyName: {companyName || "Loading..."}</h3>

            {/*  1: direct url, 2: local pic using var, at the moment there is no local pic, 3: url using var   */}
            <img src="https://reactjs.org/logo-og.png" alt="Test" style={{ width: '200px', }}/>
            {/*    <img src={Logotype} alt="Test2" style={{ width: '210px', }}/> */}
            <img src={Logotype2} alt="Test3" style={{ width: '220px', }}/>
            
            
        </main>
    )
}