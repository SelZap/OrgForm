/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../utils/AppContext";
import { PostCategory } from "../types";
import { Send, FileText, Megaphone, CheckSquare } from "lucide-react";

export const PostPage: React.FC = () => {
  const { forms, currentUser, fetchPosts, navigate, showNotification } = useApp();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>(PostCategory.Announcement);
  const [attachedFormId, setAttachedFormId] = useState("");

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showNotification("error", "Both title and content body are required.");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
          attachedFormId: attachedFormId || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", "Announcement bulletin posted publicly!");
        fetchPosts();
        navigate("dashboard");
      }
    } catch (err: any) {
      showNotification("error", "Post failed: " + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto font-sans space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-955 select-none font-sans">Compose Organization Post</h2>
          <p className="text-gray-500 text-xs mt-1">Publish bulletins, proposal drafts, sponsorships, or survey calls directly inside bulletin feed.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs rounded transition-colors cursor-pointer"
        >
          Exit to Dashboard
        </button>
      </div>

      <form onSubmit={handlePostSubmit} className="bg-white border border-gray-200 rounded p-6 space-y-4 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">Bulletin Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="w-full bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded focus:ring-1 focus:ring-black focus:border-black"
            >
              {Object.values(PostCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">Attach Active Questionnaire</label>
            <select
              value={attachedFormId}
              onChange={(e) => setAttachedFormId(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="">No questionnaire attached</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.status}] {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">Headline Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 text-xs rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
            placeholder="e.g. Call for Local Sponsorship: Tech Expo 2026"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">Content Body</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2.5 text-xs rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none leading-relaxed"
            placeholder="Introduce details, context, parameters or event directions..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("dashboard")}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Announcement</span>
          </button>
        </div>

      </form>
    </div>
  );
};
