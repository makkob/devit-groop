const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

let requestCount = 0; // кількість запитів за останню секунду
let lastResetTime = Date.now(); // час останнього скидання лічильника

// Оновлює лічильник запитів, якщо пройшла 1 секунда після останнього скидання.
function resetRequestCount() {
    const now = Date.now();
    if (now - lastResetTime >= 1000) { 
        requestCount = 0;
        lastResetTime = now;
    }
}

app.get('/api', (req, res) => {
    resetRequestCount();
    if (requestCount >= 50) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    requestCount++;

    const requestIndex = parseInt(req.query.index);
    const randomDelay = Math.floor(Math.random() * 1000) + 1;

    setTimeout(() => {
        res.json({ index: requestIndex });
    }, randomDelay);
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
