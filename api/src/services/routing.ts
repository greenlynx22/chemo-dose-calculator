type Quote = { port: 'LA' | 'HOUSTON'; totalUsd: number; etaDays: number };

async function mockGetQuotes(): Promise<Quote[]> {
  // Placeholder: Replace with real rate APIs (trucking + ocean)
  // Example: trucking Dallas->LA/HOU via carrier API, ocean LA/HOU->PH via NVOCC API
  return [
    { port: 'LA', totalUsd: 950, etaDays: 18 },
    { port: 'HOUSTON', totalUsd: 1020, etaDays: 20 },
  ];
}

export async function choosePortForBox(): Promise<{ port: 'LA' | 'HOUSTON'; reason: string; quote: Quote }> {
  const quotes = await mockGetQuotes();
  // Choose cheapest, tie-breaker: fastest ETA
  const sorted = quotes.sort((a, b) => (a.totalUsd - b.totalUsd) || (a.etaDays - b.etaDays));
  const best = sorted[0];
  return { port: best.port, reason: 'lowest total cost (tie-breaker: fastest ETA)', quote: best };
}

