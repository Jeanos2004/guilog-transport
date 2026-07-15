const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'app', '(admin)', 'admin', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');
const lines = content.split('\n');

const tabs = [
  { name: 'OverviewTab', start: 1736, end: 2034 },
  { name: 'InscriptionsTab', start: 2035, end: 2158 },
  { name: 'StudentsTab', start: 2159, end: 2582 },
  { name: 'FormationsTab', start: 2583, end: 2693 },
  { name: 'ActualitesTab', start: 2694, end: 2775 },
  { name: 'TestimonialsTab', start: 2776, end: 2867 },
  { name: 'GalerieTab', start: 2868, end: 2950 },
  { name: 'MessagesTab', start: 2951, end: 3024 },
  { name: 'SettingsTab', start: 3025, end: 3110 },
  { name: 'UsersTab', start: 3111, end: 3226 }
];

const outDir = path.join(__dirname, '..', 'components', 'admin', 'tabs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Common imports for all tabs to avoid errors. We can just import everything needed.
const imports = `"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Activity, GraduationCap, DollarSign, BookOpen, ClipboardList, Mail, MapPin, 
  Search, Filter, Plus, FileText, ChevronRight, CheckCircle2, XCircle, Clock, Check,
  Calendar, Award, Trash2, Edit3, Save, TrendingUp, MessageSquare, Sparkles, X, ChevronDown, Video, 
  RefreshCcw, AlertCircle, Eye, Settings, Image as ImageIcon, Search as SearchIcon, PlayCircle, UploadCloud
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
`;

tabs.forEach(tab => {
  const tabLines = lines.slice(tab.start - 1, tab.end);
  tabLines.shift(); // remove {activeTab === ...
  tabLines.pop(); // remove )}

  const componentContent = imports + "\n" +
"export function " + tab.name + "(props: any) {\n" +
"  const {\n" +
"    activeTab, setActiveTab, overviewFilter, setOverviewFilter, overviewStats,\n" +
"    inscriptions, pendingInscriptionsCount, students, newStudentsCount,\n" +
"    formations, modulesCount, messages, unreadMessagesCount, settings,\n" +
"    users, testimonials, gallery, revenues, smsBalance, validatedInscriptionsCount,\n" +
"    upcomingClasses, setModalTab, startEditModule,\n" +
"    searchTerm, setSearchTerm, filterStatus, setFilterStatus,\n" +
"    setShowConvertModal, setLeadToConvert, updateInscriptionStatus, deleteInscription,\n" +
"    handleDeleteStudent, setEditingStudent, setShowAddStudentModal,\n" +
"    setShowAddModuleModal, setEditingModule, resetModuleForm, confirmDeleteModule,\n" +
"    setShowAddArticleModal, setEditingArticleId, deleteArticle, articles,\n" +
"    setShowAddTestimonialModal, setEditingTestimonialId, deleteTestimonial,\n" +
"    setShowAddMediaModal, setEditingMediaId, deleteMedia,\n" +
"    updateMessageStatus, deleteMessage, handleSaveSettings,\n" +
"    setShowAddUserModal, setEditingUserId, deleteUser, authUser\n" +
"  } = props;\n\n" +
"  return (\n    <>\n" +
tabLines.join('\n') +
"\n    </>\n  );\n}\n";

  fs.writeFileSync(path.join(outDir, tab.name + '.tsx'), componentContent);
});

// Now replace in page.tsx
let newLines = [];
let i = 0;
while (i < lines.length) {
  const lineNum = i + 1;
  const tab = tabs.find(t => t.start === lineNum);
  if (tab) {
    let keyMatch = lines[i].match(/activeTab === "([^"]+)"/);
    let key = keyMatch ? keyMatch[1] : tab.name.toLowerCase().replace('tab', '');
    newLines.push('            {activeTab === "' + key + '" && <' + tab.name + ' {...tabProps} />}');
    i = tab.end; 
  } else {
    newLines.push(lines[i]);
    i++;
  }
}

const tabImports = tabs.map(t => 'import { ' + t.name + ' } from "@/components/admin/tabs/' + t.name + '";').join('\n');
const allImports = tabImports + '\nimport { CourseBuilderTab } from "@/components/admin/tabs/CourseBuilderTab";';

const importIndex = newLines.findIndex(l => l.includes('import '));
newLines.splice(importIndex, 0, allImports);

const returnIndex = newLines.findIndex(l => l.includes('return (') && l.includes('<div className="min-h-screen'));

const tabPropsDef = `
  const tabProps = {
    activeTab, setActiveTab, overviewFilter, setOverviewFilter, overviewStats,
    inscriptions, pendingInscriptionsCount, students, newStudentsCount,
    formations, modulesCount, messages, unreadMessagesCount, settings,
    users, testimonials, gallery, revenues, smsBalance, validatedInscriptionsCount,
    upcomingClasses, setModalTab, startEditModule,
    searchTerm, setSearchTerm, filterStatus, setFilterStatus,
    setShowConvertModal, setLeadToConvert, updateInscriptionStatus, deleteInscription,
    handleDeleteStudent, setEditingStudent, setShowAddStudentModal,
    setShowAddModuleModal, setEditingModule, resetModuleForm, confirmDeleteModule,
    setShowAddArticleModal, setEditingArticleId, deleteArticle, articles,
    setShowAddTestimonialModal, setEditingTestimonialId, deleteTestimonial,
    setShowAddMediaModal, setEditingMediaId, deleteMedia,
    updateMessageStatus, deleteMessage, handleSaveSettings,
    setShowAddUserModal, setEditingUserId, deleteUser, authUser
  };
`;

if (returnIndex !== -1) {
  newLines.splice(returnIndex, 0, tabPropsDef);
} else {
  const altIndex = newLines.findIndex(l => l.includes('return ('));
  newLines.splice(altIndex, 0, tabPropsDef);
}

const usersTabIdx = newLines.findIndex(l => l.includes('activeTab === "users" && <UsersTab'));
if (usersTabIdx !== -1) {
  newLines.splice(usersTabIdx + 1, 0, '            {activeTab === "course-builder" && <CourseBuilderTab setActiveTab={setActiveTab} />}');
}

fs.writeFileSync(pagePath, newLines.join('\n'));
console.log('Extraction complete!');
