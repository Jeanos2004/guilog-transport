"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronRight,
  PlayCircle, FileText, Video, BookOpen, Layers, GripVertical,
  CheckCircle2, AlertCircle, UploadCloud, Clock, Calendar,
  ExternalLink, Eye, EyeOff
} from "lucide-react";
import { studentDb, StudentCourse, CourseModule, CourseSession } from "@/lib/studentDb";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { CldUploadWidget } from "next-cloudinary";

interface Props {
  setActiveTab: (tab: string) => void;
}

const SESSION_TYPES = [
  { value: "video", label: "Vidéo", icon: <Video className="w-3.5 h-3.5" /> },
  { value: "text", label: "Contenu texte", icon: <FileText className="w-3.5 h-3.5" /> },
  { value: "zoom", label: "Session Zoom/Meet", icon: <PlayCircle className="w-3.5 h-3.5" /> },
  { value: "document", label: "Document PDF", icon: <FileText className="w-3.5 h-3.5" /> },
] as const;

const emptySession = (): CourseSession => ({
  id: "s-" + Date.now() + Math.random().toString(36).slice(2),
  title: "Nouvelle séance",
  type: "video",
  orderIndex: 0,
  videoUrl: "",
  content: "",
  date: new Date().toISOString(),
  duration: "1h30",
  location: "",
  meetUrl: "",
  resources: [],
});

const emptyModule = (): CourseModule => ({
  id: "m-" + Date.now() + Math.random().toString(36).slice(2),
  title: "Nouveau module",
  sessions: [emptySession()],
});

const emptyCourse = (): StudentCourse => ({
  id: "",
  title: "",
  category: "",
  description: "",
  duration: "",
  image: "",
  price: 0,
  modules: [emptyModule()],
});

export function CourseBuilderInline({ setActiveTab }: Props) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edition state
  const [editingCourse, setEditingCourse] = useState<StudentCourse | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await studentDb.getCourses();
      setCourses(list);
    } catch (e) {
      setErrorMsg("Erreur lors du chargement des cours.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = () => {
    setEditingCourse(emptyCourse());
    setExpandedModules({});
    setExpandedSessions({});
  };

  const handleEditCourse = (course: StudentCourse) => {
    setEditingCourse(JSON.parse(JSON.stringify(course))); // deep clone
    const exp: Record<string, boolean> = {};
    course.modules.forEach(m => { exp[m.id] = true; });
    setExpandedModules(exp);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Supprimer ce cours définitivement ?")) return;
    await studentDb.deleteCourse(courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    flash("Cours supprimé.", "success");
  };

  const flash = (msg: string, type: "success" | "error") => {
    if (type === "success") { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); }
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 4000); }
  };

  const handleSaveCourse = async () => {
    if (!editingCourse) return;
    if (!editingCourse.title.trim()) return flash("Le titre du cours est obligatoire.", "error");
    if (!editingCourse.id.trim()) {
      const slug = editingCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      editingCourse.id = slug + "-" + Date.now();
    }
    // Re-index orderIndex
    const course = { ...editingCourse };
    course.modules = course.modules.map(mod => ({
      ...mod,
      sessions: mod.sessions.map((s, i) => ({ ...s, orderIndex: i }))
    }));

    setSaving(true);
    try {
      await studentDb.saveCourse(course);
      await loadCourses();
      setEditingCourse(null);
      flash("Cours sauvegardé avec succès !", "success");
    } catch (e) {
      flash("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Module helpers
  const addModule = () => {
    if (!editingCourse) return;
    const m = emptyModule();
    setEditingCourse({ ...editingCourse, modules: [...editingCourse.modules, m] });
    setExpandedModules(prev => ({ ...prev, [m.id]: true }));
  };

  const updateModule = (mIdx: number, patch: Partial<CourseModule>) => {
    if (!editingCourse) return;
    const mods = [...editingCourse.modules];
    mods[mIdx] = { ...mods[mIdx], ...patch };
    setEditingCourse({ ...editingCourse, modules: mods });
  };

  const deleteModule = (mIdx: number) => {
    if (!editingCourse) return;
    const mods = editingCourse.modules.filter((_, i) => i !== mIdx);
    setEditingCourse({ ...editingCourse, modules: mods });
  };

  // Session helpers
  const addSession = (mIdx: number) => {
    if (!editingCourse) return;
    const s = emptySession();
    const mods = [...editingCourse.modules];
    mods[mIdx] = { ...mods[mIdx], sessions: [...mods[mIdx].sessions, s] };
    setEditingCourse({ ...editingCourse, modules: mods });
    setExpandedSessions(prev => ({ ...prev, [s.id]: true }));
  };

  const updateSession = (mIdx: number, sIdx: number, patch: Partial<CourseSession>) => {
    if (!editingCourse) return;
    const mods = [...editingCourse.modules];
    const sessions = [...mods[mIdx].sessions];
    sessions[sIdx] = { ...sessions[sIdx], ...patch };
    mods[mIdx] = { ...mods[mIdx], sessions };
    setEditingCourse({ ...editingCourse, modules: mods });
  };

  const deleteSession = (mIdx: number, sIdx: number) => {
    if (!editingCourse) return;
    const mods = [...editingCourse.modules];
    mods[mIdx] = { ...mods[mIdx], sessions: mods[mIdx].sessions.filter((_, i) => i !== sIdx) };
    setEditingCourse({ ...editingCourse, modules: mods });
  };

  // ─── COURSE LIST VIEW ──────────────────────────────────────────────────────
  if (!editingCourse) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white border border-gray-200 px-6 py-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">Cours Builder</h3>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
              {courses.length} cours créé{courses.length !== 1 ? "s" : ""} · Gérez le contenu pédagogique e-learning
            </p>
          </div>
          <button
            onClick={handleNewCourse}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-primary)] transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouveau cours
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Courses grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mr-3" />
            Chargement des cours...
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center bg-white border border-dashed border-gray-300">
            <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Aucun cours créé. Commencez par en créer un.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white border border-gray-200 shadow-sm overflow-hidden group">
                {/* Course image */}
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10">
                      <BookOpen className="w-10 h-10 text-[var(--color-primary)]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[9px] uppercase font-bold bg-[var(--color-accent)] text-white px-2 py-0.5">
                      {course.category || "Sans catégorie"}
                    </span>
                  </div>
                </div>

                {/* Course info */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-[var(--color-primary)] leading-snug line-clamp-2">{course.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration || "Non définie"}</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules.length} module{course.modules.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="px-3 py-2 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── COURSE EDITOR VIEW ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditingCourse(null)}
            className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-primary)]">
              {editingCourse.id ? `Modifier : ${editingCourse.title || "Sans titre"}` : "Nouveau cours"}
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              {editingCourse.modules.length} module{editingCourse.modules.length !== 1 ? "s" : ""} · {editingCourse.modules.reduce((acc, m) => acc + m.sessions.length, 0)} séance{editingCourse.modules.reduce((acc, m) => acc + m.sessions.length, 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveCourse}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700"><CheckCircle2 className="w-4 h-4" />{successMsg}</div>}
      {errorMsg && <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-red-700"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT: Course Info ───────────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] border-b border-gray-100 pb-3">Informations générales</h4>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Titre du cours *</label>
              <input
                type="text"
                value={editingCourse.title}
                onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                placeholder="Ex: Maîtrise de PowerBI"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Catégorie</label>
              <input
                type="text"
                value={editingCourse.category}
                onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                placeholder="Ex: Analyse des Données"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingCourse.description}
                onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none bg-white resize-none"
                placeholder="Description courte du cours..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Durée totale</label>
                <input
                  type="text"
                  value={editingCourse.duration}
                  onChange={e => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                  placeholder="Ex: 40 heures"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Prix (GNF)</label>
                <input
                  type="number"
                  value={editingCourse.price || ""}
                  onChange={e => setEditingCourse({ ...editingCourse, price: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Image de couverture</label>
              <MediaUploader
                value={editingCourse.image}
                onChange={(url) => setEditingCourse({ ...editingCourse, image: url })}
                label="Uploader une image"
                accept="image"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Modules & Sessions ──────────────────────── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Modules & Séances
            </h4>
            <button
              onClick={addModule}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-accent)] text-[var(--color-accent)] text-[10px] font-bold uppercase hover:bg-[var(--color-accent)] hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter un module
            </button>
          </div>

          {editingCourse.modules.length === 0 && (
            <div className="py-10 text-center bg-white border border-dashed border-gray-300 text-gray-400 text-xs">
              Aucun module. Cliquez sur "Ajouter un module".
            </div>
          )}

          <div className="space-y-3">
            {editingCourse.modules.map((mod, mIdx) => {
              const isModOpen = expandedModules[mod.id] !== false;
              return (
                <div key={mod.id} className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                  {/* Module header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <button
                      type="button"
                      onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !isModOpen }))}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      {isModOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      <Layers className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                      <span className="text-xs font-bold text-[var(--color-primary)]">
                        Module {mIdx + 1} : {mod.title}
                      </span>
                      <span className="ml-auto text-[9px] text-gray-400 font-semibold">
                        {mod.sessions.length} séance{mod.sessions.length !== 1 ? "s" : ""}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteModule(mIdx)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isModOpen && (
                    <div className="p-4 space-y-4">
                      {/* Module title */}
                      <input
                        type="text"
                        value={mod.title}
                        onChange={e => updateModule(mIdx, { title: e.target.value })}
                        className="w-full border border-gray-200 px-3 py-2 text-xs font-bold focus:border-[var(--color-primary)] outline-none bg-gray-50"
                        placeholder="Titre du module"
                      />

                      {/* Sessions */}
                      <div className="space-y-2">
                        {mod.sessions.map((session, sIdx) => {
                          const isSessOpen = expandedSessions[session.id] !== false;
                          const typeInfo = SESSION_TYPES.find(t => t.value === session.type) || SESSION_TYPES[0];
                          return (
                            <div key={session.id} className="border border-gray-200 overflow-hidden">
                              {/* Session header */}
                              <div className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                                <button
                                  type="button"
                                  onClick={() => setExpandedSessions(prev => ({ ...prev, [session.id]: !isSessOpen }))}
                                  className="flex-1 flex items-center gap-2 text-left"
                                >
                                  {isSessOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                  <span className="text-[var(--color-accent)]">{typeInfo.icon}</span>
                                  <span className="text-[10px] font-bold text-gray-700 line-clamp-1">
                                    {sIdx + 1}. {session.title}
                                  </span>
                                  <span className="ml-auto text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 font-semibold uppercase">
                                    {typeInfo.label}
                                  </span>
                                </button>
                                <button
                                  onClick={() => deleteSession(mIdx, sIdx)}
                                  className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Session details */}
                              {isSessOpen && (
                                <div className="px-4 py-3 bg-gray-50 space-y-3 border-t border-gray-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Titre de la séance</label>
                                      <input
                                        type="text"
                                        value={session.title}
                                        onChange={e => updateSession(mIdx, sIdx, { title: e.target.value })}
                                        className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                        placeholder="Titre de la séance"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Type de contenu</label>
                                      <select
                                        value={session.type || "video"}
                                        onChange={e => updateSession(mIdx, sIdx, { type: e.target.value as any })}
                                        className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                      >
                                        {SESSION_TYPES.map(t => (
                                          <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Type-specific fields */}
                                  {(session.type === "video") && (
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">URL de la vidéo</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="url"
                                          value={session.videoUrl || ""}
                                          onChange={e => updateSession(mIdx, sIdx, { videoUrl: e.target.value })}
                                          className="flex-1 border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                          placeholder="https://..."
                                        />
                                      </div>
                                      <div className="mt-2">
                                        <MediaUploader
                                          value={session.videoUrl || ""}
                                          onChange={(url) => updateSession(mIdx, sIdx, { videoUrl: url })}
                                          label="Uploader une vidéo"
                                          accept="video"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {session.type === "zoom" && (
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Lien Zoom / Google Meet</label>
                                      <input
                                        type="url"
                                        value={session.meetUrl || ""}
                                        onChange={e => updateSession(mIdx, sIdx, { meetUrl: e.target.value })}
                                        className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                        placeholder="https://zoom.us/j/..."
                                      />
                                    </div>
                                  )}

                                  {session.type === "text" && (
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Contenu de la leçon</label>
                                      <textarea
                                        rows={4}
                                        value={session.content || ""}
                                        onChange={e => updateSession(mIdx, sIdx, { content: e.target.value })}
                                        className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white resize-none"
                                        placeholder="Contenu textuel de la leçon..."
                                      />
                                    </div>
                                  )}

                                  {session.type === "document" && (
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">URL du document PDF</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="url"
                                          value={session.videoUrl || ""}
                                          onChange={e => updateSession(mIdx, sIdx, { videoUrl: e.target.value })}
                                          className="flex-1 border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                          placeholder="https://..."
                                        />
                                      </div>
                                      <div className="mt-2">
                                        <MediaUploader
                                          value={session.videoUrl || ""}
                                          onChange={(url) => updateSession(mIdx, sIdx, { videoUrl: url })}
                                          label="Uploader un document PDF"
                                          accept="document"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Date, Duration, Location (Conditional based on type) */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Date - Only needed for Zoom/Live sessions */}
                                    {session.type === "zoom" && (
                                      <div>
                                        <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Date</label>
                                        <input
                                          type="datetime-local"
                                          value={session.date ? session.date.slice(0, 16) : ""}
                                          onChange={e => updateSession(mIdx, sIdx, { date: new Date(e.target.value).toISOString() })}
                                          className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Duration - Useful for Video and Zoom */}
                                    {(session.type === "zoom" || session.type === "video") && (
                                      <div>
                                        <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Durée</label>
                                        <input
                                          type="text"
                                          value={session.duration || ""}
                                          onChange={e => updateSession(mIdx, sIdx, { duration: e.target.value })}
                                          className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                          placeholder="Ex: 1h30"
                                        />
                                      </div>
                                    )}

                                    {/* Location - Only needed for Zoom/Live sessions */}
                                    {session.type === "zoom" && (
                                      <div>
                                        <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Lieu / Salle</label>
                                        <input
                                          type="text"
                                          value={session.location || ""}
                                          onChange={e => updateSession(mIdx, sIdx, { location: e.target.value })}
                                          className="w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] outline-none bg-white"
                                          placeholder="Ex: Salle A / En ligne"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add session button */}
                      <button
                        type="button"
                        onClick={() => addSession(mIdx)}
                        className="w-full border-2 border-dashed border-gray-200 py-2 text-[10px] font-bold text-gray-400 uppercase hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter une séance
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
