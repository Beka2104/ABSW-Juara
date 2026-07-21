const fs = require('fs');
const path = require('path');

const srcDir = path.join('d:\\\\Project\\\\ABSW Juara', 'src');
const componentsDir = path.join(srcDir, 'components');

// 1. Update App.tsx
let appPath = path.join(srcDir, 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// We need to add currentStudentName={currentStudentName} to SopView, JadwalView, PresensiView, CompetitionsView, AssessmentsView, MeetingsView, DocumentsView
['SopView', 'JadwalView', 'PresensiView', 'CompetitionsView', 'AssessmentsView', 'MeetingsView', 'DocumentsView'].forEach(comp => {
  const regex = new RegExp('<' + comp + ' (.*?)(?<!currentStudentName=\\{currentStudentName\\}) />', 'g');
  appContent = appContent.replace(regex, '<' + comp + ' $1 currentStudentName={currentStudentName} />');
});
fs.writeFileSync(appPath, appContent);

// 2. Update all components to accept currentStudentName and replace 'Ust. Reza Firmansyah'
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let filepath = path.join(componentsDir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  let changed = false;

  // Add currentStudentName to Props interface if not exists and if we need it
  // First check if the file uses 'Ust. Reza Firmansyah'
  if (content.includes('Ust. Reza Firmansyah')) {
    changed = true;
    
    // Add to interface
    if (content.includes('interface ') && content.includes('Props {') && !content.includes('currentStudentName?: string')) {
      content = content.replace(/(interface \w+Props \{)/, '$1\n  currentStudentName?: string;');
    }
    
    // Add to component signature
    if (content.match(/export default function \w+\(\{\s*(.*?)\s*\}\s*:\s*\w+Props\)/)) {
      if (!content.includes('currentStudentName') && !content.includes('Props {')) {
         // handle cases without destructuring if any
      } else {
         content = content.replace(/(export default function \w+\(\{\s*)(.*?)(\s*\}\s*:\s*\w+Props\))/, (match, p1, p2, p3) => {
           if (!p2.includes('currentStudentName')) {
             return p1 + p2 + ', currentStudentName' + p3;
           }
           return match;
         });
      }
    }
    
    // Replace 'Ust. Reza Firmansyah' with (currentStudentName || 'Pengguna')
    // Handle string literals in logs
    content = content.replace(/\"Ust\. Reza Firmansyah(.*?)\"/g, '(currentStudentName || \"Pengguna\") + \"$1\"');
    
    // Handle JSX text
    content = content.replace(/>Ust\. Reza Firmansyah(.*?)<\/p>/g, '>{currentStudentName || \"Pengguna\"}$1</p>');
    
    // Handle specific Header/Dashboard logic where it's already '{currentStudentName || \"Ust. Reza Firmansyah\"}'
    content = content.replace(/currentStudentName \|\| \"Ust\. Reza Firmansyah(.*?)\"/g, 'currentStudentName || \"Pengguna$1\"');
  }

  if (changed) {
    // clean up any weird string concat like + ""
    content = content.replace(/\+ \"\"/g, '');
    fs.writeFileSync(filepath, content);
    console.log('Updated ' + file);
  }
}
