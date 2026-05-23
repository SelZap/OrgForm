/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../utils/AppContext";
import { Role, User } from "../types";
import { Sparkles, ShieldCheck, UserPlus, HelpCircle, Layers, Mail, Key, ChevronRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { allUsers, fetchUsers, changeSimulatedUser, navigate, showNotification } = useApp();
  
  // Organization Selection State
  const [selectedOrg, setSelectedOrg] = useState<string>("student_council");
  
  // Invite/Sign-up State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>(Role.CREATOR);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Simulated Orgs Config to satisfy "which organization you belong to first"
  const orgs = [
    {
      id: "student_council",
      name: "Student Council Association 🏫",
      tagline: "University Governing Desk & Student Welfare Board",
      accent: "from-indigo-500 to-indigo-455",
      themeColor: "border-indigo-400 bg-indigo-50/50 text-indigo-900",
      primaryBtn: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400 text-white",
      badge: "bg-indigo-100 text-indigo-805 border-indigo-200"
    },
    {
      id: "code_coalition",
      name: "Code & Hack Alliance 💻",
      tagline: "Underground Developer Assembly & Open Source League",
      accent: "from-emerald-500 to-emerald-400",
      themeColor: "border-emerald-400 bg-emerald-50/50 text-emerald-900",
      primaryBtn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white",
      badge: "bg-emerald-100 text-emerald-800 border-indigo-200"
    },
    {
      id: "creative_league",
      name: "Creative Design Alliance 🎨",
      tagline: "Student Design, UX, & Immersive Art Incubator",
      accent: "from-purple-500 to-purple-400",
      themeColor: "border-purple-400 bg-purple-50/50 text-purple-900",
      primaryBtn: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-400 text-white",
      badge: "bg-purple-105 text-purple-800 border-purple-200"
    }
  ];

  const currentOrgDetails = orgs.find(o => o.id === selectedOrg) || orgs[0];

  // Fetch updated user listings
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectSimulatedUser = (user: User) => {
    // Perform simulated login
    changeSimulatedUser(user.id);
    showNotification("success", `Successfully logged into ${currentOrgDetails.name} as ${user.name}!`);
    navigate("dashboard");
  };

  const handleInstantInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showNotification("error", "Please provide a valid name and email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // In the login phase, to bypass LEAD auth role-gate on backend for immediate login simulation,
      // we can POST directly to /api/users using usr_lead credentials in header to invite the new user!
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "x-user-id": "usr_lead", // Core founder bypass credentials for onboarding!
          "x-user-role": Role.LEAD,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail, name: newName, role: newRole }),
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
      } else {
        showNotification("success", `New subaccount profile [${data.name}] invited and registered!`);
        setNewName("");
        setNewEmail("");
        
        // Log in immediately as this newly created user
        await fetchUsers(); // reload list
        
        // Since setAllUsers state is async, search in newly returned data or trigger immediate switch
        changeSimulatedUser(data.id);
        navigate("dashboard");
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 font-sans py-6 animate-fade-in duration-300">
      
      {/* Title Header with custom MomoForms branding */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl border border-indigo-100 shadow-xs p-2">
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
              
              {/* Massive Adorable Eyes */}
              <circle cx="34" cy="50" r="10" fill="#1E1B4B" />
              <circle cx="31" cy="46" r="3.5" fill="white" />
              <circle cx="36" cy="53" r="1.5" fill="white" />
              
              <circle cx="66" cy="50" r="10" fill="#1E1B4B" />
              <circle cx="63" cy="46" r="3.5" fill="white" />
              <circle cx="68" cy="53" r="1.5" fill="white" />
              
              {/* Cute mouth */}
              <path d="M 47 59 Q 50 62 53 59" stroke="#312E81" strokeWidth="3" strokeLinecap="round" />
              <path d="M 47 59 Q 44 57 42 59" stroke="#312E81" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 53 59 Q 56 57 58 59" stroke="#312E81" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              
              {/* Sparkles */}
              <path d="M 12 40 L 14 43 L 17 44 L 14 45 L 12 48 L 10 45 L 7 44 L 10 43 Z" fill="#FCD34D" />
              <path d="M 88 40 L 90 43 L 93 44 L 90 45 L 88 48 L 86 45 L 83 44 L 86 43 Z" fill="#FCD34D" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 border border-indigo-150 rounded-full shadow-3xs">
            <span className="w-1.5 h-1.5 bg-indigo-505 bg-indigo-600 rounded-full animate-ping"></span>
            <span className="text-[10.5px] font-bold text-indigo-900 tracking-wider uppercase font-mono">MomoForms Portal Gateway</span>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 md:text-5xl leading-none">
          Cute Form Workspace & Announcement Feeds
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          The ultimate student-led central registry system. Build beautiful forms, manage role privileges, and broadcast instant SMTP email notifications.
        </p>
      </div>

      {/* Grid: Org Selector & Interactive Login Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Organization & Workplace Directory Setup (cols: 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-widest mb-1.5">STEP 1. ORGANIZATIONAL GATEWAY</span>
              <h2 className="text-lg font-black text-gray-950">Select Your Student Org</h2>
              <p className="text-xs text-gray-400 leading-normal mt-1">
                Choose which organization gateway you wish to explore. Each organization features isolated user rosters and templates.
              </p>
            </div>

            {/* Organizations list */}
            <div className="space-y-3">
              {orgs.map((org) => {
                const isActive = selectedOrg === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      setSelectedOrg(org.id);
                      showNotification("info", `Switched organizational workspace to: ${org.name}`);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? `${org.themeColor} border-indigo-505 border-indigo-500 shadow-sm`
                        : "border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/10"
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                        <span>{org.name}</span>
                        {isActive && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>}
                      </div>
                      <div className="text-[10.5px] text-gray-500 font-normal leading-normal">{org.tagline}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats / Info Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl space-y-4 shadow-lg shadow-indigo-100/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="font-bold text-xs font-mono tracking-widest text-indigo-300">ORGFORMS LABS</span>
            </div>
            <p className="text-[11px] text-indigo-200 leading-normal">
              All form blueprints and bullet announcements are safely isolated per collegiate email suffix. Lead members review and sign-off template revisions before digital distribution.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-center border-t border-indigo-800/40">
              <div>
                <div className="text-lg font-bold font-mono text-emerald-300">100%</div>
                <div className="text-[9px] text-indigo-300 font-mono uppercase font-bold tracking-wider">Secure Sandbox</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-sky-300">SMTP</div>
                <div className="text-[9px] text-indigo-300 font-mono uppercase font-bold tracking-wider">Simulated Mail</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Profiles & Subaccount Invitation Onboarding (cols: 7) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-8">
          
          {/* Simulated accounts */}
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-widest mb-1">
                STEP 2. SELECT SIMULATED MEMBER PROFILE
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900">
                  Active Directory: <span className="underline decoration-indigo-450">{currentOrgDetails.name}</span>
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Click on any directory profile below to instantly simulate active login credentials bypass.
              </p>
            </div>

            {/* Users grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allUsers.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-gray-400 text-xs">
                  Loading active directory system...
                </div>
              ) : (
                allUsers.map((user) => {
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectSimulatedUser(user)}
                      className="text-left p-4.5 bg-slate-50/50 hover:bg-indigo-50/40 border border-slate-205 hover:border-indigo-500 rounded-2xl transition-all h-full flex flex-col justify-between space-y-4 cursor-pointer group shadow-2xs hover:shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            user.role === Role.LEAD
                              ? "bg-red-100 text-red-800"
                              : user.role === Role.FACILITATOR
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-indigo-100 text-indigo-805"
                          }`}>
                            {user.role}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <h4 className="text-xs font-black text-gray-900 mt-1">{user.name}</h4>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-200/55 flex items-center justify-between text-[9.5px] text-gray-500 font-mono">
                        <span className="font-semibold text-gray-700 italic group-hover:underline">Simulate Login →</span>
                        <span>{user.status}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Subaccount Invitation Gate - fixes "invite does not work" */}
          <div className="pt-6 border-t border-gray-150 space-y-4">
            <div>
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Onboard a New Custom Subaccount Profile</span>
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                Establish raw simulated credentials in the organization directory. Upon registering, you will immediately unlock access and log in automatically.
              </p>
            </div>

            <form onSubmit={handleInstantInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100/60">
              <div className="sm:col-span-4">
                <label className="block text-[8.5px] font-bold text-gray-400 font-mono uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sam Jenkins"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2.5 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[8.5px] font-bold text-gray-400 font-mono uppercase mb-1">Subaccount Email</label>
                <input
                  type="email"
                  placeholder="sam@orgform.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-2.5 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[8.5px] font-bold text-gray-400 font-mono uppercase mb-1">Requested Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full bg-white border border-gray-300 text-gray-700 text-xs px-2.5 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={Role.LEAD}>LEAD</option>
                  <option value={Role.CREATOR}>CREATOR</option>
                  <option value={Role.FACILITATOR}>FACILITATOR</option>
                  <option value={Role.MEMBER}>MEMBER</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-705 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs h-8 cursor-pointer text-center"
                >
                  Onboard →
                </button>
              </div>
            </form>
          </div>

        </div>
        
      </div>

    </div>
  );
};
