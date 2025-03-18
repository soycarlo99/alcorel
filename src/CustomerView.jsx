import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTicket } from "./TicketContext";
import alcorelLogo from "./logotype/AlcoRel.png";

export default function CustomerView() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [rating, setRating] = useState(null);
  const { setTicketData, refreshTrigger } = useTicket();

  const fetchTicket = () => {
    fetch(`/api/ticket/token/${token}`)
      .then((response) => {
        if (!response.ok) throw new Error("Ticket not found");
        return response.json();
      })
      .then((data) => {
        setTicket(data);
        setTicketData(data);
      })
      .catch((error) => {
        console.error("Error fetching ticket:", error);
      });
  };

  useEffect(() => {
    if (token) {
      fetchTicket();
    }
  }, [token]);

  useEffect(() => {
    if (token && refreshTrigger > 0) {
      fetchTicket();
    }
  }, [refreshTrigger, token]);

  useEffect(() => {
    if (ticket && ticket.questionAnswers) {
      const initialAnsweredState = {};
      ticket.questionAnswers.forEach((qa) => {
        initialAnsweredState[qa.qid] = !!qa.answer;

        /*double negation - explain it in class if people are intressted - falsy values in JS are
        false
        0 (zero)
        "" (empty string)
        null
        undefined
        NaN */
      });
      setAnsweredQuestions(initialAnsweredState);
    }
  }, [ticket]);

  async function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);

    try {
      await fetch(`/api/${ticket.ticketId}/message`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(data),
      });

      await fetch(`/api/tickets/${ticket.ticketId}/status`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ status: "waiting" }),
      });

      fetch(`/api/ticket/token/${token}`)
        .then((response) => response.json())
        .then((data) => setTicket(data));

      event.target.reset();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function updateTicketStatus(ticketId, status = "waiting") {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return response;
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      throw error;
    }
  }

  async function handleAnswerSubmit(event, questionId) {
    event.preventDefault();
    const answer = event.target.answer.value;

    setAnsweredQuestions((prev) => ({ ...prev, [questionId]: true }));

    try {
      const response = await fetch(
        `/api/${ticket.ticketId}/${questionId}/postAnswer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer }),
        },
      );

      if (response.ok) {
        await updateTicketStatus(ticket.ticketId, "waiting");

        const tokenResponse = await fetch(`/api/ticket/token/${token}`);
        const data = await tokenResponse.json();
        setTicket(data);
        setTicketData(data);
      } else {
        setAnsweredQuestions((prev) => ({ ...prev, [questionId]: false }));
        console.error("Failed to submit answer");
      }
    } catch (error) {
      setAnsweredQuestions((prev) => ({ ...prev, [questionId]: false }));
      console.error("Answer submission failed:", error);
    }
  }

  async function handleRatingSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch(
        `/api/sendRating/${rating}/${ticket.ticketId}`,
        {
          headers: { "Content-Type": "application/json" },
          method: "PUT",
          body: "",
        },
      );
      if (response.ok) {
        console.log(
          `Rating ${rating} submitted for ticket #${ticket.ticketId} successfully`,
        );
      }
    } catch (error) {
      console.error("Rating submission failed:", error);
    }
  }

  if (!ticket) return <p>Loading ticket...</p>;

  return (
    <div className="ticket-details">
      <img
        src={alcorelLogo}
        alt="Alcorel"
        style={{ margin: "-30px 0px -40px 0", maxWidth: "100px" }}
      />
      <h1>Ticket #{ticket.ticketId}</h1>
      <div className="TicketHeader">
        <p>
          Status:{" "}
          <span className={`status ${ticket.status}`}>{ticket.status}</span>
        </p>
        <p>Customer: {ticket.userName}</p>
        <p>Category: {ticket.categoryName}</p>
        <p>Created: {new Date(ticket.ticketTime).toLocaleString()}</p>
      </div>
      {ticket.status === "solved" && (
        <div>
          <h3>Please rate your experience</h3>
          <form onSubmit={handleRatingSubmit}>
            <div className="rating">
              <input
                value="5"
                id="star-1"
                type="radio"
                name="rating"
                checked={rating === "5"}
                onChange={(e) => setRating(e.target.value)}
              />
              <label htmlFor="star-1">★</label>
              <input
                value="4"
                id="star-2"
                type="radio"
                name="rating"
                checked={rating === "4"}
                onChange={(e) => setRating(e.target.value)}
              />
              <label htmlFor="star-2">★</label>
              <input
                value="3"
                id="star-3"
                type="radio"
                name="rating"
                checked={rating === "3"}
                onChange={(e) => setRating(e.target.value)}
              />
              <label htmlFor="star-3">★</label>
              <input
                value="2"
                id="star-4"
                type="radio"
                name="rating"
                checked={rating === "2"}
                onChange={(e) => setRating(e.target.value)}
              />
              <label htmlFor="star-4">★</label>
              <input
                value="1"
                id="star-5"
                type="radio"
                name="rating"
                checked={rating === "1"}
                onChange={(e) => setRating(e.target.value)}
              />
              <label htmlFor="star-5">★</label>
            </div>
            <button className="SendRating" type="submit">
              Submit Rating
            </button>
          </form>
        </div>
      )}
      <h2>Questions & Answers</h2>
      <div className="qas">
        {ticket.questionAnswers?.length > 0 ? (
          ticket.questionAnswers.map((qa, idx) => (
            <div key={idx} className="qa">
              <p className="QuestionStyle">
                <strong>Q:</strong> {qa.question}
              </p>
              <form
                className="form"
                onSubmit={(e) => handleAnswerSubmit(e, qa.qid)}
              >
                <input
                  name="answer"
                  type="text"
                  defaultValue={qa.answer}
                  required
                />
                <button
                  className="sendAnswer"
                  type="submit"
                  disabled={answeredQuestions[qa.qid]}
                >
                  {answeredQuestions[qa.qid] ? (
                    "Sent ✓"
                  ) : (
                    <>
                      Send <span>&#10146;</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ))
        ) : (
          <p>No Q&A found</p>
        )}
      </div>
      <h2>Messages</h2>
      {ticket.messages?.length === 0 && <p>No messages</p>}

      {ticket.messages?.length === 1 && (
        <>
          {ticket.messages.map((msg, idx) => {
            const isAlgoRelMessage =
              msg.message.trim().endsWith("- AlgoRel") ||
              msg.message.trim().endsWith("-AlgoRel");
            return (
              <div key={idx} className="message">
                <small className="messageTime">
                  {new Date(msg.timestamp).toLocaleString()}
                </small>
                <pre
                  className={`messageTextarea ${isAlgoRelMessage ? "algorel-message" : ""}`}
                >
                  {msg.message}
                </pre>
              </div>
            );
          })}

          {/* typing animation */}
          <div className="typing-animation">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </>
      )}

      {ticket.messages?.length > 1 &&
        ticket.messages.map((msg, idx) => {
          const isAlgoRelMessage =
            msg.message.trim().endsWith("- AlgoRel") ||
            msg.message.trim().endsWith("-AlgoRel");
          return (
            <div key={idx} className="message">
              <small className="messageTime">
                {new Date(msg.timestamp).toLocaleString()}
              </small>
              <pre
                className={`messageTextarea ${isAlgoRelMessage ? "algorel-message" : ""}`}
              >
                {msg.message}
              </pre>
            </div>
          );
        })}
      <form className="form" onSubmit={handleAddSubmit}>
        <textarea name="message" required placeholder="Reply..." />
        <button type="submit">Send Reply</button>
      </form>
      <footer className="alcorel-footer">
        <p>© {new Date().getFullYear()} Alcorel CRM. All rights reserved.</p>
      </footer>
    </div>
  );
}
