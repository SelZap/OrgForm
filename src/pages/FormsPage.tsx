/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../utils/AppContext";
import { FormTemplate, FormStatus, Role } from "../types";
import { FormBuilderUI } from "../components/FormBuilderUI";
import { FilePlus2, Eye, Edit3, Settings, Users, History, AlertTriangle, FileCheck, RefreshCw, Send, CheckCircle2, ChevronRight, Share2, Clipboard } from "lucide-react";

export const FormsPage: React.FC = () => {
  const { forms, currentUser, allUsers, fetchForms, navigate, showNotification } = useApp();
  
  // Builder panel toggles
  const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Status Filter tabs
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Lead quick inline review comment
  const [adminReviewFormId, setAdminReviewFormId] = useState<string | null>(null);
  const [adminReviewComment, setAdminReviewComment] = useState("");

  // New Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newSocialMediaCaption, setNewSocialMediaCaption] = useState("");
  const [newFields, setNewFields] = useState<any[]>([]);

  // Collaboration dialog states
  const [invitingFormId, setInvitingFormId] = useState<string | null>(null);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState("");

  // History dialog state
  const [historyForm, setHistoryForm] = useState<FormTemplate | null>(null);

  // Appeal input state
  const [appealingForm, setAppealingForm] = useState<FormTemplate | null>(null);
  const [appealNote, setAppealNote] = useState("");

  const handleStartCreate = () => {
    setNewTitle("New Registrations Template Layout");
    setNewDesc("Describe expectations or deadlines here.");
    setNewIsPublic(true);
    setNewSocialMediaCaption("");
    setNewFields([]);
    setIsCreating(true);
    setEditingForm(null);
  };

  const handleSaveCreate = async () => {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          isPublic: newIsPublic,
          socialMediaCaption: newSocialMediaCaption,
          fields: newFields,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `Standard draft "${data.title}" successfully compiled!`);
        setIsCreating(false);
        fetchForms();
      }
    } catch (e: any) {
      showNotification("error", e.message || "Failed creating form.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingForm) return;
    try {
      const res = await fetch(`/api/forms/${editingForm.id}`, {
        method: "PUT",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingForm.title,
          description: editingForm.description,
          isPublic: editingForm.isPublic,
          socialMediaCaption: editingForm.socialMediaCaption || "",
          fields: editingForm.fields,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `Form template updates applied securely.`);
        setEditingForm(null);
        fetchForms();
      }
    } catch (e: any) {
      showNotification("error", e.message || "Failed updating form.");
    }
  };

  const handleAdminReviewSubmit = async (fId: string, action: "PUBLISH" | "REVISION" | "REJECT") => {
    try {
      const res = await fetch(`/api/forms/${fId}/review`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          comment: adminReviewComment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        const labels = { PUBLISH: "Approved & Published", REVERSION: "Revision Requested", REJECT: "Rejected" } as any;
        showNotification("success", `Review status changed: ${labels[action] || action}`);
        setAdminReviewFormId(null);
        setAdminReviewComment("");
        fetchForms();
      }
    } catch (err: any) {
      showNotification("error", "Review fail: " + err.message);
    }
  };

  const submitForReview = async (form: FormTemplate) => {
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REVIEW_PENDING" }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `Form "${form.title}" submitted to administrative reviews queue!`);
        fetchForms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!invitingFormId || !selectedCollaboratorId) return;
    const form = forms.find((f) => f.id === invitingFormId);
    if (!form) return;

    const currentCollaborators = form.collaborators || [];
    if (currentCollaborators.includes(selectedCollaboratorId)) {
      showNotification("error", "User is already an active collaborator.");
      setInvitingFormId(null);
      return;
    }

    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collaborators: [...currentCollaborators, selectedCollaboratorId],
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `Collaborator assigned to Form successfully.`);
        setInvitingFormId(null);
        fetchForms();
      }
    } catch (e: any) {
      showNotification("error", e.message || "Failed inviting contributor.");
    }
  };

  const handleFileAppeal = async () => {
    if (!appealingForm || !appealNote.trim()) return;
    try {
      const res = await fetch(`/api/forms/${appealingForm.id}/appeal`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appealNote }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", "Appeal successfully dispatched to Lead Members.");
        setAppealingForm(null);
        setAppealNote("");
        fetchForms();
      }
    } catch (e: any) {
      showNotification("error", e.message || "Appeal dispatch failed.");
    }
  };

  const copyRespondentLink = (formId: string) => {
    const origin = window.location.origin;
    // Direct link to respondent page
    const link = `${origin}/#respond-${formId}`; // Or custom SPA safe anchor
    // To make sure they can navigate, let's give them a clean workspace link
    const absoluteLink = `${origin}/?formId=${formId}`;
    navigator.clipboard.writeText(absoluteLink);
    showNotification("success", "Respondent workspace share link copied dynamically!");
  };

  // Status badges decoration helper
  const renderStatusBadge = (status: FormStatus) => {
    switch (status) {
      case FormStatus.PUBLISHED:
        return <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded uppercase">Published</span>;
      case FormStatus.DRAFT:
        return <span className="text-[10px] font-bold font-mono bg-gray-100 text-gray-600 border border-gray-250 px-2 py-0.5 rounded uppercase">Draft</span>;
      case FormStatus.REVIEW_PENDING:
        return <span className="text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-250 px-2 py-0.5 rounded uppercase">Pending Review</span>;
      case FormStatus.REVISION_PENDING:
        return <span className="text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-250 px-2 py-0.5 rounded uppercase">Requires Revision</span>;
      case FormStatus.REJECTED:
        return <span className="text-[10px] font-bold font-mono bg-red-50 text-red-650 border border-red-250 px-2 py-0.5 rounded uppercase">Rejected</span>;
    }
  };

  return (
    <div className="font-sans space-y-6">
      
      {/* Forms Main Dashboard View (Only visible when not building or editing) */}
      {!isCreating && !editingForm && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] select-none">Forms Database Manager</h2>
              <p className="text-gray-500 text-xs mt-1">Review active, pending, or rejected organizational questionnaire blueprints.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("dashboard")}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-750 text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                ← Exit to Dashboard
              </button>

              {/* Create Action gated to Creators and Leads */}
              {[Role.CREATOR, Role.LEAD].includes(currentUser.role) && (
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 text-xs rounded shadow-sm transition-colors cursor-pointer"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Create Form Template</span>
                </button>
              )}
            </div>
          </div>

          {/* Status filter selection tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-indigo-50/20 p-1.5 rounded-full border border-indigo-100/60 max-w-max">
            {["All", "Drafts", "In Review", "Required Revision", "Published", "Rejected"].map((tab) => {
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-605 bg-indigo-600 text-white shadow-2xs"
                      : "text-gray-500 hover:bg-indigo-50/50 hover:text-indigo-950"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.filter((form) => {
              if (statusFilter === "All") return true;
              if (statusFilter === "Drafts") return form.status === FormStatus.DRAFT;
              if (statusFilter === "In Review") return form.status === FormStatus.REVIEW_PENDING;
              if (statusFilter === "Required Revision") return form.status === FormStatus.REVISION_PENDING;
              if (statusFilter === "Published") return form.status === FormStatus.PUBLISHED;
              if (statusFilter === "Rejected") return form.status === FormStatus.REJECTED;
              return true;
            }).map((form) => {
              // Permission validations:
              const isCreator = form.creatorId === currentUser.id;
              const isCollaborator = form.collaborators && form.collaborators.includes(currentUser.id);
              const isLead = currentUser.role === Role.LEAD;
              const isFacilitator = currentUser.role === Role.FACILITATOR;

              const canEdit = (isCreator || isCollaborator || isLead) && form.status !== FormStatus.PUBLISHED;
              const canInvite = isCreator && [FormStatus.DRAFT, FormStatus.REVISION_PENDING].includes(form.status);

              return (
                <div key={form.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2.5 mb-3">
                      {renderStatusBadge(form.status)}
                      <span className="text-[10px] font-mono font-bold text-gray-400">
                        {form.fields.length} field{form.fields.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-950 line-clamp-1">{form.title}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{form.description}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] font-mono flex items-center justify-between text-gray-450">
                      <span>Created by: <span className="text-indigo-950 font-bold">{form.creatorName}</span></span>
                      <span className="text-indigo-650 bg-indigo-50 px-1.5 py-0.2 rounded-full font-bold text-[8.5px] tracking-wider border border-indigo-100 uppercase">{form.isPublic ? "PUBLIC FEED" : "PRIVATE HUB"}</span>
                    </div>

                    {/* Displays collaborator count */}
                    {form.collaborators && form.collaborators.length > 0 && (
                      <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{form.collaborators.length} collaborators invited</span>
                      </div>
                    )}

                    {/* Comments block display if present */}
                    {form.comments && form.comments.length > 0 && (
                      <div className="mt-3 bg-indigo-50/40 border border-indigo-150 p-3 rounded-xl text-left space-y-1">
                        <span className="text-[9px] font-extrabold text-indigo-900 font-mono uppercase block">Latest Review Feedback:</span>
                        {form.comments.slice(-2).map((com) => (
                          <div key={com.id} className="text-[10px] text-gray-700 font-sans leading-normal">
                            <span className="font-semibold text-gray-900">{com.authorName} ({com.authorRole}):</span> {com.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                    {/* Share respondents interface */}
                    {form.status === FormStatus.PUBLISHED && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyRespondentLink(form.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-bold rounded hover:text-black transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Respondent Link</span>
                        </button>
                        <button
                          onClick={() => navigate("respond", form.id)}
                          className="px-2.5 py-1.5 bg-white text-gray-700 border border-gray-300 hover:text-black hover:bg-gray-50 rounded transition-colors cursor-pointer"
                          title="Open Form Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Action Panel Buttons based on Roles */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      
                      {/* Edit actions */}
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingForm(form);
                            setIsCreating(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-black hover:bg-gray-800 text-white text-[10px] font-bold rounded transition-colors cursor-pointer shadow-sm"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit template</span>
                        </button>
                      )}

                      {/* Launch submission reviews if Creator */}
                      {isCreator && form.status === FormStatus.DRAFT && (
                        <button
                          onClick={() => submitForReview(form)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-black hover:bg-gray-800 text-white text-[10px] font-bold rounded transition-colors cursor-pointer shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit for Review</span>
                        </button>
                      )}

                      {/* Display response statistics gating (Facilitators and Leads only!) */}
                      {(isFacilitator || isLead) && form.status === FormStatus.PUBLISHED && (
                        <button
                          onClick={() => navigate("responses", form.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white text-gray-800 hover:text-black hover:bg-gray-50 text-[11px] font-bold rounded border border-gray-300 transition-colors cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-gray-500" />
                          <span>Inspect Responses</span>
                        </button>
                      )}

                      {/* Collaboration triggering */}
                      {canInvite && (
                        <button
                          onClick={() => {
                            setInvitingFormId(form.id);
                            setSelectedCollaboratorId("");
                          }}
                          className="p-1 px-1.5 bg-white hover:bg-gray-50 text-gray-500 border border-gray-300 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Invite Creator"
                        >
                          <Users className="w-3 h-3 text-gray-500" />
                          <span>Invite</span>
                        </button>
                      )}

                      {/* Audit log trail timeline */}
                      <button
                        onClick={() => setHistoryForm(form)}
                        className="p-1 px-1.5 bg-white hover:bg-gray-50 text-gray-500 border border-gray-300 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Audit history"
                      >
                        <History className="w-3 h-3 text-gray-500" />
                        <span>History</span>
                      </button>

                      {/* Appeal rejected template */}
                      {isCreator && form.status === FormStatus.REJECTED && (
                        <button
                          onClick={() => setAppealingForm(form)}
                          className="w-full flex items-center justify-center gap-1.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Appeal Rejection</span>
                        </button>
                      )}

                    </div>

                    {/* Gated Lead Comment / Status updates panel directly underneath */}
                    {isLead && (
                      <div className="w-full pt-1">
                        <button
                          onClick={() => {
                            setAdminReviewFormId(adminReviewFormId === form.id ? null : form.id);
                            setAdminReviewComment("");
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer"
                        >
                          🛡️ {adminReviewFormId === form.id ? "Close Lead Review Control" : "Review Proposal"}
                        </button>
                        
                        {adminReviewFormId === form.id && (
                          <div className="mt-2 bg-gray-50 border border-gray-200 p-3 rounded space-y-2 text-left">
                            <label className="block text-[9px] font-bold text-gray-400 font-mono uppercase">Review Suggestions / Comments</label>
                            <textarea
                              value={adminReviewComment}
                              onChange={(e) => setAdminReviewComment(e.target.value)}
                              className="w-full p-2 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-black focus:outline-none"
                              placeholder="Specify required revisions, comments, or reasons..."
                              rows={2}
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleAdminReviewSubmit(form.id, "REJECT")}
                                className="px-2 py-1 bg-red-600 text-white text-[9px] font-bold rounded cursor-pointer hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAdminReviewSubmit(form.id, "REVISION")}
                                className="px-2 py-1 bg-amber-500 text-white text-[9px] font-bold rounded cursor-pointer hover:bg-amber-600 transition-colors"
                              >
                                Revision
                              </button>
                              <button
                                onClick={() => handleAdminReviewSubmit(form.id, "PUBLISH")}
                                className="px-2.5 py-1 bg-black text-white text-[9px] font-bold rounded cursor-pointer hover:bg-gray-800 transition-colors"
                              >
                                Publish Approve
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
            {forms.length === 0 && (
              <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-405 font-sans">
                No templates uploaded catalogued. Use standard switch tool or add templates.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATION WORKSPACE FORMS BUILDER */}
      {isCreating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400">BUILD MODE WORKSPACE</span>
              <h3 className="text-base font-bold text-gray-900">Establish Questionnaire Blueprint</h3>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-black rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5"
            >
              ← Cancel & Return to Database
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">Form Blueprint Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                  placeholder="e.g., Annual Hackathon Signup Sheet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1 font-semibold text-left">Publish Type Scope</label>
                <select
                  value={newIsPublic ? "true" : "false"}
                  onChange={(e) => setNewIsPublic(e.target.value === "true")}
                  className="w-full bg-white border border-gray-300 text-gray-750 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="true">Public API (Publish Auto Facebook)</option>
                  <option value="false">Private Local Org Only</option>
                </select>
              </div>
            </div>

            {newIsPublic && (
              <div className="bg-indigo-50/45 border border-indigo-100 p-4 rounded space-y-1.5">
                <label className="block text-[10px] font-bold text-indigo-700 font-mono tracking-wider uppercase">Facebook Posting Caption Automation</label>
                <p className="text-[10px] text-gray-500 font-sans">
                  The caption message below is drafted automatically to be posted with the form link to the organization's linked Facebook Page when a Lead Member approves and publishes it.
                </p>
                <textarea
                  value={newSocialMediaCaption}
                  onChange={(e) => setNewSocialMediaCaption(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-indigo-200 text-gray-800 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-indigo-400 focus:outline-none"
                  placeholder="e.g. Register today for our grand annual event! Slots are limited. #StudentMovement #OrgForm"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">Form Header Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-300 text-gray-750 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="Give clear direction regarding subheadings or requirements."
              />
            </div>

            <FormBuilderUI
              fields={newFields}
              onFieldsChange={(f) => setNewFields(f)}
              title={newTitle}
              onTitleChange={(t) => setNewTitle(t)}
              description={newDesc}
              onDescriptionChange={(d) => setNewDesc(d)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded cursor-pointer"
              >
                Cancel Draft
              </button>
              <button
                type="button"
                onClick={handleSaveCreate}
                className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded shadow-sm cursor-pointer"
              >
                Compile Draft Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITING WORKSPACE PANEL */}
      {editingForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400">EDIT WORKSPACE: {editingForm.id}</span>
              <h3 className="text-base font-bold text-gray-900">Refine Template Settings</h3>
            </div>
            <button
              onClick={() => setEditingForm(null)}
              className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-black rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5"
            >
              ← Discard & Return to Database
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={editingForm.title}
                  onChange={(e) => setEditingForm({ ...editingForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-905 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">Scope Settings</label>
                <select
                  value={editingForm.isPublic ? "true" : "false"}
                  onChange={(e) => setEditingForm({ ...editingForm, isPublic: e.target.value === "true" })}
                  className="w-full bg-white border border-gray-300 text-gray-750 px-3 py-2 text-xs rounded focus:ring-1 focus:focus-ring-black focus:border-black"
                >
                  <option value="true">Public API (Post on Facebook)</option>
                  <option value="false">Private local only</option>
                </select>
              </div>
            </div>

            {editingForm.isPublic && (
              <div className="bg-indigo-50/45 border border-indigo-100 p-4 rounded space-y-1.5">
                <label className="block text-[10px] font-bold text-indigo-700 font-mono tracking-wider uppercase">Facebook Posting Caption Automation</label>
                <textarea
                  value={editingForm.socialMediaCaption || ""}
                  onChange={(e) => setEditingForm({ ...editingForm, socialMediaCaption: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-indigo-200 text-gray-800 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-indigo-400 focus:outline-none"
                  placeholder="e.g. Register today for our grand annual event! Slots are limited. #StudentMovement #OrgForm"
                />
              </div>
            )}

            <FormBuilderUI
              fields={editingForm.fields}
              onFieldsChange={(f) => setEditingForm({ ...editingForm, fields: f })}
              title={editingForm.title}
              onTitleChange={(t) => setEditingForm({ ...editingForm, title: t })}
              description={editingForm.description}
              onDescriptionChange={(d) => setEditingForm({ ...editingForm, description: d })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditingForm(null)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded shadow-sm cursor-pointer"
              >
                Apply Layout Modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 1: COLLABORATION INVITER */}
      {invitingFormId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded max-w-sm w-full p-6 space-y-4 shadow-lg">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Invite Creator Collaborator</span>
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Granted collaborators bypass ownership restrictions and can modify fields or refine code configurations in standard drafts.
            </p>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase">Choose Creator Member</label>
              <select
                value={selectedCollaboratorId}
                onChange={(e) => setSelectedCollaboratorId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded text-gray-700 text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Select members...</option>
                {allUsers
                  .filter((u) => u.role === Role.CREATOR && u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInvitingFormId(null)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteCollaborator}
                disabled={!selectedCollaboratorId}
                className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Assign Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 2: AUDIT LOG TIMELINE */}
      {historyForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded max-w-lg w-full p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 font-sans">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span>Granular Edit History Trail</span>
              </h4>
              <button onClick={() => setHistoryForm(null)} className="text-gray-400 hover:text-black text-xs font-semibold cursor-pointer">
                Close
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] font-sans">
              {(!historyForm.editHistory || historyForm.editHistory.length === 0) ? (
                <div className="text-center text-xs text-gray-450 py-8">
                  No edit history recorded for this form template.
                </div>
              ) : (
                historyForm.editHistory.map((hist) => (
                  <div key={hist.id} className="border-l-2 border-gray-200 pl-4 py-1 relative">
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-black -left-[4px] top-1.5" />
                    <div className="text-[10px] text-gray-400 font-mono">
                      {new Date(hist.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs font-bold text-gray-800">
                      {hist.memberName} <span className="text-[9px] bg-gray-100 font-mono text-gray-500 px-1 py-0.2 rounded font-semibold ml-1">Creator</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 font-sans">
                      Field: <span className="font-mono text-[10px] font-bold text-gray-600">{hist.fieldName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1 p-1.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-mono select-all">
                      <div className="truncate text-red-700">
                        <span>[-]</span> {hist.oldValue || "empty"}
                      </div>
                      <div className="truncate text-emerald-800">
                        <span>[+]</span> {hist.newValue}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 3: Creator Appeal Form */}
      {appealingForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded max-w-sm w-full p-6 space-y-4 shadow-lg">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>File Administrative Appeal</span>
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              If your form is rejected, you can justify templates or answer arguments directly to Lead Members to trigger a formal recheck review alert.
            </p>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase">Appeal Arguments / Notes</label>
              <textarea
                value={appealNote}
                onChange={(e) => setAppealNote(e.target.value)}
                rows={4}
                className="w-full bg-white border border-gray-300 rounded text-gray-800 text-xs p-2 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="Give details about why this template is necessary..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAppealingForm(null)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleFileAppeal}
                disabled={!appealNote.trim()}
                className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Dispatch Appeal Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
