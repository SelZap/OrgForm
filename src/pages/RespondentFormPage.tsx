/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../utils/AppContext";
import { FormField, FormTemplate } from "../types";
import { ShieldAlert, CheckCircle2, Clipboard, ChevronRight, HelpCircle, Mail, Globe } from "lucide-react";

export const RespondentFormPage: React.FC = () => {
  const { activeFormId, allUsers, fetchUsers, navigate, showNotification } = useApp();

  const [form, setForm] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Subaccount member security validation
  const [validatedUser, setValidatedUser] = useState<any | null>(null);
  const [authEmail, setAuthEmail] = useState("");

  // Users submissions
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [respondentEmail, setRespondentEmail] = useState("");

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fetchPublicForm = async () => {
    if (!activeFormId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${activeFormId}`);
      const data = await res.json();
      if (data && !data.error) {
        setForm(data);
        // Pre-fill answers fields
        const initialAnswers: Record<string, any> = {};
        data.fields.forEach((f: FormField) => {
          if (f.type === "checkbox") {
            initialAnswers[f.id] = [];
          } else {
            initialAnswers[f.id] = "";
          }
        });
        setAnswers(initialAnswers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPublicForm();
  }, [activeFormId]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400 font-sans">
        <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-black mb-2"></span>
        <div className="text-xs font-mono font-bold uppercase tracking-wider">Loading respondent workspace...</div>
      </div>
    );
  }

  if (!form || form.status !== "PUBLISHED") {
    return (
      <div className="bg-white border border-gray-200 rounded p-8 text-center max-w-sm mx-auto space-y-4 shadow-sm mt-8 font-sans">
        <ShieldAlert className="w-10 h-10 text-amber-550 mx-auto" />
        <h3 className="text-sm font-bold text-gray-900">Form Deactivated</h3>
        <p className="text-xs text-gray-500 leading-normal">
          This form template is currently sitting in drafts or has been suspended from administrative reviews.
        </p>
      </div>
    );
  }

  const handleTextChange = (fieldId: string, val: string) => {
    setAnswers({ ...answers, [fieldId]: val });
  };

  const handleCheckboxChange = (fieldId: string, option: string, isChecked: boolean) => {
    const list = [...(answers[fieldId] || [])];
    if (isChecked) {
      list.push(option);
    } else {
      const index = list.indexOf(option);
      if (index > -1) list.splice(index, 1);
    }
    setAnswers({ ...answers, [fieldId]: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field requirements checker
    for (const f of form.fields) {
      const ansVal = answers[f.id];
      if (f.required) {
        if (f.type === "checkbox") {
          if (!ansVal || ansVal.length === 0) {
            showNotification("error", `Please select at least 1 option for "${f.label}".`);
            return;
          }
        } else {
          if (!ansVal || !String(ansVal).trim()) {
            showNotification("error", `Field "${f.label}" is required.`);
            return;
          }
        }
      }
    }

    try {
      const res = await fetch(`/api/respond/forms/${form.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, respondentEmail: respondentEmail || undefined }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", "Response submitted successfully!");
        setSubmittedId(data.responseId);
      }
    } catch (err: any) {
      showNotification("error", "Dispatch failed: " + err.message);
    }
  };

  // SUCCESS SUBMIT STATE CARD
  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 space-y-6 text-center font-sans shadow-md mt-6">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-6 h-6 font-bold" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-955 select-none font-sans">Submission Completed Successfully!</h2>
          <p className="text-xs text-gray-500 leading-relaxed mt-2 font-sans">
            Your registration data has been securely stored in the organization's private database. The student form facilitators have been notified and can analyze your submission.
          </p>
        </div>

        {respondentEmail && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-700 font-mono flex items-center gap-2 justify-center max-w-md mx-auto">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>Updates will be broadcasted to: <strong>{respondentEmail}</strong></span>
          </div>
        )}

        <div className="pt-6 border-t border-gray-150 space-y-2.5 max-w-md mx-auto">
          <button
            onClick={() => navigate("respond-announcements", form.id)}
            className="w-full py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <span>Proceed to Form Announcement Feed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setSubmittedId(null);
              fetchPublicForm();
              setRespondentEmail("");
            }}
            className="w-full py-2 bg-white hover:bg-gray-50 text-gray-750 border border-gray-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Submit Another Response
          </button>

          <button
            onClick={() => navigate("dashboard")}
            className="w-full py-2 text-gray-400 hover:text-black hover:underline text-[11px] font-mono tracking-wider cursor-pointer font-bold uppercase transition-colors"
          >
            ← Exit Portal & Return to Org Hub
          </button>
        </div>
      </div>
    );
  }

  if (!form.isPublic && !validatedUser) {
    const handleVerifyEmail = (e: React.FormEvent) => {
      e.preventDefault();
      const matched = allUsers.find((u) => u.email.toLowerCase() === authEmail.trim().toLowerCase());
      if (matched) {
        setValidatedUser(matched);
        setRespondentEmail(matched.email);
        showNotification("success", `Access Unlocked! Welcome back, ${matched.name}.`);
      } else {
        showNotification("error", "Access Denied: Email address is not linked to any active organization subaccount.");
      }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6 text-left font-sans mt-4">
        {/* Layout with instructions left and gate form right to use empty space */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          <div className="md:col-span-7 bg-white border border-gray-200 rounded-lg p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <span className="text-[9px] bg-red-50 text-red-800 border border-red-200 p-1 px-2.5 rounded-full font-mono font-bold uppercase tracking-wider">
                🔒 Restricted Member Workspace
              </span>
              <h2 className="text-xl font-black text-gray-900 leading-tight select-none">{form.title}</h2>
              <p className="text-xs text-gray-500 leading-relaxed select-none">
                This internal survey is exclusively restricted to student members within active roles in the organization. 
                Unauthorized responses are blocked at the cloud gateway API level.
              </p>
              
              <div className="bg-amber-50/50 border border-amber-100 rounded p-4 text-xs text-amber-900 leading-relaxed font-sans space-y-1.5">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Subaccount Security Shield Alert</span>
                </p>
                <p className="text-[11px]">
                  Please enter your verified university subaccount email. If you represent an external participant, request the creator to approve public publishing privileges.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("dashboard")}
              className="mt-6 text-left text-xs font-mono font-bold text-gray-400 hover:text-black uppercase tracking-wider flex items-center gap-1.5"
            >
              ← Cancel & Exit to Organization Hub
            </button>
          </div>

          <div className="md:col-span-5 bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono mb-3">Gate Authorization</h3>
              <form onSubmit={handleVerifyEmail} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase mb-1">Verifiable Subaccount Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="student@orgform.edu"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-[#1a1a1a] focus:outline-none"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("dashboard")}
                    className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-bold rounded shadow-sm transition-colors cursor-pointer text-center"
                  >
                    Exit Hub
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer text-center"
                  >
                    Unlock Gate
                  </button>
                </div>
              </form>
            </div>

            {/* Test credentials simulation deck */}
            {allUsers.length > 0 && (
              <div className="pt-4 border-t border-gray-150 space-y-2">
                <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider select-none">Simulation Credentials Deck:</span>
                <p className="text-[10px] text-gray-500 select-none">Select a simulated staff email to unlock instantly:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {allUsers.slice(0, 3).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setValidatedUser(u);
                        setRespondentEmail(u.email);
                        showNotification("success", `Simulator Access Unlocked for ${u.name}`);
                      }}
                      className="p-2 text-[10px] bg-gray-50 hover:bg-gray-100 border border-gray-250 rounded text-left text-gray-700 hover:text-black font-semibold cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{u.email}</span>
                      <span className="text-[8px] bg-white border border-gray-200 px-1 rounded uppercase font-mono font-bold">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left font-sans">
      
      {/* Title block with back navigate option to prevent getting trapped */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Questionnaire Workstation</span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{form.title}</h1>
        </div>
        <button
          onClick={() => navigate("dashboard")}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 hover:text-black text-gray-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Exit to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left main: Scope banner and Form body */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scope banner / information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                {form.isPublic ? "🌐 Public Registrations Open" : "🔒 Restricted Member Survey Workspace"}
              </span>
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                Created by: <span className="text-black font-semibold">{form.creatorName}</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed font-sans">{form.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
            
            {/* Render questions dynamically */}
            <div className="space-y-5">
              {form.fields.map((field, idx) => {
                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-xs font-bold text-gray-900 font-sans">
                      {idx + 1}. {field.label} {field.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
                    </label>

                    {/* TEXT FIELD */}
                    {field.type === "text" && (
                      <input
                        type="text"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-xs px-3 py-2.5 rounded focus:ring-1 focus:ring-black focus:border-[#1A1A1A] focus:outline-none"
                        placeholder={field.placeholder || "Enter answer..."}
                      />
                    )}

                    {/* TEXTAREA FIELD */}
                    {field.type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        required={field.required}
                        rows={3}
                        className="w-full bg-white border border-gray-300 text-gray-800 placeholder-gray-400 text-xs px-3 py-2.5 rounded focus:ring-1 focus:ring-black focus:border-[#1A1A1A] focus:outline-none leading-relaxed"
                        placeholder={field.placeholder || "Describe details..."}
                      />
                    )}

                    {/* NUMBER FIELD */}
                    {field.type === "number" && (
                      <input
                        type="number"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-3 py-2.5 rounded focus:ring-1 focus:ring-black focus:border-[#1A1A1A] focus:outline-none"
                        placeholder={field.placeholder || "0"}
                      />
                    )}

                    {/* SELECT (dropdown) FIELD */}
                    {field.type === "select" && (
                      <select
                        value={answers[field.id] || ""}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2.5 rounded focus:ring-1 focus:ring-black focus:border-[#1A1A1A]"
                      >
                        <option value="">Select option...</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* RADIO BUTTONS FIELD */}
                    {field.type === "radio" && (
                      <div className="space-y-1.5 pt-1">
                        {(field.options || []).map((opt) => (
                          <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={answers[field.id] === opt}
                              onChange={() => handleTextChange(field.id, opt)}
                              required={field.required}
                              className="w-3.5 h-3.5 text-black bg-white border-gray-300 focus:ring-black focus:outline-none"
                            />
                            <span className="text-gray-600 hover:text-black">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* CHECKBOXES FIELD */}
                    {field.type === "checkbox" && (
                      <div className="space-y-1.5 pt-1">
                        {(field.options || []).map((opt) => {
                          const isChecked = (answers[field.id] || []).includes(opt);
                          return (
                            <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                className="w-3.5 h-3.5 text-black bg-white border-gray-300 rounded focus:ring-black focus:outline-none"
                              />
                              <span className="text-gray-605 hover:text-black">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-150">
              <button
                type="submit"
                className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors text-center uppercase tracking-wider"
              >
                Submit Response Entry
              </button>
            </div>

          </form>
        </div>

        {/* Right column: Info & Sidebar Widgets to eliminate empty space */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active unlocked status badge inside form if validated internal member */}
          {validatedUser && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-lg flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
                <span>Gate Authorization Activated</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-sans">
                Filling out as authenticated student subaccount: <strong>{validatedUser.name}</strong> ({validatedUser.role}).
              </p>
              <button
                type="button"
                onClick={() => { setValidatedUser(null); setRespondentEmail(""); }}
                className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded font-mono font-bold tracking-tight text-center shadow-xs"
              >
                Lock Gate Session
              </button>
            </div>
          )}

          {/* Option email for subscription isolation channels */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 shadow-sm">
            <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>Subscribe to Broadcasts</span>
            </label>
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              Provide an email to receive direct SMTP notifications when Form Facilitators distribute upcoming scheduling updates, deadlines, or registration revisions.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-950 placeholder-gray-405 text-xs px-3 py-2 rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="subscriber@student.edu"
              />
              <span className="text-[9px] text-gray-400 block font-mono">Subscription registers automatically on submit.</span>
            </div>
          </div>

          {/* Simulation credentials list helper */}
          {!validatedUser && allUsers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 shadow-sm text-left">
              <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-200 p-1 px-2.5 rounded font-mono font-bold uppercase tracking-wider block">
                Testing Simulator Access Deck
              </span>
              <p className="text-[11.5px] text-gray-450 leading-relaxed font-sans">
                For rapid testing, select an active role of an internal staff member below to pre-verify credentials bypass or lock survey privileges:
              </p>
              <div className="space-y-1.5 pt-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setValidatedUser(u);
                      setRespondentEmail(u.email);
                      showNotification("success", `Simulator Verification bypassed for ${u.name}`);
                    }}
                    className="w-full text-left p-2.5 text-[10.5px] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-750 hover:text-black font-semibold cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="truncate shrink-1 mr-1">
                      <div className="font-bold truncate text-gray-800">{u.name}</div>
                      <div className="text-[9px] text-gray-400 truncate font-mono">{u.email}</div>
                    </div>
                    <span className="text-[8px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Hub exit information widget */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 text-center space-y-2.5 shadow-sm">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono">Organizational Hub Access</div>
            <p className="text-[11px] text-gray-455 leading-relaxed font-sans">
              Need to tweak the design structures or review previous submissions? Log out of public mode and access the central hub workspace.
            </p>
            <button
              onClick={() => navigate("dashboard")}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-750 hover:text-black font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Back to central Hub Database
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
