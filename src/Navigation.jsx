import "./style.css";
import { NavLink, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import alcorelLogo from "./logotype/AlcoRel.png";
import LoginPage from "./Login.jsx";

function Navigation() {
  const [waitingTicketsCount, setWaitingTicketsCount] = useState(0);
  const [isEmployee, setIsEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch("/api/DetailedTicket");
        if (!response.ok) {
          throw new Error(`status: ${response.status}`);
        }
        const body = await response.json();
        const waitingCount = body.filter(
          (ticket) => ticket.status.toLowerCase() === "waiting",
        ).length;
        setWaitingTicketsCount(waitingCount);
      } catch (error) {
        console.error("Fetching tickets failed:", error);
      }
    }

    async function checkUserRoles() {
      try {
        const employeeResponse = await fetch("/api/login/employee");
        setIsEmployee(employeeResponse.ok);
      } catch (error) {
        console.error("Employee check failed:", error);
        setIsEmployee(false);
      }

      try {
        const adminResponse = await fetch("/api/login/admin");
        if (adminResponse.ok) {
        }
        setIsAdmin(adminResponse.ok);
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      }
    }

    fetchTickets();
    checkUserRoles();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Logout failed on server");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/login";
    }
  }

  if (isEmployee === null || isAdmin === null) {
    return null;
  }

  if (isEmployee) {
    return (
      <nav className="sidebar">
        <img
          src={alcorelLogo}
          style={{ clipPath: "inset(75px 0 75px 0)", maxWidth: "190px" }}
        />

        <ul>
          <li>
            <NavLink to="/employee/dashboard" activeclassname="active">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee-ticket" activeclassname="active">
              Tickets
              {waitingTicketsCount > 0 && (
                <span className="notification-badge">
                  {waitingTicketsCount}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={handleLogout} className="logout-link"></a>
          </li>
        </ul>
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
            fontSize: "12px",
            color: "#7f8c8d",
          }}
        >
          Powered by{" "}
          <span style={{ fontWeight: "bold" }}>
            Alcorel<sup>&reg;</sup>
          </span>
        </div>
      </nav>
    );
  } else if (isAdmin) {
    return (
      <nav className="sidebar">
        <img
          src={alcorelLogo}
          style={{ clipPath: "inset(75px 0 75px 0)", maxWidth: "190px" }}
        />

        <ul>
          <li>
            <NavLink to="/admin/dashboard" activeclassname="active">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/edit-categories" activeclassname="active">
              Edit Categories
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee-ticket" activeclassname="active">
              Tickets
              {waitingTicketsCount > 0 && (
                <span className="notification-badge">
                  {waitingTicketsCount}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/add-questions" activeclassname="active">
              Add Questions
            </NavLink>
          </li>
          <li>
            <NavLink to="/manage-employee" activeclassname="active">
              Manage Employee
            </NavLink>
          </li>
          <li>
            <NavLink to="/usage-of-iframe" activeclassname="active">
              iFrame
            </NavLink>
          </li>
          <li>
            <NavLink to="/alcorel" activeclassname="active">
              Alcorel LandingPage
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={handleLogout} className="logout-link"></a>
          </li>
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e0e0e0",
              textAlign: "center",
              fontSize: "12px",
              color: "#7f8c8d",
            }}
          >
            <span>for demo purposes only</span>
          </div>
          <li>
            <NavLink to="/company/2" activeclassname="active">
              Green future corp.
            </NavLink>
          </li>
          <li>
            <NavLink to="/customer-view" activeclassname="active">
              Customer View (reply)
            </NavLink>
          </li>
        </ul>
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
            fontSize: "12px",
            color: "#7f8c8d",
          }}
        >
          Powered by{" "}
          <span style={{ fontWeight: "bold" }}>
            Alcorel<sup>&reg;</sup>
          </span>
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="sidebar">
        <ul>
          <li>
            <NavLink exact to="/" activeclassname="active">
              Create Ticket
            </NavLink>
          </li>
          <li>
            <NavLink to="/customer-view" activeclassname="active">
              Customer View (reply)
            </NavLink>
          </li>
          <li>
            <NavLink to="/company/2" activeclassname="active">
              Green future corp.
            </NavLink>
          </li>
          <li>
            <NavLink to="/login" activeclassname="active">
              Log-in
            </NavLink>
          </li>
        </ul>
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
            fontSize: "12px",
            color: "#7f8c8d",
          }}
        >
          Powered by{" "}
          <span style={{ fontWeight: "bold" }}>
            Alcorel<sup>&reg;</sup>
          </span>
        </div>
      </nav>
    );
  }
}
export default Navigation;
