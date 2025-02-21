import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

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
    fetchTicket();
  }, [id]);

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
        </div>
      ) : (
        <p>No ticket found</p>
      )}
    </>
  );
}
