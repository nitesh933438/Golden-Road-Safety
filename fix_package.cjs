const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const devDepsToMove = [
  "@tailwindcss/vite",
  "@types/leaflet",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "@vitejs/plugin-react",
  "autoprefixer",
  "typescript",
  "vite",
  "esbuild"
];

if (!pkg.devDependencies) pkg.devDependencies = {};

for (const dep of devDepsToMove) {
  if (pkg.dependencies && pkg.dependencies[dep]) {
    pkg.devDependencies[dep] = pkg.dependencies[dep];
    delete pkg.dependencies[dep];
  }
}

// Write back
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('package.json updated');
