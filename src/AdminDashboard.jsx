import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
  const [companyId, setCompanyId] = useState();
  const [companyName, setCompanyName] = useState();
  //const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyId = async () => {
      const response = await fetch("/api/session/companyId");
      const data = await response.json();
      setCompanyId(data.companyId);
    };

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
        const response = await fetch(
          `/api/admin/dashboard?companyId=${companyId}`,
        );
        if (!response.ok) {
          throw new Error(`status: ${response.status}`);
        }
        const data = await response.json();
        const companyName = data;
        setCompanyName(companyName[0].name);
      }
    } catch (error) {
      console.error("Fetching company name failed:", error);
      setError("Failed to load company name");
    }
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <h2>CompanyId: {companyId || "Loading..."}</h2>
      <h3>CompanyName: {companyName || "Loading..."}</h3>
    </main>
  );
}
