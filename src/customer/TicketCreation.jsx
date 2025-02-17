import { useState, useEffect } from "react";
import "./TicketCreation.css";

export default function TicketCreation() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("initialpassword");
  const [message, setMessage] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };




  function handleSubmit(event) {
    event.preventDefault();

    fetch("/api/createusers", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    }).then((response) => {
      if (response.ok) {
        // .ok typ lika med if(response.status_code >= 200 && response.status_code < 300)
        setName("");
        setEmail("");
      }
    });
  }
  /*
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
*/
  return (
      <main>
        <form className="form">
          <label>
            Enter your name:
            <input type="text" value={name} onChange={handleNameChange} />
          </label>

          <label>
            Enter your email:
            <input type="text" value={email} onChange={handleEmailChange} />
          </label>

          <label>
            <input type="file" id="myFile" name="filename"></input>
          </label>
          <label>
            Enter your Message:
            <input type="text" value={message} onChange={handleMessageChange}></input>
          </label>
        </form>
        <form className="form" onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </form>
      </main>
  );
}
