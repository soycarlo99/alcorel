import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AddQuestions() {
  const [questionsList, setQuestionsList] = useState([]);
  const [category_id, setCategory] = useState("");
  const [questions, setQuestions] = useState("");

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  const handleQuestionChange = (event) => {
    setQuestions(event.target.value);
  };

  async function fetchQuestions() {
    try {
      const response = await fetch(`api/questions/${category_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`status: ${response.status}`);
      }
      const body = await response.json();
      setQuestionsList(body);
    } catch (error) {
      console.error("Fetching questions failed:", error);
    }
  }

  useEffect(() => {
    if (category_id) {
      fetchQuestions();
    }
  }, [category_id]);

  async function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);
    data = JSON.stringify(data);
    try {
      const response = await fetch("/api/questions", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: data,
      });
      if (response.ok) {
        await fetchQuestions();
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }

  function handleRemove(event) {
    event.preventDefault();
    fetch(event.target.action, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        fetchQuestions();
      }
    });
  }

  return (
    <>
      <h1>Add/See questions</h1>

      <div>
        <label>Select Category to View:</label>
        <select value={category_id} onChange={handleCategoryChange}>
          <option value="">Choose a Category</option>
          <option value="1">Storage</option>
          <option value="2">Delivery</option>
          <option value="3">Software</option>
          <option value="4">Hardware</option>
          <option value="5">Tech Support</option>
          <option value="6">Warehouse</option>
        </select>
      </div>

      <form className="form" onSubmit={handleAddSubmit}>
        <input
          name="questions"
          type="text"
          required
          placeholder="New question"
        />
        <select name="category_id" required>
          <option value="">Choose Category for Question</option>
          <option value="1">Storage</option>
          <option value="2">Delivery</option>
          <option value="3">Software</option>
          <option value="4">Hardware</option>
          <option value="5">Tech Support</option>
          <option value="6">Warehouse</option>
        </select>
        <input type="submit" value="Add Question" />
      </form>

      {questionsList.map((question) => (
        <div key={question.id}>
          <h3>Question: {question.questions}</h3>
          <p>Category ID: {question.category_id}</p>
          <form
            onSubmit={handleRemove}
            action={`/api/questions/${question.id}`}
          >
            <input type="submit" value={`Remove Question ${question.id}`} />
          </form>
        </div>
      ))}
    </>
  );
}
