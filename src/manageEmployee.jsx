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
      setCategories(body);
      console.log(body);
    } catch (error) {
      console.error(error);
    }
  }

  function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);
    data = JSON.stringify(data);
    fetch("/api/PostEmployee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).then((response) => {
      if (response.ok) {
        GetCategory();
        console.log("Employee Added Succesfully");
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
      <form className="form" onSubmit={handleAddSubmit}>
        <label>Add Employee: </label>

        <input name="name" type="text" required />
        <input name="email" type="email" required />
        <input name="password" type="text" required />
        <input name="company_id" type="text" required />
        <input type="submit" value="Submit" />
      </form>
      <p>Existing employees:</p>

      {employee.map((item, index) => (
        <div>
          <h3 key={index}>{item.name}</h3>
          <form
            onSubmit={handleRemove}
            action={`/api/DeleteEmployee/${item.id}`}
          >
            <input type="submit" value={`Remove Employee ${item.id}`} />
          </form>
        </div>
      ))}
    </div>
  );
}
