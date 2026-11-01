// Odczyt JSON-a ze stdin dla adapterów hooków. Nieczytelne wejście daje {} — hook nie blokuje pracy.
export function readStdinJson() {
  return new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (raw += c));
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}
