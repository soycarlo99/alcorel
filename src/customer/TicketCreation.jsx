import { useState } from "react";
import "./TicketCreation.css";
React, { useState, useEffect }

export default function TicketCreation() {
    const [categories, SetCategories] = useState([])
    
    useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("http://localhost:5073/api/categories");
        const body = await response.json();
        console.log("Fetched categories data:", body);
        SetCategories(body);
      } catch (error) {
        console.error("Failed to fetch categories from database:", error);
      }
    }

    [];
  });

  const listCategories = () => {
    const myArray = ["apple", "banana", "orange"];
    const myList = myArray.map((item) => <p>{item}</p>);
  };

  return (
    <main>
      <form className="form">
        <label>
          Enter your name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Enter your email:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Enter your phonenumber:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          <input type="file" id="myFile" name="filename"></input>
        </label>
        <label for="cars">Choose a category</label>
        <select name="cars" id="cars">
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>
      </form>
    </main>
  );
}
