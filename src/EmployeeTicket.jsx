import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function EmployeeTicket(){




    useEffect(() =>  {
  async function fetchTicket(){
      const response = await fetch("/api/tickets");
      const body = await response.json();
      //{body} = json;
      console.log(body);



  }
fetchTicket()
 
    },[]);
 
    return <>
    
    <h1>hejfghfghf</h1>
     
        
</>;
}