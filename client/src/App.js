import React, { useState } from 'react';
import { Button, TextField, List, ListItem, Container, Typography } from '@mui/material';

function App() {
  const [concurrency, setConcurrency] = useState(10); //максимальну кількість активних запитів
  const [isRunning, setIsRunning] = useState(false); // чи йдуть запити
  const [results, setResults] = useState([]); // список результатів

  const handleStart = async () => {
    setIsRunning(true);
    setResults([]);
    const totalRequests = 1000; // к-ть запитів які треба виконати
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

    for (let i = 0; i < concurrency; i++) {
      startNextRequest();
    }

    while (completedRequests < totalRequests) {
      await delay(1000 / concurrency);
    }

    setIsRunning(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Concurrency Request Tester
      </Typography>
      <TextField
        type="number"
        label="Concurrency (1-100)"
        value={concurrency}
        onChange={(e) => setConcurrency(Number(e.target.value))}
        fullWidth
        margin="normal"
        disabled={isRunning}
        inputProps={{ min: 1, max: 100 }}
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleStart} 
        disabled={isRunning}
        fullWidth
        sx={{ mb: 2 }}
      >
        {isRunning ? 'Running...' : 'Start'}
      </Button>
      <List>
        {results.map((result, index) => (
          <ListItem key={index}>
            {result}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default App;
