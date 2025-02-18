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
      <h1>Employee Tickets</h1>
      {tickets.map((ticket, index) => (
        <div key={index}>
          <h2>Ticket ID: {ticket.ticketId}</h2>
          <h3>Customer Name: {ticket.userName}</h3>
          <h3>Category: {ticket.categoryName}</h3>
          {/* <h3>Message: {ticket.message}</h3> */}
          <h3>Status: {ticket.status}</h3>
          <h3>Date: {ticket.ticketTime}</h3>
        </div>
      ))}
    </>
  );
}
