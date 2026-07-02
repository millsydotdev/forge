const fs = require('fs');
const c = fs.readFileSync('src/data/generated-stat-map.ts', 'utf8');
const lines = c.split('\n').filter(function(l) {
  return l.trim().startsWith("'");
});
console.log('Total entries:', lines.length);
