import { useEffect, useState } from "react";
import { useTicket } from "./TicketContext";
// import ReactMarkdown from "react-markdown";
import "./style.css";

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { ticketData, triggerRefresh } = useTicket();

  useEffect(() => {
    if (ticketData && !message) {
      const previousMessages = ticketData.messages
        ?.map((msg) => msg.message)
        .join(", ");

      const greeting = `You are a customer service assistant for Alcorel directly responding to a customer.
DO NOT include phrases like "Here's a potential response:" or any similar meta-commentary.
DO NOT use markdown symbols. Use plain text with proper punctuation.
Write directly to the customer in a professional, helpful tone.

IMPORTANT: Always sign your messages at the end with "- AlgoRel" on a new line.

Greet ${ticketData.userName} and offer help with their ${ticketData.categoryName} ticket.
The customer has already sent these messages: "${previousMessages}"

Respond directly as if speaking to the customer in a concise, professional way.
Remember to sign your message as "- AlgoRel" at the end.`;

      //messages(greeting, true);
      console.log(ticketData.messages);
      //openForm();

      if (ticketData.messages && ticketData.messages.length === 1) {
        autoSendFullmessage(greeting);
      }
    }
  }, [ticketData, message]);

  async function autoSendFullmessage(prompt) {
    try {
      setIsLoading(true);

      const fullMessage = await messages(prompt, false);

      await fetch(`/api/${ticketData.ticketId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fullMessage }),
      });

      console.log("Auto-sent message successfully");
      triggerRefresh();
    } catch (error) {
      console.error("Error in autoSendFullmessage:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function messages(prompt, streamEnabled = true) {
    if (!prompt.trim()) return;
    setIsLoading(true);

    let enhancedPrompt = prompt;

    if (ticketData) {
      const previousMessages = ticketData.messages
        ?.map(
          (msg) =>
            `- ${new Date(msg.timestamp).toLocaleString()}: ${msg.message}`,
        )
        .join("\n");

      enhancedPrompt = `
You are a helpful customer service assistant for Alcorel directly responding to a customer. 
Write your response as if you're speaking directly to the customer.

IMPORTANT FORMATTING RULES:
- Do NOT include phrases like "Here's a potential response:" or any other meta-commentary
- Do NOT use markdown symbols
- Use plain text with proper punctuation
- Write in a professional, helpful tone with a touch of personality
- Be concise and direct
- ALWAYS sign your messages at the end with "- AlgoRel" on a new line

TICKET INFORMATION:
- Ticket #${ticketData.ticketId}: ${ticketData.categoryName}
- Customer: ${ticketData.userName}
- Status: ${ticketData.status}

PREVIOUS MESSAGES:
${previousMessages}

CURRENT QUERY OR TASK:
${prompt}

Respond directly to ${ticketData.userName} about their issue.
Remember to sign your message with "- AlgoRel" at the end.`;
    }

    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1:latest",
          stream: streamEnabled,
          prompt: enhancedPrompt,
        }),
      });

      let fullMessage = "";

      if (streamEnabled) {
        const reader = response.body.getReader();
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

        if (fullMessage) {
          triggerRefresh();
        }
      } else {
        const data = await response.json();
        fullMessage = data.response;
        setMessage(fullMessage);
      }

      return fullMessage;
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error occurred while generating response");
      return null;
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  }

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
