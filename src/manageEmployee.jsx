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
      console.log(body);
    } catch (error) {
      console.error(error);
    }
  }

  function handleAddSubmit(event) {
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
    fetch("/api/PostEmployee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).then((response) => {
      if (response.ok) {
        GetEmployee();
        console.log("Employee Added Succesfully");
        document.getElementById("forum").reset();
      }
    });
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

  return (
    <div>
      <form id="forum" className="form" onSubmit={handleAddSubmit}>
        <label>Add Employee: </label>
        <p>Name: </p>
        <input name="name" type="text" required />
        <p>Email: </p>
        <input name="email" type="email" required />
        <p>password: </p>
        <input name="password" type="password" required />
        <input name="pending_confirmed" type="hidden" />
        <input name="admin_customer_employee" type="hidden" value="employee" />
        <p>company_id: </p>
        <input name="company_id" type="text" required />
        <input type="submit" value="Submit" />
      </form>
      <h3>Existing employees:</h3>
      {employee.map((item, index) => (
        <div className="ExistingEmployeeCard">
          <h3 id="employees" key={index}>{item.name}</h3>
          <form
            onSubmit={handleRemove}
            action={`/api/DeleteEmployee/${item.id}`}
          >
            <input id="ElimButton" type="submit" value={`Eliminate ${item.name}`} />
            <input id="ResetPassButton" type="submit" value={'Reset Password'} />
          </form>
        </div>
      ))}
    </div>
  );
}
