import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
  const [companyId, setCompanyId] = useState();
  const [companyName, setCompanyName] = useState();
  const [companyLogo, setCompanyLogo] = useState();
  const [logotype, setLogoType] = useState();
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
      if (companyId) {
        const response = await fetch(
          `/api/admin/dashboard?companyId=${companyId}`,
        );
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

  async function handleLogoUpdateSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch(`/api/update/logo/${companyId}`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ logotype }),
      });
      if (response.ok) {
        console.log(
          `Link ${logotype}updated for company #${companyId} successfully`,
        );
      }
    } catch (error) {
      console.error("logo update failed:", error);
    }
  }

  return (
    <>
      <img
        src={companyLogo}
        alt="Your Company's logo"
        style={{ width: "210px" }}
      />

      <h3>{companyName || "Loading..."}</h3>
      <strong>Change your setting below</strong>
      <div>
        <form className="form" onSubmit={handleLogoUpdateSubmit}>
          <label>Paste your company's logo type link here</label>
          <input
            value={logotype}
            type="text"
            name="logotype"
            onChange={(e) => setLogoType(e.target.value)}
          />
          <button type="submit">Submit Link</button>
        </form>
      </div>
    </>
  );
}
