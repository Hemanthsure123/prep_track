import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
    });

    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

const START_PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_RETRIES = 10;

function startServer(port, retriesLeft = MAX_RETRIES) {
  try {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        server.close();
        if (retriesLeft > 0) {
          const nextPort = port + 1;
          console.warn(`Port ${port} in use — trying ${nextPort} (${retriesLeft} retries left)`);
          setTimeout(() => startServer(nextPort, retriesLeft - 1), 100);
          return;
        }
        console.error(`Port ${port} is already in use and no retries remain. Set a different PORT in your .env or stop the other process.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      if (retriesLeft > 0) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use (exception) — trying ${nextPort} (${retriesLeft} retries left)`);
        setTimeout(() => startServer(nextPort, retriesLeft - 1), 100);
        return;
      }
      console.error(`Port ${port} is already in use and no retries remain. Set a different PORT in your .env or stop the other process.`);
      process.exit(1);
    }
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

startServer(START_PORT);
