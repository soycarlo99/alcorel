import { useState, useEffect } from "react";

export default function TicketCreation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("initialpassword");
  const [message, setMessage] = useState("");
  const [category_id, setCategory] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };
  const handleCategoryChange = (event) => {
    setCategory(parseInt(event.target.value, 10) || "");
  };

  function handleSubmit(event) {
    event.preventDefault();

    fetch("/api/createusers", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ name, email, message, category_id }),
    }).then((response) => {
      if (response.ok) {
        // .ok typ lika med if(response.status_code >= 200 && response.status_code < 300
        setName("");
        setEmail("");
        setMessage("");
        setCategory("");
      }
    });
  }

  return (
    <main className="CreateTicket">
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
          Enter your Message:
          <textarea
            type="text"
            value={message}
            onChange={handleMessageChange}
          ></textarea>
        </label>
        <label for="pet-select">Choose a category:</label>

        <select value={category_id} onChange={handleCategoryChange}>
          <option>Please Choose an Option</option>
          <option value="1">Storage</option>
          <option value="2">Delivery</option>
          <option value="3">Software</option>
          <option value="4">Hardware</option>
          <option value="5">Tech Support</option>
          <option value="6">Warehouse</option>
        </select>
      </form>
      <form className="form" onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
