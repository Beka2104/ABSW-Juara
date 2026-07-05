const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllTsxFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') {
      files = files.concat(getAllTsxFiles(fullPath));
    } else if (item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllTsxFiles(srcDir);

let totalFiles = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // To swap safely, use a temporary string
  content = content.replace(/navy-/g, 'TEMP_COLOR-');
  content = content.replace(/maroon-/g, 'navy-');
  content = content.replace(/TEMP_COLOR-/g, 'maroon-');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Swapped navy/maroon in ${path.relative(srcDir, filePath)}`);
    totalFiles++;
  }
}

console.log(`Done! ${totalFiles} files updated to swap navy and maroon.`);
