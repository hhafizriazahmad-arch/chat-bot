// TS GOLF Intelligent Conversation Engine — Simple & Direct Answers
import { TS_GOLF_KNOWLEDGE } from './knowledge_base.js';
import { validateResponse } from './response_validator.js';

// Session memory store
const sessionStore = new Map();

export function getOrCreateSession(sessionId) {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      sessionId,
      history: [],
      context: {
        lastProduct: null,
        environment: null,
        orderState: null,
        userEmail: null
      }
    });
  }
  return sessionStore.get(sessionId);
}

export function processUserMessage(sessionId, message) {
  const session = getOrCreateSession(sessionId);
  const rawMsg = message.trim();
  const lowerMsg = rawMsg.toLowerCase();

  // Save user message to memory
  session.history.push({ role: 'user', content: rawMsg });

  let replyText = "";
  let showOrderLookup = false;

  // 1. CASUAL GREETINGS & SMALL TALK
  if (lowerMsg.includes("what are you doing") || lowerMsg.includes("what r u doing")) {
    replyText = "Just here and ready to help. What do you need?";
  }
  else if (lowerMsg.includes("tired")) {
    replyText = "Yeah, one of those days 😄 Hope you get some time to relax.";
  }
  else if (/^(hi|hello|hey|hiya|greetings|morning|afternoon|evening)(\s|$|!|\.)/i.test(lowerMsg) && lowerMsg.split(' ').length <= 3) {
    replyText = "Hey! How can I help you today?";
  } 
  else if (lowerMsg.includes("how are you") || lowerMsg.includes("how's it going") || lowerMsg.includes("how do you do")) {
    replyText = "Doing well, thanks! What can I help you with?";
  }
  else if (lowerMsg === "thanks" || lowerMsg === "thank you" || lowerMsg.includes("that's helpful") || lowerMsg === "cool" || lowerMsg === "awesome" || lowerMsg === "great") {
    replyText = "You're welcome!";
  }
  else if (lowerMsg.includes("are you an ai") || lowerMsg.includes("are you real") || lowerMsg.includes("are you a bot") || lowerMsg.includes("chatgpt") || lowerMsg.includes("openai") || lowerMsg.includes("gemini")) {
    replyText = "I'm the TS GOLF customer support assistant, here to help you with product advice, specifications, shipping, orders, and training drills!";
  }

  // 2. INTENT: HOW CAN YOU HELP / SERVICES
  else if (lowerMsg.includes("how can you help") || lowerMsg.includes("what can you do") || lowerMsg.includes("what do you offer") || lowerMsg.includes("your services") || lowerMsg.includes("what can you help")) {
    replyText = "I can help you find the right TS GOLF products, answer product questions, and help with shipping, returns and orders.";
  }

  // 3. BEST SELLERS
  else if (lowerMsg.includes("best selling") || lowerMsg.includes("best seller") || lowerMsg.includes("top seller") || lowerMsg.includes("most popular")) {
    replyText = "I don't want to guess which product is currently #1, but our Best Sellers section includes the Practice Net, Magnetic Towel and Umbrella Holder.";
  }

  // 4. PRODUCT CATALOG / WHAT PRODUCTS DO YOU SELL
  else if (lowerMsg.includes("what products do you sell") || lowerMsg.includes("what do you sell") || lowerMsg.includes("what products") || lowerMsg.includes("about your products") || lowerMsg.includes("your products") || lowerMsg.includes("catalog") || lowerMsg.includes("show me products")) {
    replyText = "We sell practice nets and golf towels, including our flagship Practice Golf Net, Magnetic Golf Towel, Umbrellas, and Trolley Accessories.";
  }

  // 5. PRODUCT: MAGNETIC GOLF TOWEL
  else if (lowerMsg.includes("towel") || lowerMsg.includes("magnetic golf towel") || (session.context.lastProduct === "towel" && (lowerMsg.includes("color") || lowerMsg.includes("colour") || lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("how much") || lowerMsg.includes("it")))) {
    session.context.lastProduct = "towel";
    if (lowerMsg.includes("color") || lowerMsg.includes("colour")) {
      replyText = "The **Magnetic Golf Towel** is available in Black (In Stock), Orange (In Stock), Blue (In Stock), Green (In Stock), and Grey (Out of Stock).";
    } else {
      replyText = "The **Magnetic Golf Towel Quick Dry and Water Absorption** is currently on sale for **£13.99** (regularly £19.99).\n\n• Strong magnet attaches to clubs, carts, bags, or metal surfaces\n• Quick drying, super absorbent, and machine washable\n• Available Colours: Black (In Stock), Orange (In Stock), Blue (In Stock), Green (In Stock), Grey (Out of Stock)\n• 5,000 round guarantee with flight-grade technology\n\nLink: https://tsgolf.co.uk/products/magnetic-golf-towel-quick-dry-and-water-absorption";
    }
  }

  // 6. PRODUCT: PRACTICE GOLF NET & PRONOUN CONTEXT
  else if (lowerMsg.includes("net") || (session.context.lastProduct === "net" && (lowerMsg.includes("outside") || lowerMsg.includes("outdoors") || lowerMsg.includes("indoor") || lowerMsg.includes("indoors") || lowerMsg.includes("setup") || lowerMsg.includes("set up") || lowerMsg.includes("comes with") || lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("how much") || lowerMsg.includes("it") || lowerMsg.includes("this") || lowerMsg.includes("that")))) {
    session.context.lastProduct = "net";

    if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("how much")) {
      replyText = "The **Practice Golf Net Outdoor/ Indoor** is currently on sale from **£49.99** (regularly £79.99).\n\n• **Net Only:** £49.99\n• **Net Bundle:** £79.99\n• **Net Bundle + Chipping Net:** £99.99\n\nLink: https://tsgolf.co.uk/products/practice-golf-net-outdoor-indoor";
    } else if (lowerMsg.includes("indoor") || lowerMsg.includes("indoors") || lowerMsg.includes("outside") || lowerMsg.includes("outdoors") || lowerMsg.includes("garden")) {
      replyText = "Yep — the **Practice Golf Net Outdoor/ Indoor** is designed for both indoor and outdoor garden practice! It measures 10 x 7 x 6 Ft and setup takes just 2–5 minutes with durable 170g nylon mesh and fibreglass rods.\n\nLink: https://tsgolf.co.uk/products/practice-golf-net-outdoor-indoor";
    } else if (lowerMsg.includes("setup") || lowerMsg.includes("set up") || lowerMsg.includes("assemble")) {
      replyText = "The Practice Golf Net setup takes approximately **2–5 minutes**. It features durable 170g nylon mesh, target pockets, and fibreglass rods for effortless assembly.\n\nLink: https://tsgolf.co.uk/products/practice-golf-net-outdoor-indoor";
    } else if (lowerMsg.includes("package") || lowerMsg.includes("version") || lowerMsg.includes("option") || lowerMsg.includes("bundle") || lowerMsg.includes("comes with")) {
      replyText = "The **Practice Golf Net Outdoor/ Indoor** includes 1 large target sheet and 3 chipping pockets.\n\nPackages available:\n• **Net Only (£49.99, reg £79.99):** Golf net & carry bag\n• **Net Bundle (£79.99, reg £119.99):** Golf net, golf mat, balls, tees, & carry bag\n• **Net Bundle with Chipping Net (£99.99, reg £139.99):** Golf net, golf mat, balls, tees, chipping net, & carry bag\n\nLink: https://tsgolf.co.uk/products/practice-golf-net-outdoor-indoor";
    } else {
      replyText = "The **Practice Golf Net Outdoor/ Indoor** is our practice golf net (10 x 7 x 6 Ft) with a 2–5 minutes setup.\n\nKey details:\n• Large central target + 3 chipping target pockets\n• Fast 2–5 minutes setup\n• Carry bag included\n• Indoor & Outdoor garden friendly\n• High-impact 170g nylon & fibreglass frame\n• 6-month warranty with free replacement parts\n\nLink: https://tsgolf.co.uk/products/practice-golf-net-outdoor-indoor";
    }
  }

  // 7. GENERAL SETUP / ASSEMBLY INQUIRIES
  else if (lowerMsg.includes("assembly") || lowerMsg.includes("assemble") || lowerMsg.includes("setup") || lowerMsg.includes("set up") || lowerMsg.includes("put together")) {
    replyText = "The **Practice Golf Net Outdoor/ Indoor** is super straightforward to assemble with a **2–5 minutes setup**.\n\n**Included in the box:**\n• TS Golf Premium Practice Net\n• Reinforced Fibreglass Frame Poles\n• Target sheet with chipping pockets\n• Compact Travel Carry Bag\n• Mat, balls, & tees (if you choose a bundle)\n\nYou can find visual instructions at: https://tsgolf.co.uk/pages/instructions-for-assembling-ts-golf-net";
  }

  // 8. DRILLS & HUB
  else if (lowerMsg.includes("drill") || lowerMsg.includes("slice") || lowerMsg.includes("hook") || lowerMsg.includes("power") || lowerMsg.includes("driving") || lowerMsg.includes("iron accuracy")) {
    if (lowerMsg.includes("slice")) {
      replyText = "TS GOLF offers a dedicated 'Fix a Slice' drill designed to help reduce side-spin, straighten ball flight, and improve face control during home practice.\n\nTraining Hub: https://tsgolf.co.uk/pages/drills";
    } else if (lowerMsg.includes("hook")) {
      replyText = "We have a 'Fix a Hook' drill to help correct in-to-out swing paths and face closure. Check out our Training Hub at https://tsgolf.co.uk/pages/drills";
    } else if (lowerMsg.includes("iron")) {
      replyText = "Our 'Iron Accuracy' drill is designed to dial in start line, contact, and distance control. Visit our Training Hub at https://tsgolf.co.uk/pages/drills";
    } else {
      replyText = "TS GOLF has a full range of home practice drills, including:\n• Driving and Power\n• Iron Accuracy\n• Wedges and Distance Control\n• Fix a Slice & Fix a Hook\n• Ball Striking\n\nTraining Hub: https://tsgolf.co.uk/pages/drills";
    }
  }

  // 9. ORDER TRACKING & LOOKUP FLOW
  else if (lowerMsg.includes("where is my order") || lowerMsg.includes("track my order") || lowerMsg.includes("order status") || lowerMsg.includes("track order") || lowerMsg.includes("help with my order") || lowerMsg.includes("my order")) {
    replyText = "I can help with that! Please enter your order number below to check the current shipping status.";
    showOrderLookup = true;
  }

  // 10. SHIPPING, DELIVERY & TRACKING INQUIRIES
  else if (lowerMsg.includes("shipping") || lowerMsg.includes("delivery") || lowerMsg.includes("postage") || lowerMsg.includes("ship") || lowerMsg.includes("tracking") || lowerMsg.includes("track")) {
    if (lowerMsg.includes("international") || lowerMsg.includes("worldwide") || lowerMsg.includes("usa") || lowerMsg.includes("europe") || lowerMsg.includes("germany")) {
      replyText = "TS GOLF currently delivers within the **United Kingdom**. Worldwide shipping is not offered at this time.";
    } else if (lowerMsg.includes("tracking") || lowerMsg.includes("track")) {
      replyText = "Tracking is provided for all UK orders as soon as they dispatch. Handling takes 1–2 business days, followed by 1–3 business days transit.";
    } else {
      replyText = "Here are the details for **TS GOLF UK Shipping**:\n\n• **Handling Time:** 1–2 business days (Mon–Fri, 4 PM cut-off)\n• **Transit Time:** 1–3 business days\n• **Express UK Shipping (£0.01 – £199.99):** £2.99\n• **Orders £200.00+:** FREE Express Shipping\n\nTracking is provided for all orders as soon as they dispatch.";
    }
  }

  // 11. RETURN & REFUND POLICY
  else if (lowerMsg.includes("return") || lowerMsg.includes("refund") || lowerMsg.includes("money back") || lowerMsg.includes("exchange")) {
    replyText = "We offer a **30-day return policy** from the date of purchase. Items must be unused and in their original packaging.\n\nTo initiate a return or exchange, simply email our UK customer support team at **info@tsgolf.co.uk** with your order number.";
  }

  // 12. COMPANY, FOUNDER, ABOUT & STORY
  else if (lowerMsg.includes("founder") || lowerMsg.includes("tom smith") || lowerMsg.includes("who founded") || lowerMsg.includes("who started") || lowerMsg.includes("who created") || lowerMsg.includes("who is behind") || lowerMsg.includes("tom's story") || lowerMsg.includes("about tom") || lowerMsg.includes("who is tom") || lowerMsg.includes("our story") || lowerMsg.includes("story") || lowerMsg.includes("history") || lowerMsg.includes("about ts golf") || lowerMsg.includes("established") || lowerMsg.includes("where is ts golf") || lowerMsg.includes("what is ts golf") || lowerMsg.includes("tree") || lowerMsg.includes("earthly") || lowerMsg.includes("eco")) {
    if (lowerMsg.includes("tree") || lowerMsg.includes("earthly") || lowerMsg.includes("eco") || lowerMsg.includes("kenya") || lowerMsg.includes("planting")) {
      replyText = "Since June 2025, TS GOLF has partnered with Earthly to plant mangroves in Kenya. For 1 order placed on the website, 1 tree is planted!\n\nMangroves play a critical role in coastal water quality, marine life habitats, storm protection, and carbon storage. We also reinvest 3% of monthly profits into eco-friendly operational improvements.";
    } else if (lowerMsg.includes("based") || lowerMsg.includes("location") || lowerMsg.includes("where is ts golf")) {
      replyText = "TS GOLF is rooted in the **United Kingdom**, with headquarters at 1 View Farm Close, Dry Drayton, Cambridge CB23 8BP, UK.";
    } else if (lowerMsg.includes("how is the founder") || lowerMsg.includes("how's the founder")) {
      replyText = "Tom Smith is the founder of TS GOLF. If you're asking how he's doing, TS GOLF is thriving and serving over 68,000+ happy UK golfers!";
    } else if (lowerMsg.includes("who founded") || lowerMsg.includes("who started") || lowerMsg.includes("who created") || lowerMsg.includes("who is behind") || lowerMsg.includes("who is founder") || lowerMsg.includes("who's the founder") || lowerMsg.includes("who is the founder")) {
      replyText = "TS GOLF was founded by **Tom Smith** in 2022.";
    } else if (lowerMsg.includes("tell me about your founder") || lowerMsg.includes("tell me about the founder") || lowerMsg.includes("about tom") || lowerMsg.includes("who is tom smith") || lowerMsg.includes("tom's story")) {
      replyText = "TS GOLF was founded by **Tom Smith** in 2022. He built the brand around high-quality golf practice equipment and a strong focus on UK golfers.";
    } else {
      replyText = "TS GOLF was established in 2022 by **Tom Smith** (Founder of TS GOLF), who was featured in Microsoft's 2025 article as one of the most inspiring British entrepreneurs.\n\nRooted in British design and precision, TS GOLF has processed over **75,000+ orders** and **68,000+ happy customers**, becoming an Amazon UK best seller for golf accessories.";
    }
  }

  // 13. BUNDLES, DISCOUNTS & SAVINGS
  else if (lowerMsg.includes("bundle") || lowerMsg.includes("discount") || lowerMsg.includes("code") || lowerMsg.includes("offer") || lowerMsg.includes("promotion") || lowerMsg.includes("save money") || lowerMsg.includes("save") || lowerMsg.includes("saving")) {
    replyText = "Add at least 3 products to a bundle and use code **20OFFBUNDLE** at checkout to save **20%**!";
  }

  // 14. PRODUCT: UMBRELLA & HOLDER
  else if (lowerMsg.includes("umbrella") || lowerMsg.includes("motocaddy") || lowerMsg.includes("trolley")) {
    replyText = "We have two premium umbrella products available:\n\n1. **Motocaddy Universal Umbrella Holder (£18.99, reg £19.99):** Fits Powakaddy, Motocaddy, iCart, and most golf trolleys with no drilling required.\nLink: https://tsgolf.co.uk/products/umbrella-h\n\n2. **Umbrella Windproof Resilient 62 Inch UV Protection Lightweight Golf Trolley Umbrella (£34.99, reg £39.99):** 62-inch double canopy with UV sun protection and heavy rain resilience.\nLink: https://tsgolf.co.uk/products/umbrella-windproof-resilient-62-inch-uv-protection-lightweight-golf-trolley-umbrella";
  }

  // 15. CONTACT / HUMAN HANDOFF
  else if (lowerMsg.includes("contact") || lowerMsg.includes("phone") || lowerMsg.includes("email") || lowerMsg.includes("address") || lowerMsg.includes("speak to human") || lowerMsg.includes("speak to someone") || lowerMsg.includes("support")) {
    replyText = "You can reach the TS GOLF UK customer support team directly at:\n\n• **Email:** info@tsgolf.co.uk\n• **Phone:** 01223 666663\n• **Hours:** 24/7 UK customer support\n• **Address:** 1 View Farm Close, Dry Drayton, Cambridge CB23 8BP, UK";
  }

  // 16. FALLBACK / SAFETY HANDOFF
  else {
    replyText = "I want to make sure I give you accurate details. You can reach out directly to the TS GOLF team at **info@tsgolf.co.uk** or **01223 666663** and we'll be happy to help!";
  }

  // Validate response safety
  const safeReplyText = validateResponse(rawMsg, replyText);

  // Save agent response to memory
  session.history.push({ role: 'assistant', content: safeReplyText });

  return {
    sessionId,
    reply: safeReplyText,
    showOrderLookup
  };
}

