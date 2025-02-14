import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTicket() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function fetchTicket() {
      const response = await fetch("/api/tickets");
      const body = await response.json();
      console.log(body);
      setTickets(body);
    }
    fetchTicket();
  }, []);

  return (
    <>
      <h1>Employeee Tickets</h1>
      {tickets.map((ticket, index) => (
        <div>
          <h2>Ticket ID: {ticket.ticket_id}</h2>
          <h3>Ticket time: {ticket.ticket_time}</h3>
          <h3>Messages: {ticket.message}</h3>
          <h3>Reasoning: {ticket.category_id}</h3>
          <h3>Customer: {ticket.user_id}</h3>
          <h3>Status: {ticket.status}</h3>
        </div>
      ))}
    </>
  );
}
