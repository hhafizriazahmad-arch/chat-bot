// TS GOLF Response Safety & Anti-Hallucination Validator

export function validateResponse(userMessage, responseText) {
  let text = responseText;
  const lowerText = text.toLowerCase();

  // 1. Guard against quick-action concatenated text blocks
  if (text.includes("Practice Golf NetMagnetic Golf Towel") || 
      text.includes("Track My OrderBuild a Bundle") ||
      (text.includes("Practice Golf Net") && text.includes("Magnetic Golf Towel") && text.includes("Track My Order") && text.includes("Build a Bundle"))) {
    text = text
      .replace(/Practice Golf NetMagnetic Golf Towel/g, "")
      .replace(/Track My OrderBuild a Bundle/g, "")
      .replace(/Practice Golf Net/g, "")
      .replace(/Magnetic Golf Towel/g, "")
      .replace(/Track My Order/g, "")
      .replace(/Build a Bundle/g, "")
      .trim();
    if (!text) {
      text = "How can I help you with TS GOLF products or orders today?";
    }
  }

  // 2. Guard against AI Identity breaches or self-naming as ChatGPT / OpenAI / Gemini
  if (lowerText.includes("openai") || lowerText.includes("chatgpt") || lowerText.includes("gemini") || lowerText.includes("virtual assistant")) {
    return "I'm the TS GOLF customer support assistant, here to help with your products, shipping, and golf questions!";
  }

  // 3. Guard against invalid shipping claims
  if (lowerText.includes("ship worldwide") || lowerText.includes("international shipping") || lowerText.includes("deliver to us") || lowerText.includes("deliver to europe")) {
    if (!lowerText.includes("do not offer worldwide shipping") && !lowerText.includes("uk only")) {
      return "TS GOLF currently delivers within the United Kingdom. Worldwide shipping is not offered at this time. UK express shipping is £2.99 (or free on orders £200+).";
    }
  }

  // 4. Guard against incorrect warranty claims
  if (lowerText.includes("1 year warranty") || lowerText.includes("2 year warranty") || lowerText.includes("lifetime warranty")) {
    return "The Practice Golf Net Outdoor/ Indoor comes with a 6-month warranty and free replacement parts support.";
  }

  // 5. Guard against fabricated prices or discounts
  if (lowerText.includes("50% off") || lowerText.includes("70% off") || lowerText.includes("free net")) {
    return "Our current promotions include 20% Off Sitewide, Free UK shipping on orders £200+, and 10% off your first order when subscribing to our newsletter!";
  }

  return text;
}

