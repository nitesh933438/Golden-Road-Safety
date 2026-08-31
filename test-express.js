const express = require('express');
const app = express();
app.get('*all', (req, res) => res.send('matched *all'));
app.listen(3001, () => {
  require('http').get('http://localhost:3001/sos', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => { console.log("Response:", data); process.exit(0); });
  });
});
