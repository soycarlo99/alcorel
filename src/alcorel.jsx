import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

export default function Alcorel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function signup(event) {
    event.preventDefault();
    setError("");

    const form = event.target;
    let data = new FormData(form);
    data = Object.fromEntries(data);
    data = JSON.stringify(data);

    fetch(form.action, {
      headers: {
        "Content-Type": "application/json",
      },
      method: form.method,
      body: data,
    }).then((response) => {
      if (response.ok) {
        response.text().then((resp) => {
          const json = JSON.parse(resp);
          navigate(json.redirectPath);
        });
      } else {
        console.error("response not ok");
      }
    });
  }

  return (
    <>
      <h1>Welcome to alcorel</h1>
      <h2 className="moto">
        It’s easy to grow Convert more, build lasting relationships, and grow
        your business resiliently, with the magic of contextual AI and
        thoughtful UI.
      </h2>
      <img src="https://5.imimg.com/data5/YC/SV/MY-2920520/crm-solution-services-500x500.jpg" />

      <form
        name="signup-form"
        onSubmit={signup}
        action="/api/signup"
        method="POST"
      >
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Please enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Please enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Sign up
        </button>
      </form>
    </>
  );
}
