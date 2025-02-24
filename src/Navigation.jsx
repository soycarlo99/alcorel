import "./style.css";
import { NavLink } from "react-router";

function Navigation() {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/EditCategories" activeClassName="active">
            Edit Categories
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
        <li>
          <NavLink to="/ManageEmployee" activeClassName="active">
            Manage Employee
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
