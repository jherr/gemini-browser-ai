import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";

const code = `CREATE TABLE recipes (
  id INT PRIMARY KEY,
  name TEXT,
  ingredients TEXT,
  instructions TEXT
);`;

function App() {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState(
    "Rewrite this code so that it stores chat messages instead of recipes."
  );
  const [queryResult, setQueryResult] = useState("");
  const sessionRef = useRef(null);

  useEffect(() => {
    (async function () {
      console.log(await window.ai.canCreateTextSession());
      if (
        !sessionRef.current &&
        (await window.ai.canCreateTextSession()) !== "no"
      ) {
        try {
          sessionRef.current = await window.ai.createTextSession();
        } catch (e) {
          console.log(e.message);
        }
      }
    })();
  }, []);

  return (
    <main
      style={{
        display: "flex",
        gap: "1rem",
        margin: "1rem",
      }}
    >
      <div
        style={{
          width: "50%",
        }}
      >
        <h1>Code</h1>
        <Markdown>{"```\n" + code + "\n```"}</Markdown>
      </div>

      <div
        style={{
          width: "50%",
        }}
      >
        {history.length > 0 && (
          <div>
            {history.map((item, index) => (
              <div key={index}>
                <h3>Q: {item.question}</h3>
                <Markdown>{item.response}</Markdown>
              </div>
            ))}
          </div>
        )}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyUp={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              if (sessionRef.current) {
                setQuestion("");
                setQueryResult("Thinking...");
                try {
                  // const out = await sessionRef.current.prompt(question);
                  const prompt = `You are a coding assistant and this is the code you are working with:
${code}

Here is the request: ${question}`;
                  const stream = sessionRef.current.promptStreaming(prompt);
                  let response = "";
                  for await (const chunk of stream) {
                    setQueryResult(chunk);
                    response = chunk;
                  }
                  if (response) {
                    setQueryResult("");
                    setHistory([...history, { question, response }]);
                  }
                } catch (e) {
                  console.error(e.message);
                }
              }
            }
          }}
        ></input>
        <Markdown>{queryResult}</Markdown>
      </div>
    </main>
  );
}

export default App;
