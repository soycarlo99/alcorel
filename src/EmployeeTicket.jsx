import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTicket() {
  const [tickets, setTickets] = useState([]);
  const [ticketsId, setTicketsId] = useState(true);
  const [ticketsStatus, setTicketsStatus] = useState(true);
  const [ticketsCategory, setTicketsCategory] = useState(true);
  const [ticketsDate, setTicketsDate] = useState(true);

	const [query, setQuery] = useState('');

  console.log(tickets);


  //FOR SORTING ON STATUS
  



  //FOR SOTRTING ON CATEGORY

  function toggleTicketsCategory() {
    if (ticketsCategory === true) {
      console.log(ticketsCategory);
      setTicketsCategory(false);
      handleSortCategory();
    } else if (ticketsCategory === false) {
      console.log(ticketsCategory);
      setTicketsCategory(true);
      handleSortCategory1();
    }
  }

  const handleSortCategory = () => {
    const sorted = [...tickets].sort((a, b) => {
      return a.categoryName.localeCompare(b.categoryName);
    });
    setTickets(sorted);
  };

  const handleSortCategory1 = () => {
    const sorted1 = [...tickets].sort((a, b) => {
      return b.categoryName.localeCompare(a.categoryName);
    });
    setTickets(sorted1);
  };

  //FOR SORTING BY DATE
  function toggleTicketsDate() {
    if (ticketsDate === true) {
      setTicketsDate(false);
      handleSortDate();
    } else if (ticketsDate === false) {
      setTicketsDate(true);
      handleSortDate1();
    }
  }

  const handleSortDate = () => {
    const sorted = [...tickets].sort((a, b) => {
      var dateA = new Date(a.ticketTime).getTime();
      var dateB = new Date(b.ticketTime).getTime();
      return dateB - dateA;
    });
    setTickets(sorted);
  };

  const handleSortDate1 = () => {
    const sorted1 = [...tickets].sort((a, b) => {
      var dateA = new Date(a.ticketTime).getTime();
      var dateB = new Date(b.ticketTime).getTime();
      return dateA - dateB;
    });
    setTickets(sorted1);
  };

  //FOR SORTING BY ID
  function toggleTicketsId() {
    if (ticketsId === true) {
      setTicketsId(false);
      handleSortID();
    } else if (ticketsId === false) {
      setTicketsId(true);
      handleSortID1();
    }
  }

  const handleSortID = () => {
    const sorted = [...tickets].sort((a, b) => {
      return a.ticketId - b.ticketId;
    });
    setTickets(sorted);
  };

  const handleSortID1 = () => {
    const sorted1 = [...tickets].sort((a, b) => {
      return b.ticketId - a.ticketId;
    });
    setTickets(sorted1);
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

  const filteredResults = tickets.filter(ticket =>
    ticket.status.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="Tickets">
        <h1>Tickets</h1>
        <div className="Titles">
          <button type="button" onClick={toggleTicketsId}>
            ID ↕️
          </button>
          <button>Customer</button>
          <button type="button" onClick={toggleTicketsCategory}>
            Category ↕️
          </button>
          <input
				type="text"
				placeholder="Status"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
          <button type="button" onClick={toggleTicketsDate}>
            Date ↕️
          </button>
          
        </div>

        {filteredResults.map((ticket, index) => (
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
