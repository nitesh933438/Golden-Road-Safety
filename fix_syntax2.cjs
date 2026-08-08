const fs = require('fs');
let content = fs.readFileSync('src/pages/SmartMap.tsx', 'utf8');
content = content.replace(') : (\n        {/* Leaflet OpenStreetMap Container */}\n        {/* Leaflet OpenStreetMap Container */}', ') : (\n<>\n{/* Leaflet OpenStreetMap Container */}');
content = content.replace('</MapContainer>\n        )}', '</MapContainer>\n</>\n)}');
fs.writeFileSync('src/pages/SmartMap.tsx', content);
