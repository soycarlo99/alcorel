import { useEffect, useState } from "react";
export default function ManageEmployees() {
  const [employee, SetEmployee] = useState([]);

  useEffect(() => {
    GetEmployee();
  }, []);

  async function GetEmployee() {
    try {
      const response = await fetch("/api/GetEmployee");
      const body = await response.json();
      SetEmployee(body);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);
    data.pending_confirmed = event.target.pending_confirmed.checked;
    if (!data.role) {
      data.role = "employee";
    }
    console.log(data);
    data = JSON.stringify(data);
    console.log(data);
    try {
      const response = await fetch("/api/PostEmployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      if (response.ok) {
        GetEmployee();
        console.log("Employee Added Succesfully");
        document.getElementById("forum").reset();
      } else if (response.badrequest) {
        console.log(badrequest);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleRemove(event) {
    event.preventDefault();
    fetch(event.target.action, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        GetEmployee();
      }
    });
  }

  function handleResetPassword(event) {
    event.preventDefault();
    let data = JSON.stringify(EventTarget.data);
    console.log(EventTarget.data);
    fetch(event.target.action, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).then((response) => {
      if (response.ok) {
        console.log(response);
        GetEmployee();
      }
    });
  }
  return (
    <div>
      <form id="forum" className="form" onSubmit={handleAddSubmit}>
        <label>Add Employee</label>
        <input
          name="name"
          placeholder="enter new employee's name"
          type="text"
          required
        />
        <input
          name="email"
          placeholder="enter new employee's email"
          type="email"
          required
        />
        <p className="note">
          New employees get the password <strong>welcome</strong> by default.
          when they log-in they will get prompt to reset their password
        </p>
        <input name="password" type="hidden" />
        <input name="pending_confirmed" type="hidden" />
        <input name="admin_customer_employee" type="hidden" value="employee" />
        <input type="submit" value="Add employee" />
      </form>
      <h3>Existing employees:</h3>
      {employee.map((item, index) => (
        <div className="ExistingEmployeeCard" key={index}>
          <div className="removeCat">
            <form
              onSubmit={handleRemove}
              action={`/api/DeleteEmployee/${item.id}`}
            >
              <input
                className="RemoveButton"
                type="submit"
                value="-"
                title={`Eliminate ${item.name}`}
              />
            </form>
            <h3 id="employees">{item.name}</h3>
          </div>
          <form
            name="resetpassword"
            onSubmit={handleResetPassword}
            action={`/api/ResetPassword/${item.id}`}
          >
            <input
              id="ResetPassButton"
              type="submit"
              value={"Reset Password"}
            />
          </form>
        </div>
      ))}
    </div>
  );
}
