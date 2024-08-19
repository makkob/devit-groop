import React, { useState } from 'react';

function App() {
  const [concurrency, setConcurrency] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);

  const handleStart = async () => {
    setIsRunning(true);
    setResults([]);
    const totalRequests = 1000;
    let activeRequests = 0;
    let completedRequests = 0;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const sendRequest = async (index) => {
      activeRequests++;
      try {
        const response = await fetch(`/api?index=${index}`);
        const data = await response.json();
        if (response.ok) {
          setResults((prevResults) => [...prevResults, `Response index: ${data.index}`]);
        } else if (response.status === 429) {
          console.log('Rate limit exceeded. Retrying...');
          await delay(1000); // Retry after a second
          await sendRequest(index);
        }
      } catch (error) {
        console.error(`Request ${index} failed`, error);
      } finally {
        activeRequests--;
        completedRequests++;
        if (completedRequests < totalRequests) {
          startNextRequest();
        }
      }
    };

    const startNextRequest = () => {
      if (activeRequests < concurrency && completedRequests + activeRequests < totalRequests) {
        sendRequest(completedRequests + activeRequests + 1);
      }
    };

    // Initial requests
    for (let i = 0; i < concurrency; i++) {
      startNextRequest();
    }

    // Throttle requests per second
    while (completedRequests < totalRequests) {
      await delay(1000 / concurrency);
    }

    setIsRunning(false);
  };

  return (
    <div>
      <input
        type="number"
        value={concurrency}
        onChange={(e) => setConcurrency(Number(e.target.value))}
        min="1"
        max="100"
        required
        disabled={isRunning}
      />
      <button onClick={handleStart} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Start'}
      </button>
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
