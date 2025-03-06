import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function TicketCreation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [category_id, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/GetCategory")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/createusers", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          Name: name,
          Email: email,
          Message: message,
          Category_id: category_id,
        }),
      });

      if (response.ok) {
        const result = await response.text();
        setFeedback("Ticket created successfully!");

        setName("");
        setEmail("");
        setMessage("");
        setCategory("");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="CreateTicket">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Enter your name:
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            required
          />
        </label>

        <label>
          Enter your email:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </label>

        <label>
          Enter your Message:
          <textarea
            value={message}
            onChange={handleMessageChange}
            required
          ></textarea>
        </label>

        <label htmlFor="category-select">Choose a category:</label>
        <select
          id="category-select"
          value={category_id}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Please Choose an Option</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </main>
  );
}
