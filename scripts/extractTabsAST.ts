import { Project, SyntaxKind, Node } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

const project = new Project();
const sourceFile = project.addSourceFileAtPath("app/(admin)/admin/page.tsx");

const outDir = path.join(__dirname, "..", "components", "admin", "tabs");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const imports = `"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Activity, GraduationCap, DollarSign, BookOpen, ClipboardList, Mail, MapPin, 
  Search, Filter, Plus, FileText, ChevronRight, CheckCircle2, XCircle, Clock, Check,
  Calendar, Award, Trash2, Edit3, Save, TrendingUp, MessageSquare, Sparkles, X, ChevronDown, Video, 
  RefreshCcw, AlertCircle, Eye, Settings, Image as ImageIcon, Search as SearchIcon, PlayCircle, UploadCloud, Layers
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { MultiMediaUploader, MediaItem } from "@/components/admin/MultiMediaUploader";
import { GalleryItem } from "@/lib/db";
`;

const allPropsList = "isLoggedIn, setIsLoggedIn, isAuthChecking, setIsAuthChecking, isLoggingIn, setIsLoggingIn, username, setUsername, password, setPassword, authError, setAuthError, activeTab, setActiveTab, overviewFilter, setOverviewFilter, formations, setFormations, articles, setArticles, inscriptions, setInscriptions, smsBalance, setSmsBalance, messages, setMessages, testimonials, setTestimonials, gallery, setGallery, students, setStudents, payments, setPayments, showConvertModal, setShowConvertModal, leadToConvert, setLeadToConvert, leadPassword, setLeadPassword, leadCourseId, setLeadCourseId, leadCashAmount, setLeadCashAmount, isConvertingLead, setIsConvertingLead, selectedStudent, setSelectedStudent, studentSearchQuery, setStudentSearchQuery, mobileMenuOpen, setMobileMenuOpen, settings, setSettings, admins, setAdmins, editApprenantsForme, setEditApprenantsForme, editTotalHeuresFormation, setEditTotalHeuresFormation, editTauxSatisfaction, setEditTauxSatisfaction, editAnneesExperience, setEditAnneesExperience, settingsSuccessMsg, setSettingsSuccessMsg, settingsErrorMsg, setSettingsErrorMsg, newAdminEmail, setNewAdminEmail, newAdminPassword, setNewAdminPassword, userSuccessMsg, setUserSuccessMsg, userErrorMsg, setUserErrorMsg, searchQuery, setSearchQuery, statusFilter, setStatusFilter, showAddModuleModal, setShowAddModuleModal, modalTab, setModalTab, newModuleTitle, setNewModuleTitle, newModuleCategory, setNewModuleCategory, newModuleOutils, setNewModuleOutils, newModulePrix, setNewModulePrix, newModulePrixInscription, setNewModulePrixInscription, newModuleMethodePaiement, setNewModuleMethodePaiement, newModuleImage, setNewModuleImage, newModuleStatutInscription, setNewModuleStatutInscription, newModuleDuree, setNewModuleDuree, scheduleModalOpen, setScheduleModalOpen, scheduleModuleId, setScheduleModuleId, scheduleModuleName, setScheduleModuleName, scheduleDate, setScheduleDate, scheduleTime, setScheduleTime, scheduleLocation, setScheduleLocation, isScheduling, setIsScheduling, newModuleDateDebut, setNewModuleDateDebut, newModuleDateFin, setNewModuleDateFin, newModuleCalendrier, setNewModuleCalendrier, newModuleHoraires, setNewModuleHoraires, newModulePlanning, setNewModulePlanning, newModulePresentation, setNewModulePresentation, newModuleObjectifs, setNewModuleObjectifs, newModulePrerequis, setNewModulePrerequis, newModulePublicCible, setNewModulePublicCible, newModuleDebouches, setNewModuleDebouches, newModuleSessions, setNewModuleSessions, newModuleProgramme, setNewModuleProgramme, editingModule, setEditingModule, isSavingModule, setIsSavingModule, showAddArticleModal, setShowAddArticleModal, articleTitle, setArticleTitle, articleExcerpt, setArticleExcerpt, articleContent, setArticleContent, articleCategory, setArticleCategory, articleAuthor, setArticleAuthor, articleImage, setArticleImage, editingArticleId, setEditingArticleId, showAddGalleryModal, setShowAddGalleryModal, galleryTitle, setGalleryTitle, galleryCategory, setGalleryCategory, galleryMedia, setGalleryMedia, editingGalleryId, setEditingGalleryId, editingAlbumTitle, setEditingAlbumTitle, isSavingGallery, setIsSavingGallery, showAddTestimonialModal, setShowAddTestimonialModal, editingTestimonialIndex, setEditingTestimonialIndex, testimName, setTestimName, testimRole, setTestimRole, testimText, setTestimText, testimRating, setTestimRating, testimImage, setTestimImage, testimVideo, setTestimVideo, testimType, setTestimType, selectedRequest, setSelectedRequest, selectedMessage, setSelectedMessage, handleLogin, handleLogout, handleSaveSettings, handleCreateAdmin, handleToggleAdminStatus, handleDeleteAdmin, handleDeleteStudent, handleEnrollStudent, handleSendSms, handleScheduleSession, handleConvertLead, resetModuleForm, handleAddOrEditModule, handleDeleteModule, startEditModule, handleUpdateInscriptionStatus, handleAddOrEditArticle, startEditArticle, handleDeleteArticle, handleAddOrEditGallery, handleDeleteGallery, handleDeleteAlbum, handleAddOrEditTestimonial, handleDeleteTestimonial, handleToggleTestimonial, handleMarkMessageRead, handleDeleteMessage, pendingInscriptionsCount, unreadMessagesCount, modulesCount, validatedInscriptionsCount, upcomingClasses, overviewStats";

const propDestructuring = `  const {
    ` + allPropsList + `
  } = props;`;

const galerieHelpers = `
const getBaseTitle = (title: string) => title.replace(/\\s*\\(\\d+\\)$/, "").trim();

function GalleryTitleFolder({
  title,
  category,
  items,
  onEdit,
  onDelete,
  onEditAlbum,
  onDeleteAlbum,
}: {
  title: string;
  category: string;
  items: GalleryItem[];
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onEditAlbum: (title: string, category: string, items: GalleryItem[]) => void;
  onDeleteAlbum: (title: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50/50 transition-colors border-b border-gray-100">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-primary)]">{title}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
              {category} • {items.length} média{items.length > 1 ? "s" : ""}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditAlbum(title, category, items); }}
            className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteAlbum(title); }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 text-gray-400"
          >
            <ChevronDown className={\`w-4 h-4 transition-transform duration-200 \${open ? "rotate-180" : ""}\`} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5 bg-gray-50/30">
              {items.map((item) => (
                <div key={item.id} className="group relative aspect-square bg-gray-100 rounded-none overflow-hidden border border-gray-200">
                  {item.mediaType === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video className="w-8 h-8 text-white/50" />
                    </div>
                  ) : (
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => onEdit(item)} className="p-1.5 bg-white/20 hover:bg-[var(--color-primary)] text-white backdrop-blur-sm transition-colors">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => onDelete(item.id!)} className="p-1.5 bg-white/20 hover:bg-red-500 text-white backdrop-blur-sm transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

const tabsToExtract = [
  "overview", "inscriptions", "students", "formations", "actualites", 
  "testimonials", "galerie", "messages", "settings", "users"
];

let done = false;
while (!done) {
  done = true;
  const jsxExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.JsxExpression);
  
  for (const expr of jsxExpressions) {
    const expression = expr.getExpression();
    if (!expression || !Node.isBinaryExpression(expression)) continue;

    const left = expression.getLeft();
    if (!Node.isBinaryExpression(left)) continue;

    const leftLeft = left.getLeft();
    const leftRight = left.getRight();

    if (leftLeft.getText() === "activeTab" && Node.isStringLiteral(leftRight)) {
      const tabNameStr = leftRight.getLiteralValue();
      if (tabsToExtract.includes(tabNameStr)) {
        const right = expression.getRight();
        if (right) {
          const tabComponentName = tabNameStr.charAt(0).toUpperCase() + tabNameStr.slice(1) + "Tab";
          const jsxText = right.getFullText();
          
          let fileText = imports + "\n\n";
          if (tabNameStr === "galerie") fileText += galerieHelpers + "\n\n";
          fileText += "export function " + tabComponentName + "(props: any) {\n" +
  propDestructuring + "\n\n" +
  "  return (\n" +
  "    <>\n" +
  jsxText + "\n" +
  "    </>\n" +
  "  );\n" +
  "}";
          
          fs.writeFileSync(path.join(outDir, tabComponentName + ".tsx"), fileText);
          
          expr.replaceWithText('{activeTab === "' + tabNameStr + '" && <' + tabComponentName + ' {...tabProps} />}');
          
          tabsToExtract.splice(tabsToExtract.indexOf(tabNameStr), 1);
          done = false;
          break; 
        }
      }
    }
  }
}

sourceFile.saveSync();

// Now add the imports and tabProps to page.tsx using string manipulation
let pageContent = fs.readFileSync("app/(admin)/admin/page.tsx", "utf8");

const importedTabs = [
  "overview", "inscriptions", "students", "formations", "actualites", 
  "testimonials", "galerie", "messages", "settings", "users"
];

const tabImports = importedTabs.map(t => {
  const compName = t.charAt(0).toUpperCase() + t.slice(1) + "Tab";
  return 'import { ' + compName + ' } from "@/components/admin/tabs/' + compName + '";';
}).join('\n');
const allImports = tabImports + '\nimport { CourseBuilderTab } from "@/components/admin/tabs/CourseBuilderTab";';

const importIndex = pageContent.indexOf('import ');
pageContent = pageContent.slice(0, importIndex) + allImports + '\n' + pageContent.slice(importIndex);

const divIndex = pageContent.indexOf('<div className="h-screen bg-[var(--color-gray)]');
const returnIndex = pageContent.lastIndexOf('return (', divIndex);

const tabPropsDef = `
  const tabProps = {
    ` + allPropsList + `
  };
`;

if (returnIndex !== -1) {
  pageContent = pageContent.slice(0, returnIndex) + tabPropsDef + '\n' + pageContent.slice(returnIndex);
}

// Add CourseBuilderTab
const usersTabStr = 'activeTab === "users" && <UsersTab';
const usersTabIdx = pageContent.indexOf(usersTabStr);
if (usersTabIdx !== -1) {
  const endOfUsersLine = pageContent.indexOf('\\n', usersTabIdx);
  pageContent = pageContent.replace('{activeTab === "users" && <UsersTab {...tabProps} />}', 
    '{activeTab === "users" && <UsersTab {...tabProps} />}\n            {activeTab === "course-builder" && <CourseBuilderTab setActiveTab={setActiveTab} />}');
}

fs.writeFileSync("app/(admin)/admin/page.tsx", pageContent);

console.log("Extraction complete via ts-morph with safe replacement!");
