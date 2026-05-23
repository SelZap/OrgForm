/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../utils/AppContext";
import { Role } from "../types";
import { LayoutDashboard, FileSpreadsheet, PlusCircle, Users, CheckSquare, Sparkles, UserCheck } from "lucide-react";

export const Navigation: React.FC = () => {
  const { currentUser, allUsers, changeSimulatedUser, activeRoute, navigate, forms } = useApp();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [Role.CREATOR, Role.FACILITATOR, Role.LEAD] },
    { id: "forms", label: "Forms DB", icon: FileSpreadsheet, roles: [Role.CREATOR, Role.FACILITATOR, Role.LEAD] },
    { id: "post", label: "Publish Announcement", icon: PlusCircle, roles: [Role.CREATOR, Role.FACILITATOR, Role.LEAD] },
    { id: "form-proposals", label: "Review Approvals Queue", icon: CheckSquare, roles: [Role.LEAD] },
    { id: "members", label: "Manage Roles", icon: Users, roles: [Role.LEAD] },
  ];

  const reviewPendingCount = forms.filter((f) => f.status === "REVIEW_PENDING").length;

  return (
    <div className="w-full bg-white border-b border-gray-200 text-gray-900 px-4 py-3 shrink-0 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-2.5" onClick={() => navigate("dashboard")} style={{ cursor: "pointer" }}>
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-black">OrgForm</span>
            <div className="text-[9px] text-gray-400 font-mono tracking-wider">STUDENT ORG MANAGER</div>
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black border border-gray-200"
                    : "text-gray-500 hover:text-black hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.id === "form-proposals" && reviewPendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-black text-white text-[9px] rounded-full">
                    {reviewPendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Simulated Sandbox Identity Switcher */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-gray-400 font-mono font-semibold">TEST BENCH SESSION</span>
            <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-gray-500" />
              <span>{currentUser.name}</span>
            </div>
          </div>

          <select
            value={currentUser.id}
            onChange={(e) => changeSimulatedUser(e.target.value)}
            className="bg-white border border-gray-300 text-[11px] font-medium rounded text-gray-700 pl-2 pr-6 py-1 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                [{u.role}] - {u.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
