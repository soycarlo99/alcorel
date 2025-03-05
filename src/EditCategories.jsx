import { useEffect, useState } from "react";

export default function EditCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    GetCategory();
  }, []);

  async function GetCategory() {
    try {
      const response = await fetch("/api/GetCategory");
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
    fetch("/api/PostCategory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).then((response) => {
      if (response.ok) {
        GetCategory();
        console.log("Category Added Succesfully");
      }
    });
  }

  function handleRemove(event) {
    event.preventDefault();
    fetch(event.target.action, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        GetCategory();
      }
    });
  }

  return (
    <div>
      <form className="form" onSubmit={handleAddSubmit}>
        <label>Add Category: </label>

        <input name="category_name" type="text" required />
        <input name="company_id" type="text" required />
        <input type="submit" value="Submit" />
      </form>
      <p>Existing categories:</p>

      {categories.map((item, index) => (
        <div>
          <h3 key={index}>{item.category_name}</h3>
          <form
            onSubmit={handleRemove}
            action={`/api/DeleteCategory/${item.id}`}
          >
            <input type="submit" value={`Remove Category ${item.id}`} />
          </form>
        </div>
      ))}
    </div>
  );
}
