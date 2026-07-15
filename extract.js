const fs = require('fs');

const pageContent = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');
const lines = pageContent.split('\n');

const overviewStart = lines.findIndex(line => line.includes('{activeTab === "overview" && ('));
const overviewEnd = lines.findIndex((line, index) => index > overviewStart && line.includes('{activeTab === "inscriptions" && ('));

const overviewCode = lines.slice(overviewStart + 1, overviewEnd).join('\n');

// Clean up the trailing parentheses
const cleanOverviewCode = overviewCode.replace(/}\s*$/, '');

const component = `"use client";
import { useState } from "react";
import { 
  Users, Activity, GraduationCap, DollarSign, BookOpen, ClipboardList, Mail, MapPin, 
  Search, Filter, Plus, FileText, ChevronRight, CheckCircle2, XCircle, Clock, Check
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";

export function OverviewTab({
  overviewFilter, setOverviewFilter,
  revenue, newStudentsCount, enrollmentsCount, chartData, fPayments,
  inscriptions, messages, students
}: any) {
  return (
    <>
      ${cleanOverviewCode}
    </>
  );
}
`;

fs.writeFileSync('components/admin/tabs/OverviewTab.tsx', component);
console.log('OverviewTab generated!');
