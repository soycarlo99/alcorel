import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTicket() {
  const [tickets, setTickets] = useState([]);
  const [ticketsId, setTicketsId] = useState(true);


   function toggleTicketsId() {
    if(ticketsId === true) {
      setTicketsId(false);
      handleSortID()
    } else if (ticketsId === false) {
      setTicketsId(true);
      handleSortID1()
    }
  }

const handleSortID = () => {
  const sorted = [...tickets].sort((a, b) => {
  return a.ticketId - b.ticketId;
    });
  setTickets(sorted)
  };  

  const handleSortID1 = () => {

    const sorted1 = [...tickets].sort((a, b) => {
  return b.ticketId - a.ticketId;
    });
  setTickets(sorted1)
  };  



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
          <button type="button"  onClick={toggleTicketsId}>ID</button>
          <button>Customer</button>
          <button>Category</button>
          <button>Status</button>
          <button>Date</button>
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
