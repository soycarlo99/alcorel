import "./style.css";
import { NavLink, Route } from "react-router";
import LoginPage from "./Login.jsx";

function Navigation() {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/EditCategories" activeclassname="active">
            Edit Categories
          </NavLink>
        </li>
        <li>
          <NavLink to="/EmployeeTicket" activeclassname="active">
            Employee Tickets
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/" activeclassname="active">
            Create Ticket
          </NavLink>
        </li>
        <li>
          <NavLink to="/AddQuestions" activeclassname="active">
            Add Questions
          </NavLink>
        </li>
        <li>
          <NavLink to="/ManageEmployee" activeclassname="active">
            Manage Employee
          </NavLink>
        </li>
        <li>
          <NavLink to="/CustomerView" activeclassname="active">
            Customer View (reply)
          </NavLink>
        </li>
        <li>
          <NavLink to="/Login" activeclassname="active">
            Log-in
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
