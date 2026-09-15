import fs from 'fs';

async function fetchPageText(url) {
  const res = await fetch(url);
  const html = await res.text();
  
  // Basic parsing to isolate main content area
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<article[\s\S]*?<\/article>/i);
  const targetHtml = mainMatch ? mainMatch[0] : html;

  // Clean tags
  let text = targetHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
    
  return text;
}

async function run() {
  const urls = {
    our_story: 'https://tsgolf.co.uk/pages/our-story',
    faq: 'https://tsgolf.co.uk/pages/faq',
    contact_us: 'https://tsgolf.co.uk/pages/contact-us',
    shipping_policy: 'https://tsgolf.co.uk/policies/shipping-policy',
    refund_policy: 'https://tsgolf.co.uk/policies/refund-policy',
    privacy_policy: 'https://tsgolf.co.uk/policies/privacy-policy',
    terms_of_service: 'https://tsgolf.co.uk/policies/terms-of-service',
    assembly: 'https://tsgolf.co.uk/pages/instructions-for-assembling-ts-golf-net',
    drills: 'https://tsgolf.co.uk/pages/drills',
    driving_and_power: 'https://tsgolf.co.uk/pages/driving-and-power'
  };

  const pageTexts = {};
  for (const [key, url] of Object.entries(urls)) {
    console.log(`Fetching ${key}...`);
    try {
      pageTexts[key] = await fetchPageText(url);
    } catch (e) {
      pageTexts[key] = `Error: ${e.message}`;
    }
  }

  fs.writeFileSync('extracted_pages.json', JSON.stringify(pageTexts, null, 2));
  console.log('Saved to extracted_pages.json');
}

run();
