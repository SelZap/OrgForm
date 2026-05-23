/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../utils/AppContext";
import { Role, FormField, FormResponse } from "../types";
import { Terminal, ShieldClose, Filter, Send, MailCheck, CheckCircle2, RefreshCw, EyeOff, LayoutList, Search, HelpCircle, Check, CircleDot } from "lucide-react";

export const ResponsesPage: React.FC = () => {
  const { currentUser, activeFormId, forms, navigate, showNotification } = useApp();

  const [form, setForm] = useState<any | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
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

  return (
    <div className="font-sans space-y-6 text-left">
      
      {/* Back link and Details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-gray-400 uppercase font-mono">Response metrics panel</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Responses lists & filters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Query Filter panel */}
          <div className="bg-white border border-gray-200 rounded p-4 space-y-4 shadow-sm">
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
          <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
            
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-sans gap-3">
              <span className="font-bold text-gray-800">Filtered entries output list</span>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-gray-200 shadow-2xs hover:bg-gray-50 text-[11px] font-mono font-bold text-gray-900 select-none">
                <input
                  type="checkbox"
                  checked={filtered.filter(f => !!f.respondentEmail).length > 0 && selectedEmails.length === filtered.filter(f => !!f.respondentEmail).length}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 text-black border-gray-300 bg-white focus:ring-0 rounded cursor-pointer"
                  id="select-all-checkbox"
                />
                <span>SELECT ALL FILTERED ({selectedEmails.length} / {filtered.filter(f => !!f.respondentEmail).length} SELECTED)</span>
              </label>
            </div>

            <div className="overflow-x-auto divide-y divide-gray-100 max-h-[350px]">
              {filtered.map((r, rIdx) => {
                const isSelected = r.respondentEmail ? selectedEmails.includes(r.respondentEmail) : false;

                return (
                  <div key={r.id} className="p-4 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-start hover:bg-gray-50 transition-colors">
                    
                    {/* Checkbox columns */}
                    <div className="md:col-span-3 flex items-start gap-2">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          disabled={!r.respondentEmail}
                          checked={isSelected}
                          onChange={() => r.respondentEmail && handleToggleIndividual(r.respondentEmail)}
                          className="w-3.5 h-3.5 text-black border-gray-300 bg-white focus:ring-0 rounded focus:outline-none"
                        />
                      </div>
                      <div className="text-left font-sans">
                        <div className="text-xs font-bold text-gray-800 truncate">
                          {r.respondentEmail || "Anonymous Submit"}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {new Date(r.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Answers column details */}
                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {form.fields.map((f: FormField) => {
                        const ans = r.answers[f.id];
                        const answerString = Array.isArray(ans) ? ans.join(", ") : String(ans || "Not Completed");

                        return (
                          <div key={f.id} className="text-[11px] text-left border-l-2 border-gray-250 pl-2">
                            <div className="font-mono text-[9px] font-semibold text-gray-400 truncate mb-0.5 uppercase">
                              {f.label}
                            </div>
                            <div className="text-gray-700 font-medium font-sans">
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
        </div>

        {/* Column 3: Targeted SMTP Email campaign composer */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSendCampaign} className="bg-white border border-gray-200 rounded p-5 space-y-4 shadow-sm sticky top-6">
            <h4 className="text-xs font-bold text-gray-800 font-mono uppercase flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
              <MailCheck className="w-4 h-4 text-emerald-600" />
              <span>Targeted SMTP outreach</span>
            </h4>

            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Form Facilitators can establish filter criteria above and directly email targets bulk or individually (Requires respondent emails).
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
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
                className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
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
                className="w-full bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:outline-none focus:ring-black focus:border-black"
                placeholder="Write customized instructions..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSendingCampaign || selectedEmails.length === 0}
              className="w-full py-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
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
