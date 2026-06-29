const fs = require('fs');
const file = 'c:/Workspace/cfig/app/(admin)/admin/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Use a simple split and join to insert the line
const searchStr = 'cat.modules.forEach((mod, modIndex) => {';
const replacement = 'cat.modules.forEach((mod, modIndex) => {\n          if (mod.details?.statutInscription === "Fermée") return;';

if (content.includes(searchStr)) {
  const parts = content.split(searchStr);
  // We only want to replace the first occurrence in the upcoming logic, but wait, the student enrollment logic might also have it.
  // Actually, there are multiple loops like this. Let's find the specific one for "upcoming.push"
  
  const targetIndex = content.indexOf('const upcoming: { catIndex: number, modIndex: number, modTitre: string, jour: string, horaire: string }[] = [];');
  
  if (targetIndex > -1) {
    const stringAfterTarget = content.substring(targetIndex);
    const firstLoop = stringAfterTarget.indexOf(searchStr);
    
    if (firstLoop > -1) {
      const absoluteLoopIndex = targetIndex + firstLoop;
      const before = content.substring(0, absoluteLoopIndex);
      const after = content.substring(absoluteLoopIndex + searchStr.length);
      content = before + replacement + after;
      
      fs.writeFileSync(file, content);
      console.log('Success!');
    }
  }
} else {
  console.log('Not found');
}
