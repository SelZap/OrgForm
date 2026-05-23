/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./utils/AppContext";
import { Navigation } from "./components/Navigation";

import { DashboardPage } from "./pages/DashboardPage";
import { FormsPage } from "./pages/FormsPage";
import { PostPage } from "./pages/PostPage";
import { MembersPage } from "./pages/MembersPage";
import { FormProposalsPage } from "./pages/FormProposalsPage";
import { ResponsesPage } from "./pages/ResponsesPage";
import { RespondentFormPage } from "./pages/RespondentFormPage";
import { RespondentAnnouncementPage } from "./pages/RespondentAnnouncementPage";
import { LoginPage } from "./pages/LoginPage";

import { Info, AlertCircle, Sparkles } from "lucide-react";

const AppContent: React.FC = () => {
  const { activeRoute, globalNotification, clearNotification, navigate, currentUser } = useApp();

  const renderActiveRoute = () => {
    if (currentUser && currentUser.role === "MEMBER") {
      const allowedRoutes = ["login", "dashboard", "post", "respond", "respond-announcements"];
      if (!allowedRoutes.includes(activeRoute)) {
        return <DashboardPage />;
      }
    }

    switch (activeRoute) {
      case "login":
        return <LoginPage />;
      case "dashboard":
        return <DashboardPage />;
      case "forms":
        return <FormsPage />;
      case "post":
        return <PostPage />;
      case "members":
        return <MembersPage />;
      case "form-proposals":
        return <FormProposalsPage />;
      case "responses":
        return <ResponsesPage />;
      case "respond":
        return <RespondentFormPage />;
      case "respond-announcements":
        return <RespondentAnnouncementPage />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] flex flex-col justify-between selection:bg-black/10 antialiased font-sans">
      
      {/* Navigation - Hide when on LoginPage or direct Respondent Form paths */}
      {activeRoute !== "respond" && activeRoute !== "respond-announcements" && activeRoute !== "login" ? (
        <Navigation />
      ) : activeRoute === "login" ? null : (
        <div className="w-full bg-black text-white px-4 py-3 shrink-0 font-sans shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span className="font-bold text-xs tracking-wider font-mono text-gray-200 uppercase">📍 PUBLIC PARTICIPANT GATEWAY</span>
            </div>
            <button
              onClick={() => navigate("login")}
              className="bg-white hover:bg-gray-150 border border-gray-200 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-150 cursor-pointer shadow-sm hover:shadow-xs"
              id="exit-hub-btn"
            >
              Exit Public Portal & Return to Login Gate
            </button>
          </div>
        </div>
      )}

      {/* Global Toast Notification alerts card */}
      {globalNotification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-xl shadow-lg border flex items-center gap-3.5 max-w-sm bg-white transition-all duration-300 ${
            globalNotification.type === "success"
              ? "border-emerald-500 text-emerald-800"
              : globalNotification.type === "error"
                ? "border-red-500 text-red-800"
                : "border-black text-black"
          }`}>
            {globalNotification.type === "success" ? (
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-xs font-semibold leading-relaxed font-sans">{globalNotification.message}</span>
            <button
              onClick={clearNotification}
              className="text-[10px] font-bold text-gray-400 hover:text-black font-mono ml-auto"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="animate-fade-in duration-300">
          {renderActiveRoute()}
        </div>
      </main>

      {/* Humble Footer */}
      <footer className="w-full bg-white text-gray-400 text-[10px] font-mono py-4 text-center border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <span>MomoForms Student Platform © 2026. All Rights Reserved.</span>
          <span className="text-gray-400">Fully Secure Role-Based Subaccount Hierarchy Isolation.</span>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
