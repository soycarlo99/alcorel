import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const response = await fetch(`/api/ticket/${id}`);
        if (!response.ok) throw new Error("Ticket not found");
        const data = await response.json();
        setTicket(data);
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [id]);

  return (
    <>
      <div className="TicketDetails">
        <h1>Ticket #{ticket.Id}</h1>
      </div>
    </>
  );
}
