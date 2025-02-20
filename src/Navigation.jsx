import "./style.css";
import { NavLink } from "react-router-dom";

function Navigation() {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/AdminView" activeClassName="active">
            Admin View
          </NavLink>
        </li>
        <li>
          <NavLink to="/EmployeeTicket" activeClassName="active">
            Employee Tickets
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/" activeClassName="active">
            Create Ticket
          </NavLink>
        </li>
        <li>
          <NavLink to="/AddQuestions" activeClassName="active">
            Add Questions
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
