const fs = require('fs');
const path = require('path');
const componentsDir = path.join('src', 'components');

let compPath = path.join(componentsDir, 'CompetitionsView.tsx');
let comp = fs.readFileSync(compPath, 'utf8');
comp = comp.replace(/Ust\. H\. Gozali, S\.Pd\.I\./g, '(Kepala Sekolah)');
fs.writeFileSync(compPath, comp);

let docPath = path.join(componentsDir, 'DocumentsView.tsx');
let doc = fs.readFileSync(docPath, 'utf8');
doc = doc.replace(/Ust\. Wildan/g, 'Pembina');
fs.writeFileSync(docPath, doc);

let meetPath = path.join(componentsDir, 'MeetingsView.tsx');
let meet = fs.readFileSync(meetPath, 'utf8');
meet = meet.replace(/\["Ust\. Gozali", "Coach Jaka", "Coach Hendra", "Ust\. Wildan"\]/g, '["Peserta 1", "Peserta 2", "Peserta 3"]');
fs.writeFileSync(meetPath, meet);

let jadPath = path.join(componentsDir, 'JadwalView.tsx');
let jad = fs.readFileSync(jadPath, 'utf8');
jad = jad.replace(/Assalamualaikum Ust\.,/g, 'Assalamualaikum,');
fs.writeFileSync(jadPath, jad);

let masPath = path.join(componentsDir, 'MasterDataView.tsx');
let mas = fs.readFileSync(masPath, 'utf8');
mas = mas.replace(/Ust\. Ahmad Fauzi/g, 'Fulan');
mas = mas.replace(/Coach Budi/g, 'Pelatih 1');
mas = mas.replace(/Ustadzah Aisyah/g, 'Pembina 1');
fs.writeFileSync(masPath, mas);
console.log('Fixed hardcoded names in components');
