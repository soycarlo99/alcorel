import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState("validating");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !userId) {
        setTokenStatus("invalid");
        return;
      }

      try {
        const response = await fetch(`/api/password/validate-token/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setError(data.error || "Invalid or expired reset token");
        }
      } catch (err) {
        setTokenStatus("invalid");
        setError("An error occurred while validating your reset token");
        console.error(err);
      }
    };

    validateToken();
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/password/reset/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Your password has been successfully reset. Redirecting to login...",
        );
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (tokenStatus === "validating") {
    return (
      <div className="login-container">
        <h2>Password Reset</h2>
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            borderRadius: "8px",
          }}
        >
          <p>Validating reset link...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="login-container">
        <h2>Password Reset</h2>
        <div className="error-message">
          {error || "Invalid or expired password reset link."}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>Set Your New Password</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="messageDiv">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Setting Password..." : "Set New Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
