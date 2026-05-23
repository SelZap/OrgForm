/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../utils/AppContext";
import { Role } from "../types";
import { Megaphone, Mail, Bell, ShieldPlus, Send, RefreshCw, Layers, CheckCircle } from "lucide-react";

export const RespondentAnnouncementPage: React.FC = () => {
  const { activeFormId, currentUser, showNotification } = useApp();

  const [form, setForm] = useState<any | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe inputs
  const [subEmail, setSubEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Write announcement states (FACILITATORS/LEADS only!)
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const loadFeed = async () => {
    if (!activeFormId) return;
    setLoading(true);
    try {
      const fRes = await fetch(`/api/forms/${activeFormId}`);
      const fData = await fRes.json();
      setForm(fData);

      const aRes = await fetch(`/api/forms/${activeFormId}/announcements`);
      const aData = await aRes.json();
      if (Array.isArray(aData)) {
        setAnnouncements(aData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [activeFormId]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider">Loading isolated broadcasts board...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center text-gray-400 py-12 font-sans">
        <span>Form references sitting in drafts or invalid. Discarded.</span>
      </div>
    );
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;

    try {
      const res = await fetch(`/api/forms/${form.id}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `Successfully subscribed! Alerts will transmit directly to ${subEmail}.`);
        setIsSubscribed(true);
        setSubEmail("");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch(`/api/forms/${form.id}/announcements`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", "Isolated update posted successfully, email alert dispatched!");
        setNewTitle("");
        setNewContent("");
        setIsPosting(false);
        loadFeed();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  const isManagementPrivilege = [Role.FACILITATOR, Role.LEAD].includes(currentUser.role);
  const { navigate } = useApp();

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left font-sans">
      
      {/* Page Header with an immediate Exit action to satisfy navigation requirements */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Broadcast Portal</span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{form.title} Updates Fed</h1>
        </div>
        <button
          onClick={() => navigate("dashboard")}
          className="text-xs font-bold px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 hover:text-black text-gray-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Exit Broadcast Channel
        </button>
      </div>

      {/* Hero Banner card spanning the full width of the desktop layout safely */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-250 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider">
            Isolated Announcement Channel
          </span>
          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">
            Supervisor: <span className="text-gray-700 font-semibold">{form.creatorName}</span>
          </span>
        </div>
        <h2 className="text-base font-bold text-gray-950 mt-3 select-none">Announcements Board</h2>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-sans">
          This secure microblog is dedicated strictly to announcement posts, follow-up documents, and event instructions relating to <strong>{form.title}</strong>. Respondents can subscribe to receive automatic email updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section: list of announcements (takes 2 of 3 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-widest">Broadcast Timeline</h3>
            
            {/* Facilitator create broadcast link */}
            {isManagementPrivilege && (
              <button
                onClick={() => setIsPosting(!isPosting)}
                className="text-[10.5px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldPlus className="w-3.5 h-3.5" />
                <span>{isPosting ? "Close Composer" : "Post Update"}</span>
              </button>
            )}
          </div>

          {isPosting && (
            <form onSubmit={handleCreateAnnouncement} className="bg-white border border-gray-200 rounded p-4 space-y-3.5 shadow-sm">
              <span className="text-[9px] font-bold text-gray-650 font-mono block uppercase">Facilitator Post Update:</span>
              
              <div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-950 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:outline-none focus:ring-black focus:border-[#1A1A1A]"
                  placeholder="Update Subject Title..."
                  required
                />
              </div>

              <div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-300 text-gray-805 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:outline-none focus:ring-black focus:border-[#1A1A1A]"
                  placeholder="Insert announcement statements or deadlines updates..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="text-[10px] uppercase font-bold text-gray-500 px-3 py-1.5 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Transmit Broadcast</span>
                </button>
              </div>
            </form>
          )}

          {/* Broadcast feed */}
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm font-sans hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pb-2 border-b border-gray-100 mb-3">
                  <span className="font-bold text-gray-650">broadcast by {ann.authorName}</span>
                  <span>{new Date(ann.createdAt).toLocaleString()}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug font-sans">{ann.title}</h4>
                <p className="text-gray-600 text-xs leading-relaxed mt-2 whitespace-pre-line font-mono bg-gray-50 border border-gray-205 p-3.5 rounded-lg">{ann.content}</p>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-12 text-gray-400 text-center text-xs">
                No update broadcasts have been transmitted for this form yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Subscriber and Exit widgets (takes 1 of 3 columns) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Email alerts subscription widget */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 font-mono uppercase flex items-center gap-1.5 mb-1">
              <Bell className="w-4 h-4 text-gray-500" />
              <span>Email Alerts Opt-In</span>
            </h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Subscribe to recieve real-time university subaccount notification broadcasts regarding upcoming scheduling, task shifts, or revisions.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2 text-[10.5px] font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Alerts Active!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2 font-sans">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-805 text-xs px-3 py-2 rounded focus:ring-1 focus:ring-black focus:outline-none focus:border-[#1a1a1a]"
                  placeholder="e.g. subscriber@student.edu"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded transition-all cursor-pointer shadow-sm text-center font-sans"
                >
                  Activate Notifications
                </button>
              </form>
            )}
          </div>

          {/* Related Actions / Workspace Gateway */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 font-mono uppercase">Survey Reference links</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Need to complete, adjust, or view your submitted answers for this questionnaire? Lock gates or return to the registration workspace below.
            </p>
            <div className="space-y-2 pt-1 font-sans">
              <button
                onClick={() => navigate("respond", form.id)}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 hover:text-black font-semibold text-xs rounded transition-colors cursor-pointer text-center"
              >
                Go to Registry Sheet Form
              </button>
              
              <button
                onClick={() => navigate("dashboard")}
                className="w-full py-2 bg-white text-gray-400 hover:text-black hover:underline text-[10px] font-mono tracking-wider font-bold uppercase transition-colors text-center cursor-pointer"
              >
                Exit to Org Dashboard
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
