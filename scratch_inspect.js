import fs from 'fs';

const data = JSON.parse(fs.readFileSync('site_audit.json', 'utf8'));

console.log("=== PRODUCTS ===");
data.products.forEach(p => {
  console.log(`ID: ${p.id} | Title: "${p.title}" | Handle: "${p.handle}"`);
  console.log(`Body HTML snippet: ${p.body_html.substring(0, 300).replace(/\n/g, ' ')}`);
  p.variants.forEach(v => {
    console.log(`  - Variant ID: ${v.id} | Title: "${v.title}" | Price: £${v.price} | CompareAt: £${v.compare_at_price || 'N/A'} | Available: ${v.available}`);
  });
  console.log('---');
});

console.log("\n=== COLLECTIONS ===");
data.collections.forEach(c => console.log(`Title: "${c.title}" | Handle: "${c.handle}"`));

console.log("\n=== PAGES ===");
Object.keys(data.pages).forEach(k => {
  console.log(`\nKey: ${k} | Status: ${data.pages[k].status} | URL: ${data.pages[k].url}`);
  if (data.pages[k].textSnippet) {
    console.log(`Snippet: ${data.pages[k].textSnippet.substring(0, 400)}`);
  }
});
