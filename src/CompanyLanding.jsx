import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import XalcorelLogo from "./logotype/xAlcoRel.png";

export default function CompanyLanding() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyLogo, setCompanyLogo] = useState();
  const [companyName, setCompanyName] = useState();

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
          }, 5000);
        })
        .catch((err) => {
          console.error("Error:", err);
          setError("Could not initialize company. Please try again later.");
        })
        .finally(() => {
          setLoading(false);
        });
    }

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

    fetchCompanyName();
  }, [companyId, navigate]);

  if (loading) {
    return (
      <div className="company-landing">
        <h2>Initializing support portal...</h2>
        <p>Please wait while we set up your support experience.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-landing">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="company-landing">
      <h2>Welcome to our support portal</h2>
      <div className="logo-container">
        <img
          src={companyLogo}
          alt={companyName}
          style={{ maxWidth: "190px" }}
        />
        <img
          src={XalcorelLogo}
          alt="Alcorel"
          style={{ clipPath: "inset(75px 0 75px 0)", maxWidth: "500px" }}
        />
      </div>
      <p>You're being redirected to our ticket creation page...</p>
    </div>
  );
}
