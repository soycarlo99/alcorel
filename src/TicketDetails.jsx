import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState(null);
  const [username, setUsername] = useState("");
  const textareaRef = useRef(null);

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

    function fetchUsername() {
      fetch("/api/session/username")
        .then((response) => {
          if (!response.ok) throw new Error("Username not found");
          return response.json();
        })
        .then((data) => {
          setUsername(data.username);
        })
        .catch((error) => {
          console.error("Error fetching username:", error);
        });
    }

    fetchTicket();
    fetchUsername();
  }, [handleAddSubmit]);

  async function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    let formData = Object.fromEntries(data);

    if (username) {
      formData.message = `${formData.message}\n\nBest regards,\n${username}`;
    }

    data = JSON.stringify(formData);
    try {
      const response = await fetch(`/api/${id}/message`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: data,
      });
      if (response.ok) {
        document.getElementById("replyform").reset();
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }

    const statusdata = JSON.stringify({ status: "active" });
    try {
      const response = await fetch(`/api/tickets/${id}/status`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: statusdata,
      });
      if (response.ok) {
        console.log("status updated");
      }
    } catch (error) {
      console.error("updating status failed:", error);
    }
  }

  async function handleToSolved(event) {
    const statusdata = JSON.stringify({ status: "solved" });
    try {
      const response = await fetch(`/api/tickets/${id}/status`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: statusdata,
      });
      if (response.ok) {
        console.log("status updated");
      }
    } catch (error) {
      console.error("updating status failed:", error);
    }
  }

  return (
    <>
      {ticket ? (
        <div className="ticket-details">
          <h1>Ticket #{ticket.ticketId}</h1>
          <div className="TicketHeader">
            <p>
              Status:{" "}
              <span className={`status ${ticket.status}`}>{ticket.status}</span>
            </p>
            <p>
              Customer: <strong>{ticket.userName}</strong>{" "}
            </p>
            <p>
              Category: <strong>{ticket.categoryName}</strong>
            </p>
            <p>
              Created:{" "}
              <strong>{new Date(ticket.ticketTime).toLocaleString()}</strong>
            </p>
          </div>

          <h2>Questions & Answers</h2>
          {ticket.questionAnswers.length > 0 ? (
            ticket.questionAnswers.map((qa, idx) => (
              <div key={idx} className="qa">
                <p className="QuestionStyle">
                  <strong>Q:</strong> {qa.question}
                </p>
                <p>
                  <strong>A:</strong>{" "}
                  {qa.answer ? (
                    <p className="yesReply">{qa.answer}</p>
                  ) : (
                    <p className="noReply">No replies yet</p>
                  )}
                </p>
              </div>
            ))
          ) : (
            <p>No Q&A found</p>
          )}

          <h2>Messages</h2>
          {ticket.messages.length > 0 ? (
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
                    readOnly
                    className={`messageTextarea ${isAlgoRelMessage ? "algorel-message" : ""}`}
                  >
                    {msg.message}
                  </pre>
                </div>
              );
            })
          ) : (
            <p>No messages</p>
          )}
          <div>
            <button className="MarkAsSolved" onClick={() => handleToSolved()}>
              Mark as solved
            </button>
            <form className="form" id="replyform" onSubmit={handleAddSubmit}>
              <textarea
                name="message"
                type="text"
                required
                placeholder="Reply ... (signature will be added automatically)"
                ref={textareaRef}
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
