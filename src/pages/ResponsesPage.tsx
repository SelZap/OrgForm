/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../utils/AppContext";
import { Role, FormField, FormResponse } from "../types";
import { Terminal, ShieldClose, Filter, Send, MailCheck, CheckCircle2, RefreshCw, EyeOff, LayoutList, Search, HelpCircle, Check, CircleDot, UserCheck, Users, Database, Trash2 } from "lucide-react";

export const ResponsesPage: React.FC = () => {
  const { currentUser, activeFormId, forms, navigate, showNotification } = useApp();

  const [form, setForm] = useState<any | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [acceptedRespondents, setAcceptedRespondents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"responses" | "accepted">("responses");
  const [loading, setLoading] = useState(false);

  // Filter conditions states
  const [targetFieldId, setTargetFieldId] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<"equals" | "contains" | "empty" | "not-empty">("equals");
  const [filterValue, setFilterValue] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<any | null>(null);

  // Bulk selectors
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Email outreach campaign parameters
  const [outreachSubject, setOutreachSubject] = useState("");
  const [outreachBody, setOutreachBody] = useState("");
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Fetch form details and its registered outcomes
  const loadResponseDetails = async () => {
    if (!activeFormId) return;
    setLoading(true);
    try {
      const fRes = await fetch(`/api/forms/${activeFormId}`);
      const fData = await fRes.json();
      setForm(fData);

      const rRes = await fetch(`/api/forms/${activeFormId}/responses`, {
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
        },
      });
      const rData = await rRes.json();
      if (Array.isArray(rData)) {
        setResponses(rData);
      }

      const accRes = await fetch(`/api/forms/${activeFormId}/accepted-respondents`, {
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
        },
      });
      const accData = await accRes.json();
      if (Array.isArray(accData)) {
        setAcceptedRespondents(accData);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponseDetails();
  }, [activeFormId]);

  // Role check
  if (currentUser.role !== Role.FACILITATOR && currentUser.role !== Role.LEAD) {
    return (
      <div className="bg-white border border-gray-200 rounded p-8 text-center max-w-sm mx-auto space-y-4 shadow-sm mt-8 font-sans">
        <EyeOff className="w-10 h-10 text-red-655 mx-auto" />
        <h3 className="text-sm font-bold text-gray-900">Access Restricted</h3>
        <p className="text-xs text-gray-500">
          Private respondent submission details are strictly restricted to Form Facilitators and Lead Members at database level.
        </p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20 text-gray-400 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-500" />
        <span className="text-xs">Syncing metrics with database...</span>
      </div>
    );
  }

  // Application of filtering algorithm
  const getFilteredResponses = () => {
    if (!appliedFilters) return responses;

    const { fieldId, criteria, value } = appliedFilters;
    if (!fieldId) return responses;

    return responses.filter((r) => {
      const respVal = r.answers[fieldId];
      
      // Normalize values to match lists or strings
      const normalizedString = Array.isArray(respVal)
        ? respVal.join(", ").toLowerCase()
        : String(respVal || "").toLowerCase();

      const queryVal = String(value || "").toLowerCase();

      switch (criteria) {
        case "equals":
          return normalizedString.toLowerCase() === queryVal.toLowerCase();
        case "contains":
          return normalizedString.includes(queryVal);
        case "empty":
          return !normalizedString.trim();
        case "not-empty":
          return normalizedString.trim().length > 0;
        default:
          return true;
      }
    });
  };

  const filtered = getFilteredResponses();

  // Helper selectors
  const handleToggleSelectAll = () => {
    // Gather all valid email strings from filtered response list
    const emailsOfFiltered = filtered
      .map((r) => r.respondentEmail)
      .filter((email): email is string => !!email);

    if (selectedEmails.length === emailsOfFiltered.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emailsOfFiltered);
    }
  };

  const handleToggleIndividual = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  // Dispatch campaign outreach
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmails.length === 0) {
      showNotification("error", "Please select at least 1 respondent email to receive targeted dispatch bulletins.");
      return;
    }
    if (!outreachSubject.trim() || !outreachBody.trim()) {
      showNotification("error", "Subject and message body coordinates are required.");
      return;
    }

    setIsSendingCampaign(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: selectedEmails,
          subject: outreachSubject,
          body: outreachBody,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `SMTP outreach successfully transmitted to ${data.count} target active responder registries!`);
        setOutreachSubject("");
        setOutreachBody("");
        setSelectedEmails([]);
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSendingCampaign(false);
    }
  };

  const handleToggleAccept = async (response: FormResponse) => {
    const isCurrentlyAccepted = acceptedRespondents.some(ar => ar.responseId === response.id);
    
    if (isCurrentlyAccepted) {
      try {
        const res = await fetch(`/api/forms/${activeFormId}/accepted-respondents/${response.id}`, {
          method: "DELETE",
          headers: {
            "x-user-id": currentUser.id,
            "x-user-role": currentUser.role,
          }
        });
        const data = await res.json();
        if (data.success) {
          showNotification("success", `Removed ${response.respondentEmail || "Anonymous respondent"} from Accepted database.`);
          setAcceptedRespondents(prev => prev.filter(ar => ar.responseId !== response.id));
        } else {
          showNotification("error", data.error || "Failed to remove respondent.");
        }
      } catch (err: any) {
        showNotification("error", err.message);
      }
    } else {
      try {
        const res = await fetch(`/api/forms/${activeFormId}/accepted-respondents`, {
          method: "POST",
          headers: {
            "x-user-id": currentUser.id,
            "x-user-role": currentUser.role,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            responseId: response.id,
            respondentEmail: response.respondentEmail,
            answers: response.answers
          })
        });
        const data = await res.json();
        if (data.error) {
          showNotification("error", data.error);
        } else {
          showNotification("success", `Added ${response.respondentEmail || "respondent"} to the Accepted database and emitted email notification!`);
          setAcceptedRespondents(prev => [...prev, data]);
        }
      } catch (err: any) {
        showNotification("error", err.message);
      }
    }
  };

  return (
    <div className="font-sans space-y-6 text-left animate-fade-in">
      
      {/* Back link and Details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-gray-400 uppercase">Response metrics panel</span>
          <h2 className="text-md font-bold text-[#1A1A1A] mt-1 select-none">{form.title}</h2>
          <div className="text-[11px] text-gray-500 mt-1 leading-snug">
            Total Database entries: <span className="text-black font-bold font-mono">{responses.length} responses</span>
          </div>
        </div>
        <button
          onClick={() => navigate("forms")}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 hover:text-black text-gray-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          ← Exit to Forms DB
        </button>
      </div>

      {/* Mode navigation switcher */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
        <button
          onClick={() => {
            setActiveTab("responses");
            setSelectedEmails([]);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "responses"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-gray-500 hover:text-gray-950"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>All Received Submissions ({responses.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("accepted");
            setSelectedEmails([]);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "accepted"
              ? "border-emerald-600 text-emerald-600 font-extrabold"
              : "border-transparent text-gray-500 hover:text-gray-950"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="flex items-center gap-1.5">
            <span>Accepted Respondents Database</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {acceptedRespondents.length}
            </span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Responses lists & filters */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "responses" ? (
            <>
              {/* Query Filter panel */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-800 font-mono uppercase flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <span>Response Filter Rules</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1.5">
                    <label className="block text-[9px] font-bold text-gray-450 font-mono uppercase mb-0.5">Target Question</label>
                    <select
                      value={targetFieldId}
                      onChange={(e) => setTargetFieldId(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-700 text-[11px] rounded h-8 leading-none"
                    >
                      <option value="">Select question...</option>
                      {form.fields.map((f: FormField) => (
                        <option key={f.id} value={f.id}>
                          {f.label} ({f.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-450 font-mono uppercase mb-0.5">Filter Operator</label>
                    <select
                      value={filterCriteria}
                      onChange={(e) => setFilterCriteria(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 text-gray-750 text-[11px] rounded h-8 leading-none"
                    >
                      <option value="equals">Equals Matches</option>
                      <option value="contains">Contains substring</option>
                      <option value="empty">Is Empty / Null</option>
                      <option value="not-empty">Is Not Empty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-450 font-mono uppercase mb-0.5">Match Entry Value</label>
                    <input
                      type="text"
                      value={filterValue}
                      disabled={["empty", "not-empty"].includes(filterCriteria)}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 text-[11px] rounded px-2 py-1.5 h-8 focus:ring-1 focus:ring-black focus:border-black focus:outline-none disabled:opacity-30"
                      placeholder="e.g. Sophomore"
                    />
                  </div>

                  <div className="flex gap-2 self-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedFilters({ fieldId: targetFieldId, criteria: filterCriteria, value: filterValue });
                        setSelectedEmails([]);
                      }}
                      className="flex-1 py-1 px-2.5 bg-black hover:bg-gray-800 text-white rounded h-8 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Filter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedFilters(null);
                        setTargetFieldId("");
                        setFilterValue("");
                        setSelectedEmails([]);
                      }}
                      className="py-1 px-2.5 bg-white text-gray-500 hover:text-black border border-gray-300 hover:bg-gray-50 rounded h-8 text-[11px] font-semibold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {appliedFilters && (
                  <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between mt-2.5 bg-gray-50 h-7 px-3 rounded border border-gray-200">
                    <span>
                      Query: <span className="text-black font-semibold">{appliedFilters.fieldId || "any"}</span> {appliedFilters.criteria} matches: <span className="text-black">"{appliedFilters.value || ""}"</span>
                    </span>
                    <span className="text-gray-400">Filtered size: {filtered.length} matching rows</span>
                  </div>
                )}
              </div>

              {/* Results table sheet list style */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                <div className="p-4 bg-indigo-50/10 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-sans gap-3">
                  <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                    <span>Filtered entries output list</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="flex items-center gap-2 cursor-pointer bg-white hover:bg-indigo-50 border-2 border-indigo-400 px-4 py-2 rounded-xl shadow-xs transition-all text-xs font-bold text-indigo-950 select-none hover:shadow-sm"
                    id="select-all-btn"
                  >
                    <input
                      type="checkbox"
                      checked={filtered.filter(f => !!f.respondentEmail).length > 0 && selectedEmails.length === filtered.filter(f => !!f.respondentEmail).length}
                      readOnly
                      className="w-4 h-4 text-indigo-600 border-indigo-400 bg-white focus:ring-0 rounded cursor-pointer pointer-events-none"
                      id="select-all-checkbox"
                    />
                    <span>SELECT ALL RESPONDENTS ({selectedEmails.length} / {filtered.filter(f => !!f.respondentEmail).length} ACTIVE EMAILS)</span>
                  </button>
                </div>

                <div className="overflow-x-auto divide-y divide-gray-100 max-h-[450px]">
                  {filtered.map((r, rIdx) => {
                    const isSelected = r.respondentEmail ? selectedEmails.includes(r.respondentEmail) : false;
                    const isAccepted = acceptedRespondents.some(ar => ar.responseId === r.id);

                    return (
                      <div key={r.id} className="p-4 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-start hover:bg-gray-50/50 transition-colors">
                        
                        {/* Checkbox and Accept respondent actions column */}
                        <div className="md:col-span-3 flex flex-col gap-3 text-left">
                          <div className="flex items-start gap-2">
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                disabled={!r.respondentEmail}
                                checked={isSelected}
                                onChange={() => r.respondentEmail && handleToggleIndividual(r.respondentEmail)}
                                className="w-3.5 h-3.5 text-black border-gray-300 bg-white focus:ring-0 rounded focus:outline-none cursor-pointer"
                              />
                            </div>
                            <div className="text-left font-sans min-w-0">
                              <div className="text-xs font-bold text-gray-800 truncate" title={r.respondentEmail || "Anonymous Submit"}>
                                {r.respondentEmail || "Anonymous Submit"}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                {new Date(r.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Quick Facilitator Database Action Button */}
                          <div className="pl-5">
                            {isAccepted ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-150 font-mono uppercase tracking-wider">
                                  <Check className="w-2.5 h-2.5" />
                                  Accepted
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAccept(r)}
                                  className="block text-[9.5px] text-red-500 hover:text-red-700 hover:underline font-bold cursor-pointer font-sans"
                                >
                                  Revoke Status
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleAccept(r)}
                                className="inline-flex items-center gap-1 text-[9.5px] font-bold bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 px-2.5 py-1 rounded-lg border border-gray-200 transition-all cursor-pointer shadow-3xs hover:shadow-2xs"
                              >
                                <UserCheck className="w-2.5 h-2.5" />
                                Accept Registrant
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Answers column details */}
                        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5 leading-relaxed">
                          {form.fields.map((f: FormField) => {
                            const ans = r.answers[f.id];
                            const answerString = Array.isArray(ans) ? ans.join(", ") : String(ans || "Not Completed");

                            return (
                              <div key={f.id} className="text-[11px] text-left border-l-2 border-slate-205 border-slate-200 pl-2">
                                <div className="font-mono text-[9px] font-bold text-gray-450 truncate mb-0.5 uppercase tracking-wide">
                                  {f.label}
                                </div>
                                <div className="text-gray-800 font-medium font-sans">
                                  {answerString}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-xs font-sans">
                      No responses currently match the filtering parameters. Clear filter rules to view all submissions.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ACCEPTED RESPONDENTS WORKSPACE */
            <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-xs">
              
              <div className="p-4 bg-emerald-50/10 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3">
                <span className="font-extrabold text-[#064e3b] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>OFFICIAL ACCEPTED REGISTRANTS REGISTRY DATABASE ({acceptedRespondents.length} COHORTS)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase">
                  Simulated SQL subset
                </span>
              </div>

              <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
                {acceptedRespondents.map((ar) => {
                  const rEmail = ar.respondentEmail;
                  const isSelected = rEmail ? selectedEmails.includes(rEmail) : false;

                  return (
                    <div key={ar.id} className="p-4 bg-emerald-50/5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-emerald-50/10 transition-all duration-100">
                      
                      {/* Identity identifier */}
                      <div className="md:col-span-4 flex items-start gap-2.5">
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            disabled={!rEmail}
                            checked={isSelected}
                            onChange={() => rEmail && handleToggleIndividual(rEmail)}
                            className="w-3.5 h-3.5 text-emerald-600 border-gray-350 bg-white focus:ring-0 rounded cursor-pointer"
                          />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate" title={rEmail || "Anonymous Submit"}>
                            {rEmail || "Anonymous Submit"}
                          </div>
                          <div className="text-[9.5px] text-gray-400 font-sans mt-0.5 leading-none">
                            Accepted: <span className="font-bold text-gray-500 font-mono">{new Date(ar.addedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-[9.5px] text-gray-400 font-sans leading-none mt-1">
                            Officer: <span className="font-semibold text-emerald-800 font-mono">{ar.addedBy}</span>
                          </div>
                        </div>
                      </div>

                      {/* Brief answers summary grid */}
                      <div className="md:col-span-6 grid grid-cols-2 gap-2">
                        {form.fields.slice(0, 2).map((f: FormField) => {
                          const ans = ar.answers[f.id];
                          const answerString = Array.isArray(ans) ? ans.join(", ") : String(ans || "N/A");
                          return (
                            <div key={f.id} className="text-[10.5px] border-l border-emerald-250 border-emerald-200 pl-2 text-left min-w-0">
                              <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-tighter truncate mb-0.5 font-mono">
                                {f.label}
                              </span>
                              <span className="text-gray-700 font-medium truncate block leading-tight">{answerString}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Revocation trigger button */}
                      <div className="md:col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const originalResponse = responses.find(r => r.id === ar.responseId) || {
                              id: ar.responseId,
                              respondentEmail: ar.respondentEmail,
                              answers: ar.answers
                            };
                            handleToggleAccept(originalResponse as FormResponse);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-600 hover:text-rose-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
                      </div>

                    </div>
                  );
                })}

                {acceptedRespondents.length === 0 && (
                  <div className="text-center py-20 text-gray-400 font-sans space-y-3">
                    <UserCheck className="w-10 h-10 text-emerald-200 mx-auto" />
                    <p className="font-bold text-gray-600">Accepted respondents list is currently empty</p>
                    <p className="text-[10.5px] max-w-sm mx-auto text-gray-400 leading-normal">
                      Access the "All Received Submissions" tab above, evaluate responses, and add chosen applicants. They will automatically sync to this database list and receive automated notifications!
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Column 3: Targeted SMTP Email campaign composer */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSendCampaign} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm sticky top-6">
            <h4 className="text-xs font-bold text-gray-800 font-mono uppercase flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
              <MailCheck className="w-4 h-4 text-emerald-600" />
              <span>Targeted SMTP outreach</span>
            </h4>

            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Form Facilitators can establish filter criteria above and directly email targets bulk or individually (Requires respondent emails).
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 font-mono block uppercase mb-1">Target active Recipients</span>
              {selectedEmails.length === 0 ? (
                <span className="text-[10px] text-amber-600 font-semibold font-mono">0 emails selected (Toggle checkboxes on left!)</span>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                  {selectedEmails.map((e) => (
                    <span key={e} className="text-[9px] font-mono font-bold bg-white text-gray-650 px-1.5 py-0.5 rounded border border-gray-200">
                      {e.split("@")[0]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-0.5">Campaign Title</label>
              <input
                type="text"
                value={outreachSubject}
                onChange={(e) => setOutreachSubject(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2.5 py-1.5 rounded-lg focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="e.g. Next steps regarding Hackathon Workshops"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-0.5">SMTP Core Message Body</label>
              <textarea
                value={outreachBody}
                onChange={(e) => setOutreachBody(e.target.value)}
                rows={4}
                className="w-full bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-lg focus:ring-1 focus:outline-none focus:ring-black focus:border-black"
                placeholder="Write customized instructions..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSendingCampaign || selectedEmails.length === 0}
              className="w-full py-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingCampaign ? "Transmitting Outreach..." : `Send to ${selectedEmails.length} Target{s}`}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
