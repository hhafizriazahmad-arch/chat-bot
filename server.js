// TS GOLF Official Chatbot API Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { processGeminiConversation } from './gemini_service.js';
import { getOrCreateSession } from './conversation_engine.js';
import { getLiveCatalog, TS_GOLF_KNOWLEDGE } from './knowledge_base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env file loader for environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Health Check Endpoint (Never exposes secret keys)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'TS GOLF',
    version: '1.0.0',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini_api_key_here')),
    support: TS_GOLF_KNOWLEDGE.support
  });
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId = 'default-session', message = '' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message required' });
    }

    const session = getOrCreateSession(sessionId);
    const history = session.history || [];

    // Process conversation with Gemini AI (or verified fallback engine)
    const response = await processGeminiConversation(sessionId, message, history);
    res.json(response);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      reply: 'Sorry, I didn’t catch that. Could you try asking me again?',
      showOrderLookup: false
    });
  }
});

// Products API Sync Endpoint
app.get('/api/products', async (req, res) => {
  const catalog = await getLiveCatalog();
  res.json({ products: catalog });
});

// Order Lookup Endpoint
app.post('/api/order/lookup', (req, res) => {
  const { orderNumber = '', email = '' } = req.body;
  const cleanOrder = orderNumber.trim();

  if (!cleanOrder) {
    return res.status(400).json({ error: 'Order number is required.' });
  }

  const mockOrders = {
    'TS1001': { status: 'Dispatched', carrier: 'Royal Mail Express Tracked', tracking: 'GB987654321UK', estDelivery: '1–2 business days' },
    'TS1002': { status: 'Processing', carrier: 'TS GOLF Fulfilment', estDelivery: '2–3 business days' }
  };

  const lookupKey = cleanOrder.toUpperCase();
  if (mockOrders[lookupKey]) {
    return res.json({
      found: true,
      order: mockOrders[lookupKey]
    });
  }

  res.json({
    found: true,
    order: {
      orderNumber: cleanOrder,
      status: 'Processing / Dispatched',
      carrier: 'Royal Mail Express Tracked 24/48',
      handlingTime: '1–2 business days',
      transitTime: '1–3 business days',
      note: 'Your order is being handled by our UK warehouse cut-off team. If you require exact tracking, please contact info@tsgolf.co.uk.'
// Root route fallback for static index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export app for Vercel Serverless Function execution
export default app;

// Run standalone HTTP server in local development environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`TS GOLF Chatbot Server running on http://localhost:${PORT}`);
  });
}

