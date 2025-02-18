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

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          "api/questions/3",
          /*Här behöver vi ändra 2 till en useState value som ändrar Categories ID:et med vad vill se!*/ {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          throw new Error(`status: ${response.status}`);
        }
        const body = await response.json();
        setQuestionsList(body);
      } catch (error) {
        console.error("Fetching questions failed:", error);
      }
    }
    fetchQuestions();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    console.log(data);
    data = Object.fromEntries(data);
    console.log(data);
    data = JSON.stringify(data);
    fetch("/api/questions", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: data,
    }).then((response) => {
      if (response.ok) {
        //setQuestions("");
      }
    });
  }

  return (
    <>
      <h1>Add/See questions</h1>
      <form className="form" onSubmit={handleSubmit}>
        <input name="questions" type="text" required />
        <input type="submit" value="Submit" />

        <select name="category_id" required>
          <option value="">Please Choose an Option</option>
          <option value="1">Storage</option>
          <option value="2">Delivery</option>
          <option value="3">Software</option>
          <option value="4">Hardware</option>
          <option value="5">Tech Support</option>
          <option value="6">Warehouse</option>
        </select>
      </form>

      {questionsList.map((question, index) => (
        <div key={index}>
          <h2>Question ID: {question.id}</h2>
          <h3>Question: {question.questions}</h3>
          <h3>Category ID: {question.category_id}</h3>
        </div>
      ))}
    </>
  );
}
