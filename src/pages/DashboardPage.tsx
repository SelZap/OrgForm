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
      
      {/* Banner */}
      <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-[9px] bg-gray-150 text-gray-700 border border-gray-300 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider">
            Workspace Hub Active
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] mt-3 select-none">Welcome to OrgForm</h1>
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
            Replace legacy external questionnaires with beautiful Native Forms, automated Facebook publishing channels, structured review pipelines, and unified responder broadcasts. Use the test bench role-switcher above to test different organizational permissions.
          </p>
        </div>
      </div>

      {/* Analytics Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-gray-200 p-5 rounded flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-gray-50 text-gray-700 rounded border border-gray-155">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase font-mono">Active Forms</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{activeFormsCount}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-gray-50 text-gray-700 rounded border border-gray-155">
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase font-mono">Draft Layouts</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{draftFormsCount}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-gray-50 text-gray-700 rounded border border-gray-155">
            <BarChart className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase font-mono">Pending Review</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{pendingFormsCount}</div>
          </div>
        </div>

        {/* Quick button */}
        <div className="bg-white border border-gray-200 p-5 rounded flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-gray-450 tracking-wider uppercase font-mono">Operations</div>
          <button
            onClick={() => navigate("post")}
            className="flex items-center justify-center gap-1.5 mt-3 w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-3 text-xs rounded transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Compose Announcement</span>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono">Bulletin Feed Announcements</h3>
            
            {/* Category selection pill blocks */}
            <div className="flex flex-wrap items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded border transition-colors ${
                    selectedCategory === cat
                      ? "bg-black text-white font-bold border-black"
                      : "bg-white text-gray-500 hover:text-black border-gray-300"
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
                  <div key={post.id} className="bg-white border border-gray-200 rounded p-5 hover:border-gray-400 transition-colors shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-gray-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${catClass}`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span>{post.category.toUpperCase()}</span>
                        </span>
                        <span className="text-gray-400">by</span>
                        <span className="font-semibold text-gray-800">{post.authorName}</span>
                        <span className="text-[10px] bg-gray-100 font-mono text-gray-500 px-1.5 py-0.2 rounded">
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
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-gray-500" />
                          <div className="text-left">
                            <div className="text-xs font-bold text-gray-800 font-sans">Attached Registration Form</div>
                            <div className="text-[10px] text-gray-400">No organizational hierarchy access details needed to view.</div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("respond", post.attachedFormId)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-semibold rounded transition-colors cursor-pointer"
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
          
          <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest font-mono mb-3">Hot Forms Pipeline</h3>
            <div className="space-y-3">
              {forms.filter(f => f.status === "PUBLISHED").slice(0, 4).map((form) => {
                return (
                  <div key={form.id} className="bg-gray-50 p-3 rounded border border-gray-150 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-800 truncate">{form.title}</div>
                      <div className="text-[10px] text-gray-400">by {form.creatorName}</div>
                    </div>
                    <button
                      onClick={() => navigate("respond", form.id)}
                      className="px-2 py-1 text-[10px] font-bold text-black border border-gray-300 rounded hover:bg-gray-100 bg-white shadow-sm cursor-pointer"
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

          <div className="bg-white border border-gray-200 p-5 rounded text-center shadow-sm">
            <Megaphone className="w-6 h-6 text-gray-400 mx-auto mb-2" />
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
