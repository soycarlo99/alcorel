import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AddQuestions() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          "api/questions/2",
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
        setQuestions(body);
      } catch (error) {
        console.error("Fetching questions failed:", error);
      }
    }
    fetchQuestions();
  }, []);

  return (
    <>
      <h1>Add/See questions</h1>
      {questions.map((question, index) => (
        <div key={index}>
          <h2>Question ID: {question.id}</h2>
          <h3>Question: {question.questions}</h3>
          <h3>Category ID: {question.category_id}</h3>
        </div>
      ))}
    </>
  );
}
