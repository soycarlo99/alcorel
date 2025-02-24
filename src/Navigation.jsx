import "./style.css";
import { NavLink } from "react-router";

function Navigation() {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/EditCategories" activeclassname="active">
            Admin View
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
      </ul>
    </nav>
  );
}

export default Navigation;
