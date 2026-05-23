/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../utils/AppContext";
import { PostCategory } from "../types";
import { Megaphone, FileText, Landmark, Handshake, HeartHandshake, Eye, BarChart, Calendar, HelpCircle, FileSpreadsheet, PlusCircle, CheckCircle2 } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { posts, forms, navigate, currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Object.values(PostCategory)];

  const categoryIcons: Record<string, any> = {
    Announcement: Megaphone,
    Proposal: FileText,
    Sponsorship: Landmark,
    Advocate: Handshake,
    Suggestion: HelpCircle,
    Opinion: HeartHandshake,
    Survey: FileSpreadsheet,
  };

  const categoryColors: Record<string, string> = {
    Announcement: "bg-amber-50 text-amber-700 border-amber-200",
    Proposal: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Sponsorship: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Advocate: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    Suggestion: "bg-sky-50 text-sky-700 border-sky-200",
    Opinion: "bg-violet-50 text-violet-700 border-violet-200",
    Survey: "bg-teal-50 text-teal-700 border-teal-200",
  };

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

  const activeFormsCount = forms.filter((f) => f.status === "PUBLISHED").length;
  const draftFormsCount = forms.filter((f) => f.status === "DRAFT").length;
  const pendingFormsCount = forms.filter((f) => f.status === "REVIEW_PENDING").length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Dynamic Welcome Hero Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white">
        <div className="absolute top-0 right-0 p-4 opacity-10 select-none text-7xl font-mono text-indigo-900 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="35" cy="45" r="5" fill="currentColor" />
            <circle cx="65" cy="45" r="5" fill="currentColor" />
            <path d="M 45 60 Q 50 64 55 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="25" r="8" stroke="currentColor" strokeWidth="2" />
            <circle cx="80" cy="25" r="8" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-950 border border-indigo-200 rounded-lg font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
            Active Space: {currentUser.role === "LEAD" ? "Principal HQ Panel" : currentUser.role === "MEMBER" ? "Student Bulletin Desk" : "Creator Creative Desk"}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 select-none flex items-center gap-2">
            MomoForms Workspace Hub
          </h1>
          <p className="text-gray-500 text-xs leading-relaxed font-sans">
            Streamline legacy questionnaires and disconnected spreadsheets with cohesive **Native Questionnaires**, automated simulated SMTP alerts, and instant Facebook Graph announcements. Toggle identities instantly or invite colleagues with raw subaccount directory tags below!
          </p>
        </div>
      </div>

      {/* Analytics Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-gray-200 hover:border-emerald-450 p-5 rounded-2xl flex items-center gap-4 shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 tracking-wider uppercase font-mono leading-none">Published Gates</div>
            <div className="text-2xl font-black text-gray-950 mt-1">{activeFormsCount} <span className="text-[11px] text-gray-400 font-semibold">Active</span></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 hover:border-indigo-400 p-5 rounded-2xl flex items-center gap-4 shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-150">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 tracking-wider uppercase font-mono leading-none">Draft Blueprints</div>
            <div className="text-2xl font-black text-gray-950 mt-1">{draftFormsCount} <span className="text-[11px] text-gray-400 font-semibold">Saved</span></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 hover:border-red-400 p-5 rounded-2xl flex items-center gap-4 shadow-2xs hover:shadow-xs transition-all duration-200">
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-155">
            <BarChart className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 tracking-wider uppercase font-mono leading-none">Administrative Reviews</div>
            <div className="text-2xl font-black text-gray-950 mt-1">{pendingFormsCount} <span className="text-[11px] text-red-500 font-bold">Pending</span></div>
          </div>
        </div>

        {/* Quick button */}
        <div className="bg-indigo-50 border border-indigo-200 p-4.5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="text-[9.5px] font-mono font-black text-indigo-900 uppercase">Interactive Bulletin</div>
          <button
            onClick={() => navigate("post")}
            className="flex items-center justify-center gap-1.5 mt-2.5 w-full bg-indigo-600 hover:bg-indigo-700/90 focus:ring-1 focus:ring-indigo-400 text-white font-bold py-2 px-3 text-xs rounded-xl transition-all duration-150 cursor-pointer shadow-xs border border-indigo-400/50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Live Updates 📋</span>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono">Bulletin Feed Announcements</h3>
            
            {/* Category selection pill blocks */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10.5px] px-3 py-1 rounded-full transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white font-bold border-indigo-600 shadow-2xs"
                      : "bg-white text-gray-500 hover:text-indigo-950 hover:bg-indigo-50/50 border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-400 shadow-sm">
                No bulletin boards match the selected filter category index.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const CategoryIcon = categoryIcons[post.category] || Megaphone;
                const catClass = categoryColors[post.category] || "bg-gray-100 text-gray-600 border-gray-200";
                
                return (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-400/70 hover:shadow-xs transition-all shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-gray-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded-lg border ${catClass}`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span>{post.category.toUpperCase()}</span>
                        </span>
                        <span className="text-gray-400">by</span>
                        <span className="font-semibold text-gray-800">{post.authorName}</span>
                        <span className="text-[10px] bg-indigo-50/50 font-mono text-indigo-850 px-1.5 py-0.5 rounded-md border border-indigo-100">
                          {post.authorRole}
                        </span>
                      </div>
                      <span className="text-gray-400 text-[10px] font-mono">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{post.title}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">{post.content}</p>

                    {/* Attachment forms linkages */}
                    {post.attachedFormId && (
                      <div className="mt-4 p-3.5 bg-indigo-50/20 border border-indigo-100/60 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                          <div className="text-left">
                            <div className="text-xs font-bold text-gray-805 font-sans">Attached Registration Form</div>
                            <div className="text-[10px] text-gray-400">No organizational hierarchy access details needed to view.</div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("respond", post.attachedFormId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50/60 text-indigo-950 border border-gray-300 hover:border-indigo-300 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-3xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Live Form</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column Stats & Quick Access */}
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-widest font-mono mb-3">Hot Forms Pipeline</h3>
            <div className="space-y-3">
              {forms.filter(f => f.status === "PUBLISHED").slice(0, 4).map((form) => {
                return (
                  <div key={form.id} className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-3 shadow-3xs">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{form.title}</div>
                      <div className="text-[10px] text-gray-400">by {form.creatorName}</div>
                    </div>
                    <button
                      onClick={() => navigate("respond", form.id)}
                      className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 border border-indigo-200 hover:border-indigo-400 rounded-lg hover:bg-indigo-50/50 bg-white shadow-3xs cursor-pointer transition-all"
                    >
                      Fill Form
                    </button>
                  </div>
                );
              })}
              {forms.filter(f => f.status === "PUBLISHED").length === 0 && (
                <div className="text-xs text-gray-400 text-center py-4 font-sans">No published templates accepting entries yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-center shadow-sm bg-gradient-to-br from-indigo-50/10 via-white to-purple-50/10">
            <Megaphone className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-gray-800 font-mono uppercase tracking-wider">Student Council Notice</h4>
            <p className="text-[11px] text-gray-500 leading-normal mt-1.5">
              Remember that only Form Facilitators have permission to access private respondent answers. Lead Members can approve forms or assign member permissions on the dashboard.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
