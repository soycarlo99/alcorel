import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function CustomerView() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [answered, setAnswered] = useState({});
  const [rating, setRating] = useState(null);

  useEffect(() => {
    function fetchTicket() {
      fetch(`/api/ticket/token/${token}`)
        .then((response) => {
          if (!response.ok) throw new Error("Ticket not found");
          return response.json();
        })
        .then((data) => {
          setTicket(data);
        })
        .catch((error) => {
          console.error("Error fetching ticket:", error);
        });
    }

    if (token) {
      fetchTicket();
    }
  }, [token]);

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
        body: JSON.stringify({ status: "active" }),
      });

      fetch(`/api/ticket/token/${token}`)
        .then((response) => response.json())
        .then((data) => setTicket(data));

      event.target.reset();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleAnswerSubmit(event, questionId) {
    event.preventDefault();
    const answer = event.target.answer.value;

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
        setAnswered((prev) => ({ ...prev, [questionId]: true }));

        fetch(`/api/ticket/token/${token}`)
          .then((response) => response.json())
          .then((data) => setTicket(data));
      }
    } catch (error) {
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
                disabled={answered[qa.qid]}
              >
                Send answer
              </button>
            </form>
          </div>
        ))
      ) : (
        <p>No Q&A found</p>
      )}
      <h2>Messages</h2>
      {ticket.messages?.length > 0 ? (
        ticket.messages.map((msg, idx) => (
          <div key={idx} className="message">
            <small className="messageTime">
              {new Date(msg.timestamp).toLocaleString()}
            </small>
            <pre className="messageTextarea">{msg.message}</pre>
          </div>
        ))
      ) : (
        <p>No messages</p>
      )}
      <form className="form" onSubmit={handleAddSubmit}>
        <textarea name="message" required placeholder="Reply..." />
        <button type="submit">Send Reply</button>
      </form>
    </div>
  );
}
