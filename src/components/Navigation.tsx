/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../utils/AppContext";
import { Role } from "../types";
import { LayoutDashboard, FileSpreadsheet, PlusCircle, Users, CheckSquare, Sparkles, UserCheck } from "lucide-react";

export const Navigation: React.FC = () => {
  const { currentUser, allUsers, changeSimulatedUser, activeRoute, navigate, forms, showNotification } = useApp();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [Role.CREATOR, Role.FACILITATOR, Role.LEAD, Role.MEMBER] },
    { id: "forms", label: "Forms DB", icon: FileSpreadsheet, roles: [Role.CREATOR, Role.FACILITATOR, Role.LEAD] },
    { id: "post", label: "Publish Announcement", icon: PlusCircle, roles: [Role.CREATOR, Role.FACILITATOR, Role.LEAD, Role.MEMBER] },
    { id: "form-proposals", label: "Review Approvals Queue", icon: CheckSquare, roles: [Role.LEAD] },
    { id: "members", label: "Manage Roles", icon: Users, roles: [Role.LEAD] },
  ];

  const reviewPendingCount = forms.filter((f) => f.status === "REVIEW_PENDING").length;

  return (
    <div className="w-full bg-white border-b border-gray-200 text-gray-900 px-4 py-3 shrink-0 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-2.5" onClick={() => navigate("dashboard")} style={{ cursor: "pointer" }}>
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ears */}
              <circle cx="22" cy="22" r="14" fill="#EEF2F6" stroke="#312E81" strokeWidth="4" />
              <circle cx="22" cy="22" r="8" fill="#FBCFE8" />
              <circle cx="78" cy="22" r="14" fill="#EEF2F6" stroke="#312E81" strokeWidth="4" />
              <circle cx="78" cy="22" r="8" fill="#FBCFE8" />
              
              {/* Face/Head background */}
              <circle cx="50" cy="54" r="38" fill="white" stroke="#312E81" strokeWidth="4" />
              
              {/* Fluffy Cheeks */}
              <ellipse cx="25" cy="62" rx="9" ry="6" fill="#FBCFE8" opacity="0.9" />
              <ellipse cx="75" cy="62" rx="9" ry="6" fill="#FBCFE8" opacity="0.9" />
              
              {/* Massive Adorable Eyes (Anime/Chiikawa style) */}
              {/* Left Eye */}
              <circle cx="34" cy="50" r="10" fill="#1E1B4B" />
              <circle cx="31" cy="46" r="3.5" fill="white" />
              <circle cx="36" cy="53" r="1.5" fill="white" />
              
              {/* Right Eye */}
              <circle cx="66" cy="50" r="10" fill="#1E1B4B" />
              <circle cx="63" cy="46" r="3.5" fill="white" />
              <circle cx="68" cy="53" r="1.5" fill="white" />
              
              {/* Cute little Momonga expression (cat like mouth) */}
              <path d="M 47 59 Q 50 62 53 59" stroke="#312E81" strokeWidth="3" strokeLinecap="round" />
              <path d="M 47 59 Q 44 57 42 59" stroke="#312E81" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 53 59 Q 56 57 58 59" stroke="#312E81" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              
              {/* Sparkle star decorations */}
              <path d="M 12 40 L 14 43 L 17 44 L 14 45 L 12 48 L 10 45 L 7 44 L 10 43 Z" fill="#FCD34D" />
              <path d="M 88 40 L 90 43 L 93 44 L 90 45 L 88 48 L 86 45 L 83 44 L 86 43 Z" fill="#FCD34D" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-gray-950 flex items-center gap-1">
              MomoForms <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">Workspace</span>
            </span>
            <div className="text-[9px] text-gray-400 font-medium tracking-wide">ORGANIZATION HUB</div>
          </div>
        </div>

        {/* Dynamic Route Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {menuItems.map((item) => {
            const isAllowed = item.roles.includes(currentUser.role);
            if (!isAllowed) return null;

            const isActive = activeRoute === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs"
                    : "text-gray-600 hover:text-indigo-950 hover:bg-indigo-50/45 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.id === "form-proposals" && reviewPendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] rounded-full font-bold">
                    {reviewPendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Simulated Sandbox Identity Switcher */}
        <div className="flex items-center gap-2.5 bg-indigo-50/40 px-3.5 py-1.5 rounded-xl border border-indigo-100 shadow-3xs">
          <div className="flex flex-col text-right">
            <span className="text-[8.5px] text-indigo-805 font-mono font-bold leading-none">ACTIVE USER</span>
            <div className="text-xs font-black text-gray-900 flex items-center gap-1 mt-0.5">
              <span>{currentUser.name}</span>
            </div>
          </div>

          <select
            value={currentUser.id}
            onChange={(e) => changeSimulatedUser(e.target.value)}
            className="bg-white border border-gray-350 text-[11px] font-bold rounded-lg text-gray-800 pl-2 pr-6 py-1 h-7 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                [{u.role}] - {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              navigate("login");
              showNotification("info", "Returned to security gate.");
            }}
            className="text-[10px] bg-white border border-gray-300 hover:bg-gray-50 font-mono font-bold px-2 py-1 rounded-md text-red-700 cursor-pointer h-7 transition-all"
            title="Log out and change organization"
          >
            LOG OUT 📋
          </button>
        </div>

      </div>
    </div>
  );
};
