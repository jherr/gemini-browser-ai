import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { recipe } from "./recipe";

function App() {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [queryResult, setQueryResult] = useState("");
  const sessionRef = useRef(null);

  useEffect(() => {
    (async function () {
      const available = await window.ai.canCreateTextSession();
      if (available !== "no" && !sessionRef.current) {
        sessionRef.current = await window.ai.createTextSession();
      }
    })();
  }, []);

  async function runQuery(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (sessionRef.current) {
        setQuestion("");
        const prompt = `You are an open minded friendly gourmet chef who provides
brief answers questions about recipes and is always willing to help.
Here is the recipe you are working with:
${recipe}

You will be asked a series of questions by a curious home cook.
Limit your responses to 1-2 sentences with just the response only.

Previous questions and responses:
${history
  .map((item) => `[Question]${item.question}\n[Response]${item.response}`)
  .join("\n")}

Here is the question: ${question}`;
        const stream = await sessionRef.current.promptStreaming(prompt);
        let response = "";
        for await (const chunk of stream) {
          setQueryResult(chunk);
          response = chunk;
        }
        if (response) {
          setQueryResult("");
          setHistory([...history, { question, response }]);
        }
      }
    }
  }

  return (
    <main>
      <div>
        <h1>Recipe</h1>
        <Markdown>{recipe}</Markdown>
      </div>
      <div>
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
          onKeyUp={runQuery}
        />
        <Markdown>{queryResult}</Markdown>
      </div>
    </main>
  );
}

export default App;
