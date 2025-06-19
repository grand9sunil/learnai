const symbol = process.argv[2] || 'NIFTY 50';

async function fetchQuote(sym) {
  const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(sym)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed with ${res.status}`);
  }
  return res.json();
}

async function main() {
  while (true) {
    try {
      const data = await fetchQuote(symbol);
      const price = data?.priceInfo?.lastPrice;
      console.log(`${new Date().toISOString()} - ${symbol}: ${price}`);
    } catch (err) {
      console.error('Error fetching data', err.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
