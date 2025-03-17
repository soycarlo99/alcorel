import { useState } from "react";
import { useNavigate } from "react-router";
import "./alcorelStyle.css";

export default function Alcorel() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    adminName: "",
    orgNumber: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function signup(event) {
    event.preventDefault();
    setError("");

    const data = JSON.stringify({
      CompanyName: formData.companyName,
      Email: formData.email,
      AdminName: formData.adminName,
      orgNumber: formData.orgNumber,
      Password: formData.password,
    });

    try {
      const response = await fetch("/api/signup", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: data,
      });

      if (response.ok) {
        try {
          const resp = await response.json();
          navigate(resp.redirectPath || "/login");
        } catch (err) {
          console.error("Failed to parse JSON response:", err);
          setError("Registration successful, but redirection failed.");
        }
      } else {
        try {
          const errorMsg = await response.text();
          setError(errorMsg || "Registration failed. Please try again.");
        } catch {
          setError("Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Connection error. Please check your internet connection and try again.",
      );
    }
  }

  return (
    <div className="alcorel-container">
      <header className="alcorel-header">
        <h1>Welcome to Alcorel</h1>
        <h2 className="motto">
          It's easy to grow. Convert more, build lasting relationships, and grow
          your business resiliently, with the magic of contextual AI and
          thoughtful UI.
        </h2>
      </header>

      <div className="alcorel-content">
        <div className="alcorel-image">
          <img
            src="https://5.imimg.com/data5/YC/SV/MY-2920520/crm-solution-services-500x500.jpg"
            alt="Alcorel CRM Platform"
            className="alcorel-illustration"
          />
        </div>

        <div className="alcorel-form-container">
          <h3>Create Your Admin Account</h3>

          {error && <div className="alcorel-error-message">{error}</div>}

          <form name="signup-form" onSubmit={signup} className="alcorel-form">
            <div className="alcorel-form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Your company name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="alcorel-form-group">
              <label htmlFor="orgNumber">Organization Number</label>
              <input
                type="text"
                id="orgNumber"
                name="orgNumber"
                placeholder="Organization number"
                value={formData.orgNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="alcorel-form-group">
              <label htmlFor="adminName">Admin Name</label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                placeholder="Your full name"
                value={formData.adminName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="alcorel-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your business email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="alcorel-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>

            <button type="submit" className="alcorel-signup-button">
              Create Account
            </button>

            <div className="alcorel-login-link">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </form>
        </div>
      </div>

      <footer className="alcorel-footer">
        <p>© {new Date().getFullYear()} Alcorel CRM. All rights reserved.</p>
      </footer>
    </div>
  );
}
