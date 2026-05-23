/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../utils/AppContext";
import { Role } from "../types";
import { UserPlus, ShieldAlert, Award, ShieldClose, UserX, UserCheck } from "lucide-react";

export const MembersPage: React.FC = () => {
  const { currentUser, allUsers, fetchUsers, showNotification, navigate } = useApp();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(Role.CREATOR);

  const [isAdding, setIsAdding] = useState(false);

  // Role gating
  if (currentUser.role !== Role.LEAD) {
    return (
      <div className="bg-white border border-gray-200 rounded p-8 text-center max-w-md mx-auto space-y-4 shadow-sm mt-8">
        <ShieldAlert className="w-10 h-10 text-red-655 mx-auto" strokeWidth={1.5} />
        <h3 className="text-sm font-bold text-gray-900">Access Restricted</h3>
        <p className="text-xs text-gray-500 leading-normal">
          Only authorized Lead Members possess access keys to view or promote organization roles.
        </p>
      </div>
    );
  }

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `Member ${data.name} invited successfully!`);
        setEmail("");
        setName("");
        setIsAdding(false);
        fetchUsers();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: Role) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", "Granted promotion successfully.");
        fetchUsers();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (userId === "usr_lead") {
      showNotification("error", "Cannot expel core founder Lead!");
      return;
    }
    if (!confirm("Are you sure you wish to expel this member from organization directory?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
        },
      });
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", "Member removed from roster.");
        fetchUsers();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  return (
    <div className="font-sans space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] select-none">Organization Roster</h2>
          <p className="text-gray-500 text-xs mt-1">Manage subaccount hierarchy, approve registrations, or promote/demote role permissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("dashboard")}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-750 text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            ← Exit to Dashboard
          </button>
          
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 text-xs rounded shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member Profile</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateMember} className="bg-white border border-gray-200 p-5 rounded space-y-4 max-w-md shadow-sm">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono">Invite Org Member</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="Marcus Broadus"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">Role Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-white border border-gray-300 text-gray-700 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:ring-black focus:border-black"
              >
                <option value={Role.CREATOR}>Form Creator</option>
                <option value={Role.FACILITATOR}>Form Facilitator</option>
                <option value={Role.LEAD}>Lead Member</option>
                <option value={Role.MEMBER}>Student Member</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase mb-1">School / Org Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2.5 py-1.5 rounded focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
              placeholder="e.g. member@orgform.edu"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-semibold px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded cursor-pointer"
            >
              Confirm Invite
            </button>
          </div>
        </form>
      )}

      {/* Directory list */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100">
          {allUsers.map((user) => (
            <div key={user.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${
                  user.role === Role.LEAD
                    ? "bg-red-50 text-red-700 border-red-200"
                    : user.role === Role.FACILITATOR
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : user.role === Role.MEMBER
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>{user.name}</span>
                    <span className="text-[9px] bg-gray-100 text-gray-400 border border-gray-200 px-1 py-0.2 rounded font-mono font-semibold uppercase">
                      {user.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">{user.email}</div>
                </div>
              </div>

              {/* Roster actions */}
              <div className="flex items-center gap-3.5 text-xs">
                <div>
                  <label className="block text-[8px] font-bold text-gray-400 font-mono mb-0.5 uppercase">Promote/Demote Role</label>
                  <select
                    value={user.role}
                    disabled={user.id === "usr_lead"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                    className="bg-white border border-gray-300 text-gray-700 text-[11px] rounded px-2 py-1 h-7 text-xs font-semibold disabled:opacity-40 focus:ring-1 focus:ring-black"
                  >
                    <option value={Role.CREATOR}>Form Creator</option>
                    <option value={Role.FACILITATOR}>Form Facilitator</option>
                    <option value={Role.LEAD}>Lead Member</option>
                    <option value={Role.MEMBER}>Student Member</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDeleteMember(user.id)}
                  disabled={user.id === "usr_lead" || user.id === currentUser.id}
                  className="p-1.5 bg-red-50 hover:bg-red-600 text-red-650 hover:text-white border border-red-150 rounded transition-colors h-7 w-7 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  title="Expel Member"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
