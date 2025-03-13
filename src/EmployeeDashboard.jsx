import { useEffect, useState } from "react";
import { useNavigate } from "react-router";




export default function EmployeeDashboard() {
    const [companyId, setCompanyId] = useState();
    const [companyName, setCompanyName] = useState();
    const [companyLogo, setCompanyLogo] = useState();
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
                const companyInfo = data;
                console.log(companyInfo[0].company);
                setCompanyName(companyInfo[0].company);
                setCompanyLogo(companyInfo[0].logotype);
            }
        } catch (error) {
            console.error("Fetching company name failed:", error);
            setError("Failed to load company name");
        }
    }

   

    return (
        <main>
            <h1>Employee Dashboard</h1>
            {/*  <h2>CompanyId: {companyId || "Loading..."}</h2>*/}
            <h3>CompanyName: {companyName || "Loading..."}</h3>

          
           
            <img src={companyLogo} alt="Test2" style={{ width: '210px', }}/> 
            
<input></input>


            <button type="submit" className="login-button">
                Add Logotype
            </button>
            
        </main>
    )
}