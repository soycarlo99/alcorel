import { createContext, useContext, useState } from "react";

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const [ticketData, setTicketData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <TicketContext.Provider
      value={{ ticketData, setTicketData, refreshTrigger, triggerRefresh }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export const useTicket = () => useContext(TicketContext);
