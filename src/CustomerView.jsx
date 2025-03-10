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

  async function SendFeedback(event) {
    console.log("hej");
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
        console.log("status updated");
      }
    } catch (error) {
      console.error("updating status failed:", error);
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
      {ticket.status == "solved" ? (
        <div>
          <form>
            <select
              value={rating || ""}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">Rate the experience please</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button onClick={SendFeedback}>Submit Rating</button>
          </form>
        </div>
      ) : (
        <p></p>
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
