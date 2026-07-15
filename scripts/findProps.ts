import * as fs from "fs";
import * as path from "path";

const pagePath = "app/(admin)/admin/page.tsx";
const content = fs.readFileSync(pagePath, "utf8");

const dashboardStart = content.indexOf("export default function AdminDashboard");
const returnStart = content.lastIndexOf("return (");

const dashboardBody = content.substring(dashboardStart, returnStart);

const stateRegex = /const \[([a-zA-Z0-9_]+),\s*(set[a-zA-Z0-9_]+)\]\s*=\s*useState/g;
const funcRegex = /const (handle[a-zA-Z0-9_]+|delete[a-zA-Z0-9_]+|confirm[a-zA-Z0-9_]+|start[a-zA-Z0-9_]+|reset[a-zA-Z0-9_]+|update[a-zA-Z0-9_]+)\s*=/g;
const varRegex = /const (authUser|modulesCount|pendingInscriptionsCount|newStudentsCount|unreadMessagesCount|validatedInscriptionsCount|upcomingClasses|filteredStudents|overviewStats)\s*=/g;

const propsSet = new Set<string>();

let match;
while ((match = stateRegex.exec(dashboardBody)) !== null) {
  propsSet.add(match[1]);
  propsSet.add(match[2]);
}

while ((match = funcRegex.exec(dashboardBody)) !== null) {
  propsSet.add(match[1]);
}

while ((match = varRegex.exec(dashboardBody)) !== null) {
  propsSet.add(match[1]);
}

// Some functions might be declared as `function xyz() {`
const funcDeclRegex = /function (handle[a-zA-Z0-9_]+|delete[a-zA-Z0-9_]+|confirm[a-zA-Z0-9_]+|start[a-zA-Z0-9_]+|reset[a-zA-Z0-9_]+|update[a-zA-Z0-9_]+)\s*\(/g;
while ((match = funcDeclRegex.exec(dashboardBody)) !== null) {
  propsSet.add(match[1]);
}

const allProps = Array.from(propsSet).join(", ");
console.log(allProps);
