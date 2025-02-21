import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    function fetchTicket() {
      fetch(`/api/ticket/${id}`)
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

    function fetchMessage() {
      fetch(`/api/${id}/message`)
        .then((response) => {
          if (!response.ok) throw new Error("Message not found");
          return response.json();
        })
        .then((data) => {
          setTicket(data);
        })
        .catch((error) => {
          console.error("Error fetching message:", error);
        });
    }

    // fetchMessage();
    fetchTicket();
  }, [id, handleAddSubmit]);


  async function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);
    data = JSON.stringify(data);
    try {
      const response = await fetch(`/api/${id}/message`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: data,
      });
      if (response.ok) {
        await fetchTicket();

      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }

  return (
    <>
      {ticket ? (
        <div className="ticket-details">
          <h1>Ticket #{ticket.ticketId}</h1>
          <p>
            Status:{" "}
            <span className={`status ${ticket.status}`}>{ticket.status}</span>
          </p>
          <p>Customer: {ticket.userName}</p>
          <p>Category: {ticket.categoryName}</p>
          <p>Created: {new Date(ticket.ticketTime).toLocaleString()}</p>

          <h2>Questions & Answers</h2>
          {ticket.questionAnswers.length > 0 ? (
            ticket.questionAnswers.map((qa, idx) => (
              <div key={idx} className="qa">
                <p>
                  <strong>Q:</strong> {qa.question}
                </p>
                <p>
                  <strong>A:</strong> {qa.answer}
                </p>
              </div>
            ))
          ) : (
            <p>No Q&A found</p>
          )}

          <h2>Messages</h2>
          {ticket.messages.length > 0 ? (
            ticket.messages.map((msg, idx) => (
              <div key={idx} className="message">
                <p>{msg.message}</p>
                <small>{new Date(msg.timestamp).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <p>No messages</p>
          )}
          <div>
            <form className="form" onSubmit={handleAddSubmit}>
              <textarea
                name="message"
                type="text"
                required
                placeholder="Reply ... "
              />
              <button type="submit">Send Reply</button>
            </form>
          </div>

        </div>

      ) : (
        <p>No ticket found</p>
      )}
    </>
  );
}
