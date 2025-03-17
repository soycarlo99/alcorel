import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function EmployeeDashboard() {
  const [companyId, setCompanyId] = useState();
  const [companyName, setCompanyName] = useState();
  const [companyLogo, setCompanyLogo] = useState();
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [isUsingDefaultPassword, setIsUsingDefaultPassword] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const companyResponse = await fetch("/api/session/companyId");
        const companyData = await companyResponse.json();
        setCompanyId(companyData.companyId);

        const userResponse = await fetch("/api/session/userId");
        const userData = await userResponse.json();
        setUserId(userData.userId);
      } catch (error) {
        console.error("Error fetching session data:", error);
        setError("Failed to load session data");
      }
    };

    fetchSessionData();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchCompanyName();
    }
  }, [companyId]);

  useEffect(() => {
    if (userId) {
      checkPassword();
    }
  }, [userId]);

  async function fetchCompanyName() {
    try {
      if (companyId) {
        const response = await fetch(
          `/api/employee/dashboard?companyId=${companyId}`,
        );
        if (!response.ok) {
          throw new Error(`status: ${response.status}`);
        }
        const data = await response.json();
        const companyInfo = data;
        setCompanyName(companyInfo[0].company);
        setCompanyLogo(companyInfo[0].logotype);
      }
    } catch (error) {
      console.error("Fetching company name failed:", error);
      setError("Failed to load company name");
    }
  }

  async function checkPassword() {
    try {
      if (!userId) return;

      const response = await fetch(`/api/employee/${userId}/check-password`);

      if (response.status === 400) {
        setIsUsingDefaultPassword(true);
        const data = await response.text();

        try {
          const jsonData = JSON.parse(data);
          setResetPasswordMessage(
            "You are using the default password, please change your password",
          );
        } catch (e) {
          setResetPasswordMessage(
            error ||
              "You are using the default password, please change your password",
          );
        }
      } else {
        setIsUsingDefaultPassword(false);
      }
    } catch (error) {
      console.error("Error checking password:", error);
    }
  }

  async function handleResetPassword() {
    if (!userId) return;

    try {
      setIsResetting(true);
      const response = await fetch(`/api/ResetPassword/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setResetPasswordMessage(
          "Password reset link has been sent to your email",
        );
      } else {
        const errorText = await response.text();
        setResetPasswordMessage(
          `Failed to reset password: ${errorText || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setResetPasswordMessage(
        "Failed to reset password due to a network error",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main>
      <img
        src={companyLogo}
        alt="Your Company's logo"
        style={{ width: "210px" }}
      />
      <h3>{companyName || "Loading..."}</h3>

      {isUsingDefaultPassword && (
        <div className="password-warning">
          <p>{resetPasswordMessage}</p>
          <button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="reset-password-button"
          >
            {isResetting ? "Sending reset link..." : "Reset Password"}
          </button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </main>
  );
}
