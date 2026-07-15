const fs = require("fs");

// Read file as UTF-8
let content = fs.readFileSync("app/(admin)/admin/page.tsx", "utf8");

// Count before
const badStr1 = "Ferm\u00c3\u00a9e"; // Fermée double-encoded
const badStr2 = "Ferm\u01df\ufffd\ufffd" ; // corrupted variant
const goodStr = "Ferm\u00e9e"; // correct Fermée

// Log what's in the file
const idx = content.indexOf("Ferm");
console.log("Context around first 'Ferm':", JSON.stringify(content.slice(idx, idx + 20)));

// Replace all corrupted variants
// The file was saved with double-encoding: UTF-8 bytes of é were interpreted as latin-1
// é in UTF-8 is 0xC3 0xA9, which in latin-1 is Ã©
// So "Fermée" became "FermÃ©e" or similar

let fixed = content;

// Pattern 1: Ã©  (most common double-encoding of é)
fixed = fixed.replace(/Ferm\u00c3\u00a9e/g, "Ferm\u00e9e");

// Pattern 2: Any other corruptions near "Ferm" - scan for non-ASCII after m
// Use a regex that matches Ferm followed by non-standard chars then e
fixed = fixed.replace(/Ferm[\x80-\xff\u0100-\uffff]+e(?=")/g, "Ferm\u00e9e");
fixed = fixed.replace(/Ferm[\x80-\xff\u0100-\uffff]+e(?=')/g, "Ferm\u00e9e");

const afterIdx = fixed.indexOf("Ferm");
console.log("Context after fix:", JSON.stringify(fixed.slice(afterIdx, afterIdx + 20)));

fs.writeFileSync("app/(admin)/admin/page.tsx", fixed, { encoding: "utf8" });
console.log("Done fixing encoding");
