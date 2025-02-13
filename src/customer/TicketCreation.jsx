import { useState, useEffect} from "react";
import "./TicketCreation.css";


export default function TicketCreation() {
    const [categories, SetCategories] = useState([])
    const [name, setName] = useState([])
    const [email, setEmail] = useState([])

    const handleEmailChange = (event) => { setEmail(event.target.value); };
    const handleNameChange = (event) => { setName(event.target.value); };
    
    function handleSubmit() {

        fetch("/api/users", {

            headers: { "Content-Type": "application/json" },

            method: "POST",

            body: JSON.stringify(name, email)

        })

            .then(response => {

                if (response.ok) // .ok typ lika med if(response.status_code >= 200 && response.status_code < 300)

                {

                    setCart([]);

                }

            });

    }

    useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("http://localhost:5001/api/categories");
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
            onChange={handleNameChange}
          />
        </label>

        <label>
          Enter your email:
          <input
            type="text"
            value={email}
            onChange={handleEmailChange}
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
          <button onClick={handleSubmit}>submit</button>
    </main>
  );
}



