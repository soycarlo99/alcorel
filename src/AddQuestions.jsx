import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function AddQuestions() {
  const [questionsList, setQuestionsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category_id, setCategory] = useState("");
  const [questions, setQuestions] = useState("");

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleQuestionChange = (event) => {
    setQuestions(event.target.value);
  };

  async function fetchCategories() {
    try {
      const response = await fetch("/api/GetCategory");
      if (!response.ok) {
        throw new Error(`status: ${response.status}`);
      }
      const body = await response.json();
      setCategories(body);
    } catch (error) {
      console.error("Fetching categories failed:", error);
    }
  }

  async function fetchQuestions() {
    if (!category_id) return;
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
    fetchCategories();
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
        event.target.reset();
        setQuestions("");
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
      <div className="form">
        <select value={category_id} onChange={handleCategoryChange}>
          <option value="">Select Category to View</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>
      <form className="form" onSubmit={handleAddSubmit}>
        <input
          name="questions"
          type="text"
          required
          placeholder="New question"
          value={questions}
          onChange={handleQuestionChange}
        />
        <select name="category_id" required>
          <option value="">Choose Category for Question</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
        <input type="submit" value="Add Question" />
      </form>
      {questionsList.map((question) => (
        <div key={question.id} className="removeCat">
          <form
            onSubmit={handleRemove}
            action={`/api/questions/${question.id}`}
          >
            <button
              type="submit"
              className="RemoveButton"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              -
            </button>
          </form>
          <h3>{question.questions}</h3>
        </div>
      ))}
    </>
  );
}
