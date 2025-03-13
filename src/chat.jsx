import { useEffect, useState } from "react";
// import ReactMarkdown from "react-markdown";
import "./style.css";

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  const messages = async (prompt, streamEnabled = true) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1:latest",
          stream: streamEnabled,
          prompt: "answer this in 75 words: " + prompt,
        }),
      });
      if (streamEnabled) {
        const reader = response.body.getReader();
        let fullMessage = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            const json = JSON.parse(line);
            fullMessage += json.response;
            setMessage(fullMessage);
          }
        }
      } else {
        const data = await response.json();
        setMessage(data.response);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error occurred while generating response");
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  useEffect(() => {
    openForm();
  }, []);

  const handlePrompt = (event) => {
    setPrompt(event.target.value);
  };

  function openForm() {
    document.getElementById("myForm").style.display = "block";
  }

  function closeForm() {
    document.getElementById("myForm").style.display = "none";
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    messages(prompt, true);
  };

  return (
    <>
      <button className="open-button" onClick={openForm}>
        Chat with AI
      </button>
      <div className="form-popup" id="myForm">
        <form className="form-container" onSubmit={handleSubmit}>
          <h1>Chat with AI assistance</h1>
          <button type="button" className="btn cancel" onClick={closeForm}>
            X
          </button>
          <label htmlFor="msg">
            <b>Message</b>
          </label>
          <textarea
            id="msg"
            name="msg"
            placeholder="Type your question here..."
            value={prompt}
            onChange={handlePrompt}
          ></textarea>
          {message && (
            <div className="chatWidgetText">
              <p>{message}</p>
            </div>
          )}
          <button
            className="btn"
            type="submit"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>
    </>
  );
}
