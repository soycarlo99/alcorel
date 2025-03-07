import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function CompanyLanding() {
  const { companyId } = useParams();
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
      <p>You're being redirected to our ticket creation page...</p>
    </div>
  );
}
