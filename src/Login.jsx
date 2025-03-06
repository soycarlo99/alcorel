import { BrowserRouter, Routes, Route, useNavigate } from "react-router";

export default function LoginPage() {
  let navigate = useNavigate();

  function login(event) {
    event.preventDefault();
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
    <main>
      <form
        name="login-form"
        onSubmit={login}
        action="/api/login"
        method="POST"
      >
        <input
          type="email"
          name="email"
          placeholder="Please enter your email"
        ></input>
        <input
          type="password"
          name="password"
          placeholder="Please enter your password"
        ></input>
        <input type="submit" value="Login"></input>
      </form>
    </main>
  );
}
