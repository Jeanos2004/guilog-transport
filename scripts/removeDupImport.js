const fs = require("fs");
let c = fs.readFileSync("app/(admin)/admin/page.tsx", "utf8");
const imp = `import { CourseBuilderInline } from "@/components/admin/CourseBuilderInline";`;
const first = c.indexOf(imp);
const second = c.indexOf(imp, first + 1);
if (second !== -1) {
  c = c.slice(0, second) + c.slice(second + imp.length + 1);
  console.log("Removed duplicate import at index", second);
} else {
  console.log("No duplicate found");
}
fs.writeFileSync("app/(admin)/admin/page.tsx", c, "utf8");
console.log("Done");
