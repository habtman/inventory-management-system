const fetch = require('node-fetch');

fetch('http://localhost:5001/api/v1/stock/transfer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 1,
    from_location_id: 1,
    to_location_id: 2,
    qty: 5
  })
}).then(r => r.json()).then(console.log);
