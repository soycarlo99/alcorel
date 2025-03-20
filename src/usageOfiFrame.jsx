import React, { useState, useRef, useEffect } from "react";

const HowToUseIframe = () => {
  const [copied, setCopied] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAutoFetched, setIsAutoFetched] = useState(false);
  const codeRef = useRef(null);
  const baseUrl = "http://localhost:5173";

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/company/current", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setCompanyId("YOUR_COMPANY_ID");
            setError(
              "No company session found. Please enter your company ID manually.",
            );
            setIsAutoFetched(false);
          } else {
            throw new Error("Failed to fetch company ID");
          }
        } else {
          const data = await response.json();
          setCompanyId(data.companyId.toString());
          setIsAutoFetched(true);
        }
      } catch (err) {
        console.error("Error fetching company ID:", err);
        setCompanyId("YOUR_COMPANY_ID");
        setError(
          "Could not retrieve your company ID. Please enter it manually.",
        );
        setIsAutoFetched(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  const generateIframeCode = () => {
    return `<iframe 
  src="${baseUrl}/company/${companyId}" 
  width="100%" 
  height="500px" 
  frameborder="0"
  title="Support Portal"
  style="border: none; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
></iframe>`;
  };

  const ShowcaseIframe = () => {
    return `<iframe 
  src="${baseUrl}/" 
  width="100%" 
  height="500px" 
  frameborder="0"
  title="Support Portal"
  style="border: none; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
></iframe>`;
  };

  const handleCopyCode = () => {
    const codeText = codeRef.current.textContent;
    navigator.clipboard
      .writeText(codeText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="how-to-use-container">
      <h1>How To Add Our Support Portal To Your Website</h1>

      <div className="instruction-section">
        <h2>1. Getting Started</h2>
        <p>
          Embedding our support portal on your website is easy! Simply use the
          iframe code provided below and replace{" "}
          <strong>YOUR_COMPANY_ID</strong> with your unique company identifier.
        </p>
      </div>

      <div className="instruction-section">
        <h2>2. Your Company ID</h2>
        {loading ? (
          <p>Loading your company ID...</p>
        ) : (
          <>
            <div className="company-id-input">
              <label htmlFor="companyId">Your Company ID:</label>
              <input
                type="text"
                id="companyId"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter your company ID"
                disabled={isAutoFetched}
                className={isAutoFetched ? "auto-fetched" : ""}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <p className="note">
              {error
                ? "You can find your Company ID in your account settings or in the welcome email."
                : "Your company ID has been automatically loaded from your active session."}
            </p>
          </>
        )}
      </div>

      <div className="instruction-section">
        <h2>3. Copy This Code</h2>
        <div className="code-container">
          <pre ref={codeRef}>{generateIframeCode()}</pre>
          <button
            className={`copy-button ${copied ? "copied" : ""}`}
            onClick={handleCopyCode}
            disabled={loading}
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      <div className="instruction-section">
        <h2>4. Add To Your Website</h2>
        <p>
          Paste the copied code into the HTML of your website where you want the
          support portal to appear. The iframe will automatically adjust to the
          width of its container, and you can modify the height as needed.
        </p>
      </div>

      <div className="instruction-section">
        <h2>5. Preview</h2>
        <p>Here's how the support portal will look on your website:</p>
        <div className="preview-container">
          {loading ? (
            <p>Loading preview...</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: ShowcaseIframe() }} />
          )}
        </div>
      </div>

      <div className="instruction-section">
        <h2>6. Customization Options</h2>
        <p>
          You can customize the appearance of the iframe by modifying these
          parameters:
        </p>
        <ul>
          <li>
            <strong>width</strong>: Set the width (default: 100%)
          </li>
          <li>
            <strong>height</strong>: Set the height (default: 500px)
          </li>
          <li>
            <strong>style</strong>: Customize borders, shadows, etc.
          </li>
        </ul>
      </div>

      <div className="instruction-section">
        <h2>Need Help?</h2>
        <p>
          If you encounter any issues or have questions about implementing the
          support portal on your website, please contact our support team at{" "}
          <a href="mailto:support@alcorel.com">support@alcorel.com</a>.
        </p>
      </div>

      <style jsx>{`
        .how-to-use-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        h1 {
          color: #2c3e50;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 10px;
        }

        .instruction-section {
          margin-bottom: 30px;
        }

        h2 {
          color: #2980b9;
          margin-bottom: 15px;
        }

        .company-id-input {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .company-id-input label {
          margin-right: 10px;
          font-weight: bold;
        }

        .company-id-input input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex-grow: 1;
          max-width: 300px;
        }

        .company-id-input input.auto-fetched {
          background-color: #f9f9f9;
          border-color: #ccc;
          color: #555;
        }

        .code-container {
          position: relative;
          margin: 15px 0;
        }

        pre {
          background-color: #f8f9fa;
          border: 1px solid #eaeaea;
          border-radius: 4px;
          padding: 15px;
          overflow-x: auto;
          white-space: pre-wrap;
          font-family: monospace;
        }

        .copy-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .copy-button:hover {
          background-color: #2980b9;
        }

        .copy-button.copied {
          background-color: #27ae60;
        }

        .copy-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }

        .preview-container {
          border: 1px dashed #ddd;
          padding: 10px;
          border-radius: 4px;
        }

        .note {
          font-style: italic;
          color: #7f8c8d;
          font-size: 0.9em;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.9em;
          margin-top: 5px;
        }

        ul {
          padding-left: 20px;
        }

        li {
          margin-bottom: 5px;
        }

        a {
          color: #3498db;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default HowToUseIframe;
