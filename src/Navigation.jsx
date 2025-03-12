import "./style.css";
import { NavLink, Route } from "react-router";
import { useState, useEffect } from "react";
import LoginPage from "./Login.jsx";

function Navigation() {
  const [waitingTicketsCount, setWaitingTicketsCount] = useState(0);

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
    fetchTickets();
  }, []);

  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/edit-categories" activeclassname="active">
            Edit Categories
          </NavLink>
        </li>
        <li>
          <NavLink to="/employee-ticket" activeclassname="active">
            Employee Tickets
            {waitingTicketsCount > 0 && (
              <span className="notification-badge">{waitingTicketsCount}</span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/" activeclassname="active">
            Create Ticket
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
          <NavLink to="/customer-view" activeclassname="active">
            Customer View (reply)
          </NavLink>
        </li>
        <li>
          <NavLink to="/alcorel" activeclassname="active">
            AlcoRel Landing page
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" activeclassname="active">
            Log-in
          </NavLink>
        </li>
        <li>
          <NavLink to="/usage-of-iframe" activeclassname="active">
            Usage of iFrame
          </NavLink>
        </li>
        <li>
          <NavLink to="/company/2" activeclassname="active">
            Green future corp.
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

export default Navigation;
