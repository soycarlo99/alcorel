import { useEffect, useState } from "react";
import {BrowserRouter, Routes, Route, useNavigate} from 'react-router'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
let navigate = useNavigate();
  
  function handleLogin(event) {
    event.preventDefault();

    fetch("/api/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((response) => {
      if (response.ok) {
        response.text().then(location => {navigate(location.slice(1,-1))});
        //setEmail("");
        //setPassword("");
      }
    });
  }

  return (
    <>
      <h1>Tjena Edvin!</h1>
      <div>
        <input
          type="text"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleLogin}>Login</button>
      </div>
    </>
  );
}
