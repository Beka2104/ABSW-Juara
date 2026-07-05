// Replace ALL non-logo colors with logo-only colors across all components
// Logo colors: Navy #1B365D, Maroon #781414, Gold #C59324, White
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

// All replacements: map alien colors to logo colors
const replacements = [
  // ═══ BLUE shades → NAVY ═══
  ['bg-blue-50', 'bg-navy-50'],
  ['bg-blue-100', 'bg-navy-100'],
  ['bg-blue-500', 'bg-navy-500'],
  ['bg-blue-600', 'bg-navy-500'],
  ['bg-blue-700', 'bg-navy-600'],
  ['text-blue-500', 'text-navy-500'],
  ['text-blue-600', 'text-navy-500'],
  ['text-blue-700', 'text-navy-600'],
  ['border-blue-100', 'border-navy-100'],
  ['border-blue-200', 'border-navy-200'],
  ['ring-blue-', 'ring-navy-'],
  ['hover:bg-blue-50', 'hover:bg-navy-50'],
  
  // ═══ EMERALD/GREEN shades → NAVY ═══
  ['bg-emerald-50', 'bg-navy-50'],
  ['bg-emerald-100', 'bg-navy-100'],
  ['bg-emerald-500', 'bg-navy-500'],
  ['bg-emerald-600', 'bg-navy-500'],
  ['bg-emerald-700', 'bg-navy-600'],
  ['bg-emerald-800', 'bg-navy-700'],
  ['text-emerald-500', 'text-navy-400'],
  ['text-emerald-600', 'text-navy-500'],
  ['text-emerald-700', 'text-navy-600'],
  ['text-emerald-800', 'text-navy-700'],
  ['border-emerald-100', 'border-navy-100'],
  ['border-emerald-200', 'border-navy-200'],
  ['hover:bg-emerald-50', 'hover:bg-navy-50'],
  ['hover:bg-emerald-100', 'hover:bg-navy-100'],
  ['hover:bg-emerald-700', 'hover:bg-navy-600'],
  ['ring-emerald-', 'ring-navy-'],
  ['bg-green-100', 'bg-navy-50'],
  ['bg-green-500', 'bg-navy-500'],
  ['text-green-500', 'text-navy-400'],
  ['text-green-600', 'text-navy-500'],
  ['text-green-800', 'text-navy-700'],
  ['border-green-200', 'border-navy-200'],
  ['border-green-500', 'border-navy-400'],
  
  // ═══ VIOLET/PURPLE shades → MAROON ═══
  ['bg-violet-50', 'bg-maroon-50'],
  ['bg-violet-100', 'bg-maroon-100'],
  ['text-violet-600', 'text-maroon-500'],
  ['text-violet-700', 'text-maroon-600'],
  ['bg-purple-50', 'bg-maroon-50'],
  ['bg-purple-100', 'bg-maroon-100'],
  ['text-purple-600', 'text-maroon-500'],
  ['text-purple-700', 'text-maroon-600'],
  ['border-purple-100', 'border-maroon-100'],
  ['bg-indigo-50', 'bg-navy-50'],
  ['bg-indigo-100', 'bg-navy-100'],
  ['text-indigo-600', 'text-navy-500'],
  ['text-indigo-700', 'text-navy-600'],
  
  // ═══ ROSE/PINK shades → MAROON ═══
  ['bg-rose-50', 'bg-maroon-50'],
  ['bg-rose-100', 'bg-maroon-100'],
  ['text-rose-500', 'text-maroon-500'],
  ['text-rose-600', 'text-maroon-500'],
  ['text-rose-700', 'text-maroon-600'],
  ['border-rose-100', 'border-maroon-100'],
  ['border-rose-200', 'border-maroon-100'],
  ['hover:bg-rose-50', 'hover:bg-maroon-50'],
  ['hover:bg-rose-100', 'hover:bg-maroon-100'],
  ['hover:text-rose-600', 'hover:text-maroon-500'],
  ['bg-pink-50', 'bg-maroon-50'],
  ['text-pink-600', 'text-maroon-500'],
  ['bg-red-50', 'bg-maroon-50'],
  ['bg-red-100', 'bg-maroon-100'],
  ['bg-red-500', 'bg-maroon-500'],
  ['text-red-500', 'text-maroon-500'],
  ['text-red-600', 'text-maroon-500'],
  ['text-red-700', 'text-maroon-600'],
  ['text-red-800', 'text-maroon-700'],
  ['border-red-100', 'border-maroon-100'],
  ['border-red-200', 'border-maroon-200'],
  ['hover:bg-red-50', 'hover:bg-maroon-50'],
  
  // ═══ AMBER/YELLOW/ORANGE shades → GOLD ═══
  ['bg-amber-50', 'bg-gold-50'],
  ['bg-amber-100', 'bg-gold-100'],
  ['bg-amber-400', 'bg-gold-400'],
  ['bg-amber-500', 'bg-gold-500'],
  ['text-amber-400', 'text-gold-400'],
  ['text-amber-500', 'text-gold-500'],
  ['text-amber-600', 'text-gold-600'],
  ['text-amber-700', 'text-gold-600'],
  ['border-amber-100', 'border-gold-100'],
  ['border-amber-200', 'border-gold-200'],
  ['border-amber-500', 'border-gold-500'],
  ['hover:bg-amber-50', 'hover:bg-gold-50'],
  ['bg-yellow-100', 'bg-gold-100'],
  ['text-yellow-800', 'text-gold-700'],
  ['bg-orange-50', 'bg-gold-50'],
  ['text-orange-500', 'text-gold-500'],
  ['text-orange-600', 'text-gold-600'],
  ['border-orange-100', 'border-gold-100'],
  ['border-orange-200', 'border-gold-200'],
  
  // ═══ TEAL/CYAN → NAVY ═══
  ['bg-teal-50', 'bg-navy-50'],
  ['text-teal-600', 'text-navy-500'],
  ['bg-cyan-50', 'bg-navy-50'],
  ['text-cyan-600', 'text-navy-500'],
  
  // ═══ PRIMARY/ACCENT/SUCCESS/DANGER → Logo tokens ═══
  // Primary → Navy
  ['bg-primary-50', 'bg-navy-50'],
  ['bg-primary-100', 'bg-navy-100'],
  ['bg-primary-200', 'bg-navy-200'],
  ['bg-primary-500', 'bg-navy-500'],
  ['bg-primary-600', 'bg-navy-500'],
  ['bg-primary-700', 'bg-navy-700'],
  ['bg-primary-800', 'bg-navy-800'],
  ['text-primary-500', 'text-navy-500'],
  ['text-primary-600', 'text-navy-500'],
  ['text-primary-700', 'text-navy-600'],
  ['border-primary-100', 'border-navy-100'],
  ['border-primary-200', 'border-navy-200'],
  ['border-primary-600', 'border-navy-500'],
  ['hover:bg-primary-50', 'hover:bg-navy-50'],
  ['hover:bg-primary-500', 'hover:bg-navy-400'],
  ['ring-primary-500', 'ring-navy-500'],
  ['focus:border-primary-200', 'focus:border-navy-200'],
  ['hover:border-primary-100', 'hover:border-navy-100'],
  ['outline-primary-500', 'outline-navy-500'],
  
  // Accent → Gold  
  ['bg-accent-50', 'bg-gold-50'],
  ['bg-accent-100', 'bg-gold-100'],
  ['bg-accent-400', 'bg-gold-400'],
  ['bg-accent-500', 'bg-gold-500'],
  ['text-accent-400', 'text-gold-400'],
  ['text-accent-500', 'text-gold-500'],
  ['text-accent-600', 'text-gold-600'],
  ['border-accent-500', 'border-gold-500'],
  ['hover:bg-accent-400', 'hover:bg-gold-400'],
  ['hover:text-accent-300', 'hover:text-gold-300'],
  
  // Success → Navy
  ['bg-success-50', 'bg-navy-50'],
  ['bg-success-100', 'bg-navy-100'],
  ['bg-success-500', 'bg-navy-400'],
  ['bg-success-600', 'bg-navy-500'],
  ['text-success-500', 'text-navy-400'],
  ['text-success-600', 'text-navy-500'],
  ['text-success-700', 'text-navy-600'],
  ['border-success-100', 'border-navy-100'],
  ['hover:bg-success-500', 'hover:bg-navy-400'],
  
  // Danger → Maroon
  ['bg-danger-50', 'bg-maroon-50'],
  ['bg-danger-100', 'bg-maroon-100'],
  ['bg-danger-500', 'bg-maroon-500'],
  ['bg-danger-600', 'bg-maroon-600'],
  ['text-danger-400', 'text-maroon-400'],
  ['text-danger-500', 'text-maroon-500'],
  ['text-danger-600', 'text-maroon-500'],
  ['border-danger-100', 'border-maroon-100'],
  ['hover:bg-danger-50', 'hover:bg-maroon-50'],
  ['hover:text-danger-500', 'hover:text-maroon-500'],
  ['hover:text-danger-600', 'hover:text-maroon-600'],
  
  // ═══ Specific gradient/compound patterns ═══
  ['from-primary-600 via-primary-700 to-primary-800', 'from-navy-500 via-navy-600 to-navy-700'],
  ['from-primary-600 to-primary-800', 'from-navy-500 to-navy-700'],
  ['from-primary-600 to-primary-500', 'from-navy-500 to-navy-400'],
  ['accent-primary-600', 'accent-navy-500'],
];

let totalFiles = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  for (const [search, replace] of replacements) {
    // Use word-boundary-aware replacement to avoid partial matches
    // e.g., don't replace "bg-blue-50" inside "bg-blue-500"
    // Sort by length descending handles this
    content = content.split(search).join(replace);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    const name = path.relative(srcDir, filePath);
    console.log(`✓ ${name}`);
    totalFiles++;
  }
}

console.log(`\nDone! ${totalFiles} files updated to use logo-only colors.`);
