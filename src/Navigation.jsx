import "./style.css";
import { NavLink, Route, Navigate } from "react-router";
import { useState,useEffect } from "react";
import LoginPage from "./Login.jsx";

function Navigation() {

  const [isEmployee, setIsEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    fetch("/api/login/employee")
      .then(response => {
        if (response.ok) {
          setIsEmployee(true)
        } else {
          setIsEmployee(false)
        }
        
      })
    
    fetch("/api/login/admin")
      .then(response => {
        if (response.ok) {
          console.log(response)
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
        
      })
  }, []);
  if (isEmployee == null) {
    return null
  }
  if (isAdmin == null) {
    return null
  }



  if (isEmployee) {
    return (
      <nav className="sidebar">
        <ul>
          <li>
            <NavLink to="/EmployeeTicket" activeclassname="active">
              Employee Tickets
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
  } else if (isAdmin) {
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
            <NavLink to="/CustomerView" activeclassname="active">
              Customer View (reply)
            </NavLink>
          </li>
          <li>
            <NavLink to="/company/2" activeclassname="active">
              Green future corp.
            </NavLink>
          </li>
          <li>
            <NavLink to="/Alcorel" activeclassname="active">
              AlcoRel Landing page
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
