import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function CustomerView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState(null);
  const [answered, setAnswered] = useState({});

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

    async function fetchQuestions() {
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

    //fetchQuestions();
    fetchTicket();
  }, [handleAddSubmit]);

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
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }

    const statusdata = JSON.stringify({ status: "active" });
    // data = JSON.stringify(data);
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

  async function handleAnswerSubmit(event, questionId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const answer = formData.get("answer");

    try {
      const response = await fetch(`/api/${id}/${questionId}/postAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (response.ok) {
        console.log("Answer sent");
        setAnswered((prev) => ({ ...prev, [questionId]: true }));
      }
    } catch (error) {
      console.error("Answer submission failed:", error);
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
            <p>Customer: {ticket.userName}</p>
            <p>Category: {ticket.categoryName}</p>
            <p>Created: {new Date(ticket.ticketTime).toLocaleString()}</p>
          </div>

          <h2>Questions & Answers</h2>
          {ticket.questionAnswers.length > 0 ? (
            ticket.questionAnswers.map((qa, idx) => (
              <div key={idx} className="qa">
                <p className="QuestionStyle">
                  <strong>Q:</strong> {qa.question}
                </p>
                <form
                  className="form"
                  onSubmit={(e) => handleAnswerSubmit(e, qa.qid)}
                >
                  <input name="answer" type="text" value={qa.answer} required />
                  <button
                    className="sendAnswer"
                    name="sendAnswer"
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
          {ticket.messages.length > 0 ? (
            ticket.messages.map((msg, idx) => (
              <div key={idx} className="message">
                <small className="messageTime">
                  {new Date(msg.timestamp).toLocaleString()}
                </small>
                <pre readOnly className="messageTextarea">
                  {msg.message}
                </pre>
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
