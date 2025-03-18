import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function AddQuestions() {
  const [questionsList, setQuestionsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category_id, setCategory] = useState("");
  const [questions, setQuestions] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newQuestionText, setNewQuestionText] = useState("");

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

  function showEdit(id, currentQuestion) {
    setEditingId(id);
    setNewQuestionText(currentQuestion);
  }

  async function handleQuestionEditSubmit(event) {
    event.preventDefault();
    const form = event.target;
    let data = new FormData(form);
    data = Object.fromEntries(data);

    try {
      const response = await fetch(`/api/update/question/${data.id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ question: newQuestionText }),
      });

      if (response.ok) {
        console.log(`Question updated`);
        fetchQuestions();
        setEditingId(null);
      }
    } catch (error) {
      console.error("Question update failed:", error);
    }
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
            <button type="submit" className="RemoveButton">
              -
            </button>
          </form>
          <h3>{question.questions}</h3>
          <button
            className="editButton"
            onClick={() => showEdit(question.id, question.questions)}
          >
            ✎
          </button>
          {editingId === question.id && (
            <div className="editForm">
              <form onSubmit={handleQuestionEditSubmit}>
                <input
                  className="editCategoryForm"
                  name="question"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                />
                <input name="id" type="hidden" value={question.id} />
                <button className="SaveButton" type="submit">
                  &#10003;
                </button>
                <button
                  type="button"
                  className="RemoveButton"
                  onClick={() => setEditingId(null)}
                >
                  x
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
