/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Mail, Facebook, RefreshCw, Layers, ShieldCheck } from "lucide-react";

export const MockInbox: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [fbPosts, setFbPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<"email" | "fb">("email");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const eRes = await fetch("/api/logs/emails");
      const eData = await eRes.json();
      setEmails(eData);

      const fRes = await fetch("/api/logs/facebook");
      const fData = await fRes.json();
      setFbPosts(fData);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mt-8 font-sans">
      {/* Header */}
      <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-gray-950 tracking-tight uppercase">Simulated SMTP Mail & Bulletin Feeds</h3>
            <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full border border-indigo-150 flex items-center gap-1 font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" /> Simulation Lab
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">
            When you invite members, approve form proposals, or publish updates, simulated emails and board notifications logs display instantly below.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isRefreshing}
          className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-transform cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[250px]">
        {/* Navigation Selector */}
        <div className="border-r border-gray-200 p-2 space-y-1 bg-gray-50">
          <button
            onClick={() => setTab("email")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded text-left transition-colors ${
              tab === "email"
                ? "bg-white text-black border border-gray-250 shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-white/50"
            }`}
          >
            <Mail className="w-4 h-4 text-gray-500" />
            <div className="flex-1">
              <div>SMTP Email Gateway</div>
              <div className="text-[10px] text-gray-400 font-mono font-normal">
                {emails.length} dispatched log{emails.length === 1 ? "" : "s"}
              </div>
            </div>
          </button>

          <button
            onClick={() => setTab("fb")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded text-left transition-colors ${
              tab === "fb"
                ? "bg-white text-black border border-gray-250 shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-white/50"
            }`}
          >
            <Facebook className="w-4 h-4 text-gray-500" />
            <div className="flex-1">
              <div>FB Graph API feed</div>
              <div className="text-[10px] text-gray-400 font-mono font-normal">
                {fbPosts.length} post{fbPosts.length === 1 ? "" : "s"} published
              </div>
            </div>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="md:col-span-3 p-4 bg-white overflow-y-auto max-h-[300px]">
          {tab === "email" ? (
            <div className="space-y-3.5">
              {emails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                  <Mail className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-sans">No emails have been triggered by workflows yet.</p>
                </div>
              ) : (
                emails.map((email) => (
                  <div key={email.id} className="bg-gray-50 p-3.5 rounded border border-gray-200 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 border-b border-gray-200 pb-1.5">
                      <div className="text-[11px] font-mono font-bold text-gray-700">
                        To: {email.recipient}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {new Date(email.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-800 mb-1">
                      Subject: <span className="text-gray-500 font-normal">{email.subject}</span>
                    </div>
                    <div className="text-[11px] text-gray-700 font-mono whitespace-pre-line bg-white p-2.5 rounded border border-gray-200 mt-2">
                      {email.body}
                    </div>
                  </div>
                ))
              ).reverse()}
            </div>
          ) : (
            <div className="space-y-3.5">
              {fbPosts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                  <Facebook className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-sans">No Facebook feed items generated yet. Published Public forms auto-post here.</p>
                </div>
              ) : (
                fbPosts.map((post) => (
                  <div key={post.id} className="bg-gray-50 p-3.5 rounded border border-gray-200 font-sans">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[11px] font-bold text-gray-700">Simulated Org Page Post</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">
                        {new Date(post.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-gray-200 text-gray-700">
                      {post.message}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[9px] text-gray-450 font-mono">
                      <span>Graph Node Id: {post.postId}</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">● HTTP 200 SUCCESS</span>
                    </div>
                  </div>
                ))
              ).reverse()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
