import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import alcorelLogo from "../logotype/AlcoRel.png";

export default function TicketCreation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [category_id, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
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
    setFeedback("");

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
        if (result.includes("Access URL:")) {
          const accessUrl = result.split("Access URL:")[1].trim();
          setTimeout(() => {
            navigate(accessUrl);
          }, 1500);
        }
      } else {
        setFeedback("Failed to create ticket. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setFeedback("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <a href="/login" className="login-link"></a>
      <main className="CreateTicket">
        <img
          src={alcorelLogo}
          alt="Alcorel"
          style={{ margin: "-30px 0px -40px 0", maxWidth: "100px" }}
        />
        {feedback && (
          <div
            className={
              feedback.includes("success") ? "success-message" : "error-message"
            }
          >
            {feedback}
          </div>
        )}
        <form className="form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name-input">Enter your name:</label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email-input">Enter your email:</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div>
            <label htmlFor="message-input">Enter your Message:</label>
            <textarea
              id="message-input"
              value={message}
              onChange={handleMessageChange}
              required
            ></textarea>
          </div>

          <div>
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
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </main>
      <footer className="alcorel-footer">
        <p>© {new Date().getFullYear()} Alcorel CRM. All rights reserved.</p>
      </footer>
    </>
  );
}
