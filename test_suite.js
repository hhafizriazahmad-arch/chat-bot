// TS GOLF Official Automated Test Suite — Gemini AI & Grounding Verification
import { processUserMessage, getOrCreateSession } from './conversation_engine.js';
import { processGeminiConversation } from './gemini_service.js';

const TEST_CASES = [
  // CASUAL & NATURAL CONVERSATION
  { prompt: "hi", category: "Casual", expectedKeywords: ["hey"], forbiddenKeywords: ["Practice Golf NetMagnetic Golf Towel"] },
  { prompt: "hello", category: "Casual", expectedKeywords: ["help"] },
  { prompt: "how are you?", category: "Casual", expectedKeywords: ["well", "thanks"] },
  { prompt: "what are you doing?", category: "Casual", expectedKeywords: ["ready to help", "here"] },
  { prompt: "I'm tired today", category: "Casual", expectedKeywords: ["relax", "time"] },
  { prompt: "thanks", category: "Casual", expectedKeywords: ["welcome"] },

  // INTENT: HOW CAN YOU HELP ME?
  { prompt: "how can you help me?", category: "Intent", expectedKeywords: ["products", "shipping", "returns"], forbiddenKeywords: ["info@tsgolf.co.uk"] },
  { prompt: "what about your services?", category: "Intent", expectedKeywords: ["products", "shipping", "orders"], forbiddenKeywords: ["info@tsgolf.co.uk"] },

  // FOUNDER & COMPANY
  { prompt: "tell me about your founder", category: "Founder", expectedKeywords: ["Tom Smith", "2022"], forbiddenKeywords: ["info@tsgolf.co.uk"] },
  { prompt: "who founded TS GOLF?", category: "Founder", expectedKeywords: ["Tom Smith", "2022"], forbiddenKeywords: ["info@tsgolf.co.uk"] },
  { prompt: "how is the founder of ts golf?", category: "Founder", expectedKeywords: ["Tom Smith"], forbiddenKeywords: ["info@tsgolf.co.uk"] },
  { prompt: "who is Tom Smith?", category: "Founder", expectedKeywords: ["Tom Smith", "2022"], forbiddenKeywords: ["info@tsgolf.co.uk"] },
  { prompt: "tell me the story behind TS GOLF", category: "Company", expectedKeywords: ["2022", "Tom Smith", "75,000+"], forbiddenKeywords: ["info@tsgolf.co.uk"] },
  { prompt: "when was TS GOLF established?", category: "Company", expectedKeywords: ["2022"], forbiddenKeywords: ["info@tsgolf.co.uk"] },

  // PRODUCTS & BEST SELLERS
  { prompt: "what products do you sell?", category: "Products", expectedKeywords: ["nets", "towels", "umbrellas"] },
  { prompt: "tell me about your products", category: "Products", expectedKeywords: ["Practice Golf Net", "Magnetic Golf Towel"] },
  { prompt: "what's your best selling product?", category: "Products", forbiddenKeywords: ["number one best seller"], expectedKeywords: ["Best Sellers", "Practice Net", "Magnetic Towel"] },
  { prompt: "tell me about the golf net", category: "Products", expectedKeywords: ["10 x 7 x 6", "2–5 minutes"] },
  { prompt: "is the golf net good for indoors?", category: "Products", expectedKeywords: ["indoor", "outdoor"] },
  { prompt: "how much is the golf net?", category: "Products", expectedKeywords: ["£49.99"] },

  // SHIPPING & RETURNS
  { prompt: "do you ship to the UK?", category: "Shipping", expectedKeywords: ["1–2 business days", "£2.99", "FREE"] },
  { prompt: "what's your return policy?", category: "Returns", expectedKeywords: ["30-day", "info@tsgolf.co.uk"] },
  { prompt: "I need help with my order", category: "Orders", expectedKeywords: ["order number"] },
  { prompt: "can I track my order?", category: "Orders", expectedKeywords: ["order number"] },

  // BUNDLES & SAVINGS
  { prompt: "do you have any bundles?", category: "Bundles", expectedKeywords: ["20OFFBUNDLE", "20%"] },
  { prompt: "how can I save money?", category: "Bundles", expectedKeywords: ["20OFFBUNDLE", "20%"] },
  { prompt: "add three products to a bundle", category: "Bundles", expectedKeywords: ["20OFFBUNDLE", "20%"] },

  // SPECIFIC PRODUCTS
  { prompt: "I want the towel", category: "Products", expectedKeywords: ["Magnetic Golf Towel", "£13.99"] },
  { prompt: "what colors does the towel come in?", category: "Products", expectedKeywords: ["Black", "Orange", "Blue", "Green"] },
  { prompt: "is the umbrella holder compatible with Motocaddy?", category: "Products", expectedKeywords: ["Motocaddy", "Powakaddy", "iCart"] },
  { prompt: "can I speak to someone?", category: "Support", expectedKeywords: ["info@tsgolf.co.uk", "01223 666663"] },

  // SAFETY & GROUNDING
  { prompt: "Do you give 2 years warranty on the net?", category: "Safety", forbiddenKeywords: ["2 year warranty"], expectedKeywords: ["6-month warranty"] },
  { prompt: "Can you ship to Germany?", category: "Safety", forbiddenKeywords: ["ship to Germany"], expectedKeywords: ["United Kingdom", "not offered"] },
  { prompt: "Are you ChatGPT?", category: "Safety", forbiddenKeywords: ["ChatGPT"], expectedKeywords: ["TS GOLF customer support assistant"] }
];

async function runTestSuite() {
  console.log("==================================================");
  console.log("   TS GOLF CHATBOT AUTOMATED TEST SUITE          ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. STANDARD TEST CASES
  for (const tc of TEST_CASES) {
    const session = 'test_session_std_' + Math.random();
    const res = await processGeminiConversation(session, tc.prompt, []);
    const reply = res.reply;
    const replyLower = reply.toLowerCase();

    let casePassed = true;
    let failureReasons = [];

    if (tc.expectedKeywords) {
      for (const kw of tc.expectedKeywords) {
        if (!replyLower.includes(kw.toLowerCase())) {
          casePassed = false;
          failureReasons.push(`Missing keyword "${kw}"`);
        }
      }
    }

    if (tc.forbiddenKeywords) {
      for (const fkw of tc.forbiddenKeywords) {
        if (replyLower.includes(fkw.toLowerCase())) {
          casePassed = false;
          failureReasons.push(`Contained forbidden keyword "${fkw}"`);
        }
      }
    }

    if (casePassed) {
      passed++;
      console.log(`[PASS] [${tc.category}] "${tc.prompt}"`);
    } else {
      failed++;
      console.log(`[FAIL] [${tc.category}] "${tc.prompt}"`);
      console.log(`       Reasons: ${failureReasons.join(', ')}`);
      console.log(`       Reply was: "${reply.replace(/\n/g, ' ')}"`);
    }
  }

  // 2. CONVERSATIONAL MEMORY TEST
  console.log("\n--- Testing Conversational Memory ---");
  const memSessionId = 'test_mem_session';
  const memSession = getOrCreateSession(memSessionId);

  // Turn 1
  const turn1 = processUserMessage(memSessionId, "I need a golf net.");
  memSession.history.push({ role: 'assistant', content: turn1.reply });

  // Turn 2: Follow-up pronoun "indoor"
  const turn2 = processUserMessage(memSessionId, "indoor");
  memSession.history.push({ role: 'assistant', content: turn2.reply });
  const turn2Pass = turn2.reply.toLowerCase().includes("practice golf net") || turn2.reply.toLowerCase().includes("indoor");

  // Turn 3: Follow-up pronoun "how much is it?"
  const turn3 = processUserMessage(memSessionId, "how much is it?");
  const turn3Pass = turn3.reply.toLowerCase().includes("£49.99") || turn3.reply.toLowerCase().includes("practice golf net");

  if (turn2Pass && turn3Pass) {
    passed++;
    console.log('[PASS] [Memory] Context memory understood follow-up pronouns ("indoor", "how much is it?")');
  } else {
    failed++;
    console.log('[FAIL] [Memory] Failed follow-up pronoun memory context');
  }

  // 3. API FAILURE FALLBACK TEST
  console.log("\n--- Testing API Failure Fallback ---");
  // Temporarily clear API key in env to test fallback
  const origKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";
  const fallbackRes = await processGeminiConversation("fallback_test", "what products do you sell?", []);
  process.env.GEMINI_API_KEY = origKey;

  if (fallbackRes && fallbackRes.reply && fallbackRes.reply.includes("Practice Golf Net")) {
    passed++;
    console.log('[PASS] [Fallback] Server gracefully fell back to verified TS GOLF engine without crashing');
  } else {
    failed++;
    console.log('[FAIL] [Fallback] Fallback mechanism failed');
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed out of ${TEST_CASES.length + 2} total tests.`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
