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

// Define replacements for standalone emojis that act as UI elements
// We'll replace them with Lucide icons (e.g. <Trophy className="text-maroon-500" />)
const standaloneReplacements = {
  // MasterDataView
  'logo: "🎯"': 'logo: "Target"',
  '{e.logo || "🎯"}': '{e.logo === "Target" ? <Target className="text-gold-500" size={24} /> : <Target className="text-gold-500" size={24} />}',
  '<span className="text-sm">🔑</span>': '<Key className="text-maroon-500" size={16} />',
  '🛡️': '', // Used as a text prefix or standalone, we'll just remove it
  
  // DashboardView
  '<span className="text-[180px]">🕌</span>': '<Landmark className="text-navy-500 opacity-20 w-48 h-48" />',
  '<div className="w-6 h-6 bg-gold-500 rounded flex items-center justify-center text-white text-xs font-bold">✨</div>': '<div className="w-6 h-6 bg-gold-500 rounded flex items-center justify-center text-white"><Sparkles size={14} /></div>',
  
  // LoginView
  '🕌': '<Landmark className="text-gold-500" size={24} />',
  '<span className="text-gold-400 text-base">🎯</span>': '<Target className="text-gold-400" size={20} />',
  '<span className="text-maroon-400 text-base">💻</span>': '<Monitor className="text-maroon-400" size={20} />',
  
  // PresensiView
  '<span className="text-lg">✅</span>': '<CheckCircle2 className="text-maroon-500" size={20} />',
  '<span className="text-lg">🤒</span>': '<Thermometer className="text-gold-500" size={20} />',
  '<span className="text-lg">📝</span>': '<FileText className="text-navy-500" size={20} />',
  '<span className="text-lg">🕒</span>': '<Clock className="text-gold-500" size={20} />',
  '<span className="text-lg">❌</span>': '<XCircle className="text-maroon-500" size={20} />',
  '<span className="text-lg">📊</span>': '<BarChart2 className="text-navy-500" size={20} />',
  
  // CompetitionsView
  '<div className="text-2xl">🏆</div>': '<div className="text-maroon-500"><Trophy size={24} /></div>',
  'trophy: "🏆 Piala"': 'trophy: "Piala"',
  
  // DocumentsView
  '<span className="text-base shrink-0">👤</span>': '<User className="text-navy-500 shrink-0" size={18} />',
};

// Text prefixes to simply remove
const emojiPrefixes = [
  '🏆', '📝', '📊', '⏳', '📍', '📂', '✉️', '👤', '📅', 
  '🕋', '⚽', '🎓', '🛡️', '🔐', '🤝', '📡', '💡', '📢', '❌', '⚡', '📖',
  '🎯', '✨' // some leftovers
];

let totalFiles = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // 1. Replace specific standalone UI emojis
  for (const [search, replace] of Object.entries(standaloneReplacements)) {
    content = content.split(search).join(replace);
  }
  
  // 2. Remove emoji prefixes from text
  for (const emoji of emojiPrefixes) {
    content = content.split(emoji + ' ').join(''); // with space
    content = content.split(emoji).join(''); // without space
  }
  
  // Add missing imports to the top if needed
  if (content !== original) {
    const lucideIconsToAdd = ['Target', 'Key', 'Landmark', 'Sparkles', 'Monitor', 'CheckCircle2', 'Thermometer', 'FileText', 'Clock', 'XCircle', 'BarChart2', 'Trophy', 'User'];
    
    // Check if 'lucide-react' import exists
    const importMatch = content.match(/import \{([^}]+)\} from ["']lucide-react["'];/);
    if (importMatch) {
      let existingImports = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      let needsUpdate = false;
      
      for (const icon of lucideIconsToAdd) {
        if (content.includes(`<${icon}`) && !existingImports.includes(icon)) {
          existingImports.push(icon);
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        const newImport = `import { ${existingImports.join(', ')} } from "lucide-react";`;
        content = content.replace(importMatch[0], newImport);
      }
    } else {
      // Create new import if it doesn't exist but we used an icon
      let neededIcons = lucideIconsToAdd.filter(icon => content.includes(`<${icon}`));
      if (neededIcons.length > 0) {
        content = `import { ${neededIcons.join(', ')} } from "lucide-react";\n` + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated emojis in ${path.relative(srcDir, filePath)}`);
    totalFiles++;
  }
}

console.log(`Done! ${totalFiles} files updated to remove emojis.`);
