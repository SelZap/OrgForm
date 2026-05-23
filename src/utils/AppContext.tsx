/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, FormTemplate, Post, OrganizationInfo, Role } from "../types";

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  orgInfo: OrganizationInfo;
  forms: FormTemplate[];
  posts: Post[];
  activeRoute: string; // "dashboard" | "forms" | "post" | "members" | "form-proposals" | "responses" | "respond" | "respond-announcements"
  activeFormId: string | null; // For response or respondent view
  fetchForms: () => Promise<void>;
  fetchPosts: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchOrg: () => Promise<void>;
  changeSimulatedUser: (userId: string) => void;
  navigate: (route: string, formId?: string | null) => void;
  globalNotification: { type: "success" | "error" | "info"; message: string } | null;
  showNotification: (type: "success" | "error" | "info", message: string) => void;
  clearNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: "usr_lead",
    email: "lead@orgform.edu",
    name: "Elena Rostova",
    role: Role.LEAD,
    status: "ACTIVE",
  });
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo>({
    id: "org_default",
    name: "Student Council Association",
    fbPageId: "STUDENT_COUNCIL_PAGE_ID",
    fbAccessToken: "",
    emailApiKey: "",
    senderEmail: "no-reply@orgform.edu",
  });
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Custom router
  const [activeRoute, setActiveRoute] = useState<string>("login");
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  const [globalNotification, setGlobalNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setGlobalNotification({ type, message });
    setTimeout(() => {
      setGlobalNotification(null);
    }, 5000);
  };

  const clearNotification = () => setGlobalNotification(null);

  const apiHeaders = {
    "x-user-id": currentUser.id,
    "x-user-role": currentUser.role,
    "Content-Type": "application/json",
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllUsers(data);
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  };

  const fetchOrg = async () => {
    try {
      const res = await fetch("/api/org");
      const data = await res.json();
      if (data && !data.error) {
        setOrgInfo(data);
      }
    } catch (e) {
      console.error("Error fetching org context", e);
    }
  };

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/forms", {
        headers: {
          "x-user-id": currentUser.id,
          "x-user-role": currentUser.role,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setForms(data);
      }
    } catch (e) {
      console.log("Error fetching forms catalog", e);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (e) {
      console.error("Error loading posts", e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrg();
  }, []);

  // Sync forms and posts whenever currentUser changes (handles role-based view separation at data layer!)
  useEffect(() => {
    fetchForms();
    fetchPosts();
  }, [currentUser]);

  const changeSimulatedUser = (userId: string) => {
    const selected = allUsers.find((u) => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      showNotification("info", `Identity toggled: ${selected.name} (${selected.role})`);
    }
  };

  const navigate = (route: string, formId: string | null = null) => {
    setActiveRoute(route);
    setActiveFormId(formId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        orgInfo,
        forms,
        posts,
        activeRoute,
        activeFormId,
        fetchForms,
        fetchPosts,
        fetchUsers,
        fetchOrg,
        changeSimulatedUser,
        navigate,
        globalNotification,
        showNotification,
        clearNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside an AppProvider wrapper");
  }
  return context;
};
