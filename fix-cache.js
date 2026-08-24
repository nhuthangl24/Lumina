const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('route.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const routes = walk('src/app/api');
let modified = 0;
routes.forEach(route => {
  let content = fs.readFileSync(route, 'utf8');
  if (content.match(/export async function GET/) && !content.includes('export const dynamic')) {
    content = 'export const dynamic = \'force-dynamic\';\n' + content;
    fs.writeFileSync(route, content, 'utf8');
    modified++;
  }
});
console.log('Modified ' + modified + ' routes to be dynamic.');
