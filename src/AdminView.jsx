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

    async function PostCategories() {
      try {
        const categoryInput = await fetch("/api/PostCategories");
        const body = await response.json();
        setCategories(body);
      } catch (error) {
        console.error(error);
      }
    }
    GetCategory();
  }, []);

  return (
    <div>
      <form onsubmit="">
        <label>Add Category: </label>
        <input type="text"></input>
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
