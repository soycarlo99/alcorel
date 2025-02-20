import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTicket() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch("/api/DetailedTicket");
        if (!response.ok) {
          throw new Error(`status: ${response.status}`);
        }
        const body = await response.json();
        setTickets(body);
      } catch (error) {
        console.error("Fetching tickets failed:", error);
      }
    }
    fetchTickets();
  }, []);

  return (
    <>
      <div className="Tickets">
        <h1>Tickets</h1>
        <div className="Titles">
          <h2>ID</h2>
          <h2>Customer</h2>
          <h2>Category</h2>
          <h2>Status</h2>
          <h2>Date</h2>
        </div>

        {tickets.map((ticket, index) => (
          <Link
            to={`/Ticket/${ticket.ticketId}`}
            key={index}
            className="TicketView"
          >
            <p>#{ticket.ticketId}</p>
            <p>{ticket.userName}</p>
            <p>{ticket.categoryName}</p>
            <p className={`status ${ticket.status}`}>{ticket.status}</p>
            <p>{ticket.ticketTime}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
