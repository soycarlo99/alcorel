import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function login(event) {
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
        response.text().then(resp => {
          const json = JSON.parse(resp)  //fix
          navigate(json.redirectPath)
        })
        // response.text().then((location) => {
        //   navigate(location.slice(1, -1));
        // });
      } else {
        console.error("response not ok");
      }
    });
  }

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <div className="error-message">{error}</div>}

      <form
        name="login-form"
        onSubmit={login}
        action="/api/login"
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
          Login
        </button>
      </form>
    </div>
  );
}
