/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../utils/AppContext";
import { FormTemplate, Role, FormStatus } from "../types";
import { CheckCircle2, AlertTriangle, RefreshCw, MessageSquare, ShieldAlert, Eye, MessageCircle, FileText } from "lucide-react";

export const FormProposalsPage: React.FC = () => {
  const { forms, currentUser, fetchForms, showNotification, navigate } = useApp();
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [commentText, setCommentText] = useState("");

  // Role check
  if (currentUser.role !== Role.LEAD) {
    return (
      <div className="bg-white border border-gray-200 rounded p-8 text-center max-w-md mx-auto space-y-4 shadow-sm mt-8">
        <ShieldAlert className="w-10 h-10 text-red-650 mx-auto" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-gray-900">Access Restricted</h3>
        <p className="text-xs text-gray-500 leading-normal">
          Only Lead Members possess administrative privilege keys to review submitted form proposals.
        </p>
      </div>
    );
  }

  const reviewQueue = forms.filter((f) => [FormStatus.REVIEW_PENDING, FormStatus.REVISION_PENDING].includes(f.status));

  const handleReviewAction = async (action: "PUBLISH" | "REVISION" | "REJECT") => {
    if (!selectedForm) return;

    try {
      const res = await fetch(`/api/forms/${selectedForm.id}/review`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          comment: commentText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        const actionLabel = action === "PUBLISH" ? "Approved & Published" : action === "REVISION" ? "Revision Requested" : "Rejected";
        showNotification("success", `Proposal successfully status updated: ${actionLabel}`);
        setSelectedForm(null);
        setCommentText("");
        fetchForms();
      }
    } catch (err: any) {
      showNotification("error", "Review submission failed: " + err.message);
    }
  };

  return (
    <div className="font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] select-none font-sans">Form Proposals Review</h2>
          <p className="text-gray-500 text-xs mt-1">Approve draft form templates, flag revisions with comments, or review creator appeal request tags.</p>
        </div>
        <button
          onClick={() => navigate("dashboard")}
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-750 text-xs font-semibold rounded cursor-pointer transition-colors"
        >
          ← Exit to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column queue list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">Active Queue Proposals: {reviewQueue.length}</div>
          
          <div className="space-y-3">
            {reviewQueue.map((form) => {
              const isActive = selectedForm?.id === form.id;
              const hasAppeal = form.comments.some((c) => c.text.toLowerCase().includes("appeal"));

              return (
                <button
                  key={form.id}
                  onClick={() => {
                    setSelectedForm(form);
                    setCommentText("");
                  }}
                  className={`w-full text-left p-4 rounded border transition-colors flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? "bg-white border-black shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${
                        form.status === FormStatus.REVIEW_PENDING
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {form.status.replace("_", " ")}
                      </span>
                      {hasAppeal && (
                        <span className="text-[9px] bg-red-50 text-red-750 border border-red-200 px-1.5 py-0.2 rounded font-bold font-mono">
                          Appealed
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-gray-950 line-clamp-1">{form.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{form.description}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-gray-100 text-[9px] font-mono text-gray-400 flex justify-between">
                    <span>Creator: {form.creatorName}</span>
                    <span>Fields: {form.fields.length}</span>
                  </div>
                </button>
              );
            })}

            {reviewQueue.length === 0 && (
              <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-400 text-xs shadow-sm">
                No templates currently awaiting review. Great job!
              </div>
            )}
          </div>
        </div>

        {/* Right Column details viewer and actions */}
        <div className="lg:col-span-2">
          {selectedForm ? (
            <div className="bg-white border border-gray-200 rounded p-6 space-y-6 shadow-sm">
              
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded">
                  Submitted Specification Review
                </span>
                <h3 className="text-sm font-bold text-gray-900 mt-3">{selectedForm.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{selectedForm.description}</p>
                <div className="text-[10px] font-mono text-gray-400 mt-2">
                  Creator: <span className="text-gray-755 font-semibold">{selectedForm.creatorName}</span> | Format: {selectedForm.isPublic ? "Public Facebook Announcement" : "Private Local Org"}
                </div>
              </div>

              {/* Questions preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-450 font-mono uppercase">Template Fields List:</h4>
                <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-200">
                  {selectedForm.fields.map((field, idx) => (
                    <div key={field.id} className="text-xs flex items-start gap-3 pb-2.5 border-b border-gray-200 last:border-0 last:pb-0">
                      <span className="text-[10px] bg-white border border-gray-200 font-mono font-bold text-gray-500 px-1.5 py-0.5 rounded shrink-0">
                        {idx + 1}
                      </span>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-gray-805">
                          {field.label} {field.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 uppercase font-mono">
                          Type: {field.type} {field.placeholder ? `| Hint: "${field.placeholder}"` : ""}
                        </div>
                        {field.options && field.options.length > 0 && (
                           <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {field.options.map((opt, oIdx) => (
                              <span key={oIdx} className="text-[9px] font-mono bg-white border border-gray-200 text-gray-500 rounded px-1.5 py-0.5">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Discussion timeline comments logs */}
              {selectedForm.comments && selectedForm.comments.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 font-mono uppercase flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    <span>Previous Comments History</span>
                  </h4>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {selectedForm.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-2.5 rounded border border-gray-210 text-xs text-sans">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mb-1">
                          <span className="text-gray-700 font-bold">{comment.authorName} ({comment.authorRole})</span>
                          <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-600 font-mono leading-relaxed whitespace-pre-line">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action and feedback inputs */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase">Review Comment / revision Directives</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 text-gray-800 text-xs p-2.5 rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                  placeholder="e.g. Please change question 3 selection choices or refine placeholders. Approved on revision."
                />

                <div className="flex flex-wrap justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => handleReviewAction("REJECT")}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs rounded transition-colors cursor-pointer"
                  >
                    Reject Template
                  </button>
                  <button
                    onClick={() => handleReviewAction("REVISION")}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-xs rounded transition-colors cursor-pointer"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleReviewAction("PUBLISH")}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded transition-colors cursor-pointer shadow-sm"
                  >
                    Approve and Publish
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded p-12 text-center text-gray-400 text-xs h-full flex flex-col items-center justify-center shadow-sm">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <span>Select a questionnaire proposal from the left list block to begin administrative investigations.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
