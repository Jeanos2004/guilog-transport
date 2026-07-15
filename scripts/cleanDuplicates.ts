import * as fs from "fs";

let content = fs.readFileSync("app/(admin)/admin/page.tsx", "utf8");

// Remove duplicate imports block
const firstImportTab = content.indexOf('import { OverviewTab } from "@/components/admin/tabs/OverviewTab";');
const secondImportTab = content.indexOf('import { OverviewTab } from "@/components/admin/tabs/OverviewTab";', firstImportTab + 1);

if (firstImportTab !== -1 && secondImportTab !== -1) {
  // Found duplicates, let's remove the first one since they are clustered
  const endOfFirstCluster = content.indexOf('import { CourseBuilderTab } from "@/components/admin/tabs/CourseBuilderTab";', firstImportTab) + 76;
  content = content.slice(0, firstImportTab) + content.slice(endOfFirstCluster);
}

// Remove duplicate tabProps
const firstTabProps = content.indexOf('const tabProps = {');
const secondTabProps = content.indexOf('const tabProps = {', firstTabProps + 1);

if (firstTabProps !== -1 && secondTabProps !== -1) {
  const endOfFirstTabProps = content.indexOf('};', firstTabProps) + 2;
  content = content.slice(0, firstTabProps) + content.slice(endOfFirstTabProps);
}

fs.writeFileSync("app/(admin)/admin/page.tsx", content);
console.log("Duplicates cleaned");
