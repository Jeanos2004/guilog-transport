const fs = require('fs');

const pageContent = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// The pattern for tabs is: {activeTab === "tabName" && ( ... )}
const tabNames = [
  "overview", "inscriptions", "students", "formations",
  "actualites", "testimonials", "galerie", "messages", "settings", "users"
];

let remainingContent = pageContent;

for (const tab of tabNames) {
  const startPattern = `{activeTab === "${tab}" && (`;
  const startIndex = pageContent.indexOf(startPattern);
  if (startIndex === -1) {
    console.log(`Tab ${tab} not found!`);
    continue;
  }
  
  // Find the matching closing parentheses & brace: )}
  // Since JSX can be nested, we can just split by the start of the next tab or by searching for the closing tags.
  const nextTabIndex = tabNames.findIndex(t => t === tab) + 1;
  let endIndex = -1;
  
  if (nextTabIndex < tabNames.length) {
    const nextPattern = `{activeTab === "${tabNames[nextTabIndex]}" && (`;
    endIndex = pageContent.indexOf(nextPattern, startIndex);
  } else {
    // For the last tab (users), just find the closing tags of the main content
    endIndex = pageContent.indexOf('</main>', startIndex);
  }
  
  if (endIndex === -1) continue;
  
  // Extract block
  const block = pageContent.substring(startIndex, endIndex);
  fs.writeFileSync(`components/admin/tabs/${tab}Block.txt`, block);
  console.log(`Extracted ${tab}`);
}
