const fs = require('fs');
const file = 'src/App.css';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '#090b12': '#080c09',
  '#f5f7ff': '#f4fcf6',
  '#d7dcf7': '#d5ecd9',
  '#c7cee9': '#c6e3cd',
  '#9fb0ff': '#56c271',
  '#111423': '#0d140f',
  '111, 128, 255': '86, 194, 113',
  '#58a6ff': '#56c271',
  '88, 166, 255': '86, 194, 113',
  '159, 176, 255': '86, 194, 113',
  '#1b2432': '#162118',
  '#111827': '#0d140f'
};

for (const [oldVal, newVal] of Object.entries(replacements)) {
  content = content.split(oldVal).join(newVal);
}

fs.writeFileSync(file, content);
console.log('Colors replaced successfully.');
