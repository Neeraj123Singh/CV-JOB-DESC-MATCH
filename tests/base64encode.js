const fs = require('fs');
const path = process.argv[2];
if (!path) {
  console.error('Usage: node base64encode.js /path/to/file.pdf');
  process.exit(1);
}
const data = fs.readFileSync(path);
console.log(data.toString('base64')); 