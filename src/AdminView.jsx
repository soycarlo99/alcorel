import { useEffect, useState } from "react";

export default function AdminView() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
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
    GetCategory();
  }, []);


  function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);
    data = JSON.stringify(data);
    fetch("/api/postCategory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).then((response) => {
      if (response.ok) {
        console.log("Category added succesfully")
      }
    });
  }



  return (
    <div>
      <form className="form" onSubmit={handleAddSubmit}>

        <label>Add Category: </label>
        <input name="id" type="text" required />
        <input name="category_name" type="text" required />
        <input name="company_id" type="text" required />
        <input type="submit" value="Submit" />
      </form>
      <p>Existing categories:</p>
      <ul>
        {categories.map((item, index) => (
          <li key={index}>{item.category_name}</li>
        ))}
      </ul>
    </div>
  );
}
