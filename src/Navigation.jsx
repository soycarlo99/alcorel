import "./style.css";
import {NavLink, Route} from "react-router";
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
      </ul>
    </nav>
  );
}

export default Navigation;
