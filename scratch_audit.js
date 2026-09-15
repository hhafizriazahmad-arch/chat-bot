import fs from 'fs';

async function audit() {
  console.log("Auditing tsgolf.co.uk...");
  
  // 1. Fetch products.json
  let allProducts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://tsgolf.co.uk/products.json?page=${page}&limit=250`);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.products || data.products.length === 0) break;
    allProducts.push(...data.products);
    if (data.products.length < 250) break;
    page++;
  }
  console.log(`Fetched ${allProducts.length} products.`);

  // 2. Fetch collections.json
  let allCollections = [];
  try {
    const res = await fetch(`https://tsgolf.co.uk/collections.json`);
    if (res.ok) {
      const data = await res.json();
      allCollections = data.collections || [];
    }
  } catch (e) {
    console.error("Collections fetch failed", e);
  }
  console.log(`Fetched ${allCollections.length} collections.`);

  // 3. Fetch key pages and policies
  const pagesToFetch = [
    { key: 'our_story', url: 'https://tsgolf.co.uk/pages/our-story' },
    { key: 'faq', url: 'https://tsgolf.co.uk/pages/faq' },
    { key: 'contact', url: 'https://tsgolf.co.uk/pages/contact' },
    { key: 'contact_us', url: 'https://tsgolf.co.uk/pages/contact-us' },
    { key: 'shipping_policy', url: 'https://tsgolf.co.uk/policies/shipping-policy' },
    { key: 'refund_policy', url: 'https://tsgolf.co.uk/policies/refund-policy' },
    { key: 'privacy_policy', url: 'https://tsgolf.co.uk/policies/privacy-policy' },
    { key: 'terms_of_service', url: 'https://tsgolf.co.uk/policies/terms-of-service' },
    { key: 'assembly', url: 'https://tsgolf.co.uk/pages/instructions-for-assembling-ts-golf-net' },
    { key: 'drills', url: 'https://tsgolf.co.uk/pages/drills' },
    { key: 'driving_and_power', url: 'https://tsgolf.co.uk/pages/driving-and-power' }
  ];

  const fetchedPages = {};
  for (const p of pagesToFetch) {
    try {
      const res = await fetch(p.url);
      if (res.ok) {
        const html = await res.text();
        // Clean basic html tags for readability
        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        fetchedPages[p.key] = {
          url: p.url,
          status: res.status,
          textSnippet: cleanText.substring(0, 3000)
        };
      } else {
        fetchedPages[p.key] = { url: p.url, status: res.status };
      }
    } catch (e) {
      fetchedPages[p.key] = { url: p.url, error: e.message };
    }
  }

  const result = {
    timestamp: new Date().toISOString(),
    products: allProducts,
    collections: allCollections,
    pages: fetchedPages
  };

  fs.writeFileSync('site_audit.json', JSON.stringify(result, null, 2));
  console.log("Audit saved to site_audit.json");
}

audit();
