/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Initialize Gemini API Client Lazy
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Ensure database file exists with initial seeded data
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const dbContent = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(dbContent);
    } catch (e) {
      console.error("Error reading db.json, resetting...", e);
    }
  }

  // Seed Data
  const defaultDb = {
    users: [
      { id: "usr_lead", email: "lead@orgform.edu", name: "Elena Rostova", role: "LEAD", status: "ACTIVE" },
      { id: "usr_creator", email: "creator@orgform.edu", name: "Marcus Broadus", role: "CREATOR", status: "ACTIVE" },
      { id: "usr_facilitator", email: "facilitator@orgform.edu", name: "Sarah Jenkins", role: "FACILITATOR", status: "ACTIVE" },
      { id: "usr_creator2", email: "collaborator@orgform.edu", name: "Kenji Tanaka", role: "CREATOR", status: "ACTIVE" }
    ],
    orgInfo: {
      id: "org_default",
      name: "Student Council Association",
      fbPageId: "STUDENT_COUNCIL_PAGE_ID",
      fbAccessToken: "EAAC_SIMULATED_GRAPH_TOKEN",
      emailApiKey: "re_SIMULATED_RESEND_KEY",
      senderEmail: "no-reply@orgform.edu"
    },
    forms: [
      {
        id: "form_seminar",
        title: "Web3 & AI Tech Symposium Registration",
        description: "Register for our annual tech symposium. Includes workshops on Generative AI and Smart Contracts. Public Form.",
        status: "PUBLISHED",
        creatorId: "usr_creator",
        creatorName: "Marcus Broadus",
        isPublic: true,
        fields: [
          { id: "q1", type: "text", label: "Full Name", required: true, placeholder: "e.g., Jane Doe" },
          { id: "q2", type: "text", label: "Student ID Number", required: true, placeholder: "e.g., 2026-10394" },
          { id: "q3", type: "select", label: "Year Level", required: true, options: ["Freshman", "Sophomore", "Junior", "Senior"] },
          { id: "q4", type: "radio", label: "Dietary Dietary Preferences", required: false, options: ["None", "Vegetarian", "Vegan", "Halal"] },
          { id: "q5", type: "checkbox", label: "Workshops to Attend", required: true, options: ["AI Agents 101", "Solidity Core", "Prompt Engineering"] },
          { id: "q6", type: "textarea", label: "What do you want to learn?", required: false, placeholder: "Describe your expectations." }
        ],
        comments: [],
        editHistory: [
          { id: "h1", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), memberId: "usr_creator", memberName: "Marcus Broadus", fieldName: "isPublic", oldValue: "false", newValue: "true" }
        ],
        collaborators: ["usr_creator2"],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "form_sponsor",
        title: "Sponsorship Engagement Interest Form",
        description: "Form for potential local businesses looking to sponsor student council events.",
        status: "DRAFT",
        creatorId: "usr_creator",
        creatorName: "Marcus Broadus",
        isPublic: true,
        fields: [
          { id: "s1", type: "text", label: "Company Name", required: true, placeholder: "e.g., Acme Tech" },
          { id: "s2", type: "number", label: "Proposed Sponsorship Amount ($)", required: true },
          { id: "s3", type: "textarea", label: "Sponsorship Package details", required: false }
        ],
        comments: [],
        editHistory: [],
        collaborators: [],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "form_venue",
        title: "Campus Venue Feedback survey",
        description: "Submit comments on library extension and local hubs.",
        status: "REVIEW_PENDING",
        creatorId: "usr_creator2",
        creatorName: "Kenji Tanaka",
        isPublic: false,
        fields: [
          { id: "v1", type: "text", label: "Preferred Venue", required: true },
          { id: "v2", type: "number", label: "Rating of Library Extension (1-5)", required: true }
        ],
        comments: [],
        editHistory: [],
        collaborators: [],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    posts: [
      {
        id: "post_1",
        title: "Student Council Tech Week Announced",
        content: "We are thrilled to launch the Student Council Tech Week starting next month! Registrations for 'Web3 & AI Tech Symposium' are now active. Check out the link attached below to join.",
        category: "Announcement",
        authorId: "usr_lead",
        authorName: "Elena Rostova",
        authorRole: "LEAD",
        createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
        attachedFormId: "form_seminar"
      },
      {
        id: "post_2",
        title: "Proposed: Digital ID Integration",
        content: "Proposing a new form template for onboarding digital IDs across classrooms. Form template draft attached to review.",
        category: "Proposal",
        authorId: "usr_creator",
        authorName: "Marcus Broadus",
        authorRole: "CREATOR",
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        attachedFormId: "form_sponsor"
      }
    ],
    responses: [
      {
        id: "resp_1",
        formId: "form_seminar",
        answers: {
          q1: "Alice Henderson",
          q2: "2024-5021",
          q3: "Sophomore",
          q4: "Vegetarian",
          q5: ["AI Agents 101", "Prompt Engineering"],
          q6: "Eager to understand AI architectures!"
        },
        submittedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        respondentEmail: "alice@student.edu"
      },
      {
        id: "resp_2",
        formId: "form_seminar",
        answers: {
          q1: "Bob Vance",
          q2: "2023-8821",
          q3: "Senior",
          q4: "None",
          q5: ["Solidity Core"],
          q6: "Interested in smart contracts."
        },
        submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        respondentEmail: "bob@student.edu"
      },
      {
        id: "resp_3",
        formId: "form_seminar",
        answers: {
          q1: "Chloe Sullivan",
          q2: "2025-1002",
          q3: "Freshman",
          q4: "Vegan",
          q5: ["AI Agents 101", "Solidity Core"],
          q6: "Everything is super cool."
        },
        submittedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
        respondentEmail: "chloe@student.edu"
      }
    ],
    formAnnouncements: [
      {
        id: "f_ann_1",
        formId: "form_seminar",
        title: "Symposium Venue Finalized!",
        content: "Hi everyone, the AI & Tech Symposium venue is finalized to be held at the Main Student Plaza Auditorium, Wing B. Refreshments will be fully served.",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        authorId: "usr_facilitator",
        authorName: "Sarah Jenkins"
      }
    ],
    subscribers: [
      { id: "sub_1", formId: "form_seminar", email: "alice@student.edu", createdAt: new Date().toISOString() },
      { id: "sub_2", formId: "form_seminar", email: "bob@student.edu", createdAt: new Date().toISOString() }
    ],
    transactionalEmails: [
      {
        id: "em_1",
        recipient: "creator@orgform.edu",
        subject: "Form Template Published: Web3 & AI Tech Symposium",
        body: "Your form symposium was successfully approved, published, and uploaded to the dashboard & Facebook.",
        timestamp: new Date().toISOString()
      }
    ],
    facebookPosts: [
      {
        id: "fb_1",
        pageId: "STUDENT_COUNCIL_PAGE_ID",
        postId: "fb_post_9918231",
        message: "Check out Web3 & AI Tech Symposium Registration: Register for our annual tech symposium. Includes workshops on Generative AI and Smart Contracts. Public Form.",
        timestamp: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
  return defaultDb;
}

const db = initDatabase();

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

/* ==========================================================================
   ROLE-BASED OR CONTEXT-BASED DATA LAYER GUARD
   ========================================================================== */
function authorizeRole(rolesAllowed: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = req.headers["x-user-role"] as string;
    const userId = req.headers["x-user-id"] as string;
    if (!userRole || !userId) {
      return res.status(401).json({ error: "Missing identity headers. Access Denied." });
    }
    const requestingUser = db.users.find((u: any) => u.id === userId && u.status === "ACTIVE");
    if (!requestingUser) {
      return res.status(401).json({ error: "User inactive or registered role not found." });
    }
    if (!rolesAllowed.includes(requestingUser.role)) {
      return res.status(403).json({ error: `Requires role: ${rolesAllowed.join(" or ")}. Your Role: ${requestingUser.role}` });
    }
    req.body._userId = userId;
    req.body._userName = requestingUser.name;
    req.body._userRole = requestingUser.role;
    next();
  };
}

/* ==========================================================================
   SIMULATED EXTERNAL SERVICES (REAL TRANSACTION LOGS SAVED IN DATABASE)
   ========================================================================== */
interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
}

function sendSimulatedEmail(recipient: string, subject: string, body: string) {
  // Try calling third-party keys if Resend/SendGrid is configured or fallback to Simulation
  console.log(`[EMAIL DISPATCH] To: ${recipient} | Subject: ${subject} | Body: ${body}`);
  const mailLog: EmailLog = {
    id: "em_" + Math.random().toString(36).substring(2, 9),
    recipient,
    subject,
    body,
    timestamp: new Date().toISOString(),
  };
  if (!db.transactionalEmails) {
    db.transactionalEmails = [];
  }
  db.transactionalEmails.push(mailLog);
  saveDb();
}

function sendSimulatedFacebookPost(formTitle: string, formDesc: string) {
  console.log(`[FACEBOOK DISPATCH] Page ID: ${db.orgInfo.fbPageId} | Posting Form: ${formTitle}`);
  const fbLog = {
    id: "fb_" + Math.random().toString(36).substring(2, 9),
    pageId: db.orgInfo.fbPageId,
    postId: "fb_post_" + Math.random().toString(36).substring(2, 11),
    message: `📣 New Public Workflow Launched: ${formTitle}!\n\n${formDesc}\n\nJoin and answer using the shareable link below!`,
    timestamp: new Date().toISOString(),
  };
  if (!db.facebookPosts) {
    db.facebookPosts = [];
  }
  db.facebookPosts.push(fbLog);
  saveDb();
  return fbLog.postId;
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// Identity Switchers & Member lists
app.get("/api/users", (req, res) => {
  res.json(db.users);
});

app.post("/api/users", authorizeRole(["LEAD"]), (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: "Email, name, and role are required." });
  }
  const id = "usr_" + Math.random().toString(36).substring(2, 9);
  const newUser = { id, email, name, role, status: "ACTIVE" };
  db.users.push(newUser);
  saveDb();
  res.status(201).json(newUser);
});

app.patch("/api/users/:id/role", authorizeRole(["LEAD"]), (req, res) => {
  const { role } = req.body;
  const user = db.users.find((u: any) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.role = role;
  saveDb();
  res.json(user);
});

app.delete("/api/users/:id", authorizeRole(["LEAD"]), (req, res) => {
  db.users = db.users.filter((u: any) => u.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Organization Management
app.get("/api/org", (req, res) => {
  res.json(db.orgInfo);
});

app.post("/api/org", authorizeRole(["LEAD"]), (req, res) => {
  const { name, fbPageId, fbAccessToken, emailApiKey, senderEmail } = req.body;
  db.orgInfo = {
    id: db.orgInfo.id || "org_default",
    name: name || db.orgInfo.name,
    fbPageId: fbPageId || db.orgInfo.fbPageId,
    fbAccessToken: fbAccessToken || db.orgInfo.fbAccessToken,
    emailApiKey: emailApiKey || db.orgInfo.emailApiKey,
    senderEmail: senderEmail || db.orgInfo.senderEmail
  };
  saveDb();
  res.json(db.orgInfo);
});

// Forms
app.get("/api/forms", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  const userId = req.headers["x-user-id"] as string;

  // Role based filtering at the source!
  if (!userRole || !userId) {
    return res.status(401).json({ error: "Identification headers required." });
  }

  // All organization subaccount members can see all forms in the database
  // ("Forms page is where all forms are in. It is the database of all forms published, in progress, and rejected.")
  res.json(db.forms);
});

app.get("/api/forms/:id", (req, res) => {
  // Public access for respondents bypassing auth header check, but organization roles checked otherwise.
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });
  res.json(form);
});

// Create Form
app.post("/api/forms", authorizeRole(["CREATOR", "LEAD"]), (req, res) => {
  const { title, description, isPublic, socialMediaCaption, fields } = req.body;
  const formId = "form_" + Math.random().toString(36).substring(2, 9);
  
  const newForm = {
    id: formId,
    title: title || "Untitled Form Template",
    description: description || "Ready to gather submissions.",
    status: "DRAFT",
    creatorId: req.body._userId,
    creatorName: req.body._userName,
    isPublic: isPublic !== undefined ? isPublic : true,
    socialMediaCaption: socialMediaCaption || "",
    fields: fields || [],
    comments: [],
    editHistory: [
      {
        id: "hist_" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        memberId: req.body._userId,
        memberName: req.body._userName,
        fieldName: "creation",
        oldValue: "",
        newValue: "Created new Draft Template"
      }
    ],
    collaborators: [],
    createdAt: new Date().toISOString()
  };

  db.forms.push(newForm);
  saveDb();
  res.status(201).json(newForm);
});

// Save or Update Form Template (Granular edit history tracker)
app.put("/api/forms/:id", authorizeRole(["CREATOR", "LEAD"]), (req, res) => {
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Form template not found" });

  // Enforce access rule at pure data-layer!
  const isCreator = form.creatorId === req.body._userId;
  const isCollaborator = form.collaborators.includes(req.body._userId);
  const isLead = req.body._userRole === "LEAD";

  if (!isCreator && !isCollaborator && !isLead) {
    return res.status(403).json({ error: "You are not the creator or an authorized collaborator for this template." });
  }

  const { title, description, isPublic, socialMediaCaption, fields, status, collaborators } = req.body;
  const historyEntries: any[] = [];
  const trackingTime = new Date().toISOString();

  const recordChange = (fieldName: string, oldVal: string, newVal: string) => {
    historyEntries.push({
      id: "hist_" + Math.random().toString(36).substring(2, 9),
      timestamp: trackingTime,
      memberId: req.body._userId,
      memberName: req.body._userName,
      fieldName,
      oldValue: oldVal,
      newValue: newVal
    });
  };

  if (title !== undefined && title !== form.title) {
    recordChange("title", form.title, title);
    form.title = title;
  }
  if (description !== undefined && description !== form.description) {
    recordChange("description", form.description, description);
    form.description = description;
  }
  if (isPublic !== undefined && isPublic !== form.isPublic) {
    recordChange("isPublic", form.isPublic ? "true" : "false", isPublic ? "true" : "false");
    form.isPublic = isPublic;
  }
  if (socialMediaCaption !== undefined && socialMediaCaption !== form.socialMediaCaption) {
    recordChange("socialMediaCaption", form.socialMediaCaption || "", socialMediaCaption);
    form.socialMediaCaption = socialMediaCaption;
  }
  if (fields !== undefined) {
    recordChange("fields", `${form.fields.length} fields`, `${fields.length} fields`);
    form.fields = fields;
  }
  if (collaborators !== undefined) {
    recordChange("collaborators", form.collaborators.join(","), collaborators.join(","));
    form.collaborators = collaborators;
  }

  // Move status if we are moving from DRAFT to REVIEW_PENDING or other
  if (status !== undefined && status !== form.status) {
    recordChange("status", form.status, status);
    form.status = status;
  }

  form.editHistory = [...historyEntries, ...form.editHistory];
  saveDb();
  res.json(form);
});

// Submit Form Proposal reviews (Lead Member workflow)
app.post("/api/forms/:id/review", authorizeRole(["LEAD"]), (req, res) => {
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });

  const { action, comment } = req.body; // "PUBLISH", "REVISION", "REJECT", "APPEAL_APPROVED"
  const commentId = "com_" + Math.random().toString(36).substring(2, 9);
  
  const creatorUser = db.users.find((u: any) => u.id === form.creatorId);
  const creatorEmail = creatorUser ? creatorUser.email : "creator@orgform.edu";

  if (action === "PUBLISH") {
    form.status = "PUBLISHED";
    // Send auto email
    sendSimulatedEmail(
      creatorEmail,
      `Form template published: ${form.title}`,
      `Dear ${form.creatorName},\n\nYour submitted form template "${form.title}" has been APPROVED and successfully PUBLISHED by ${req.body._userName}.\n\nComments: ${comment || "None"}`
    );

    // Create a dashboard announcement matching category Survey
    const announcementId = "post_" + Math.random().toString(36).substring(2, 9);
    db.posts.unshift({
      id: announcementId,
      title: `Form Template Active: ${form.title}`,
      content: `A new registration workflow has been published and is open for entries: "${form.description}". Submissions are now active.`,
      category: "Survey",
      authorId: req.body._userId,
      authorName: req.body._userName,
      authorRole: "LEAD",
      createdAt: new Date().toISOString(),
      attachedFormId: form.id
    });

    // facebook graph API posting
    if (form.isPublic) {
      const fbPostId = sendSimulatedFacebookPost(form.title, form.socialMediaCaption || form.description);
      form.facebookPostId = fbPostId;
    }
  } else if (action === "REJECT") {
    form.status = "REJECTED";
    sendSimulatedEmail(
      creatorEmail,
      `Form template rejected: ${form.title}`,
      `Dear ${form.creatorName},\n\nYour form template "${form.title}" has been rejected during administrative review.\n\nDecision Comment: ${comment || "Failed to meet student organization requirements."}`
    );
  } else if (action === "REVISION") {
    form.status = "REVISION_PENDING";
    sendSimulatedEmail(
      creatorEmail,
      `Form revision requested: ${form.title}`,
      `Dear ${form.creatorName},\n\nYour submitted form template "${form.title}" requires modifications before approval.\n\nChange request comments: ${comment || "No directions specified."}`
    );
  }

  // Append review comment
  if (comment) {
    form.comments.unshift({
      id: commentId,
      authorId: req.body._userId,
      authorName: req.body._userName,
      authorRole: req.body._userRole,
      text: comment,
      timestamp: new Date().toISOString()
    });
  }

  // Log in edit history
  form.editHistory.unshift({
    id: "hist_" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    memberId: req.body._userId,
    memberName: req.body._userName,
    fieldName: "reviewDecision",
    oldValue: "REVIEW_PENDING",
    newValue: form.status
  });

  saveDb();
  res.json(form);
});

// Creator appeal of rejected forms
app.post("/api/forms/:id/appeal", authorizeRole(["CREATOR"]), (req, res) => {
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });

  if (form.status !== "REJECTED") {
    return res.status(400).json({ error: "Only rejected forms can be appealed." });
  }

  const { appealNote } = req.body;
  form.status = "REVIEW_PENDING"; // Re-enter review queue

  form.comments.unshift({
    id: "com_" + Math.random().toString(36).substring(2, 9),
    authorId: req.body._userId,
    authorName: req.body._userName,
    authorRole: req.body._userRole,
    text: `⚠️ creator appeal filed:\n"${appealNote}"`,
    timestamp: new Date().toISOString()
  });

  form.editHistory.unshift({
    id: "hist_" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    memberId: req.body._userId,
    memberName: req.body._userName,
    fieldName: "appeal",
    oldValue: "REJECTED",
    newValue: "REVIEW_PENDING (APPEALED)"
  });

  // Notify Lead Members about appeal
  const leads = db.users.filter((u: any) => u.role === "LEAD");
  leads.forEach((lead: any) => {
    sendSimulatedEmail(
      lead.email,
      `Appeal filed for: ${form.title}`,
      `Creator ${form.creatorName} has appealed the rejection of template "${form.title}". Note:\n${appealNote}`
    );
  });

  saveDb();
  res.json(form);
});

// Dashboard Posts
app.get("/api/posts", (req, res) => {
  res.json(db.posts);
});

app.post("/api/posts", authorizeRole(["CREATOR", "FACILITATOR", "LEAD"]), (req, res) => {
  const { title, content, category, attachedFormId } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Missing required post fields." });
  }

  const newPost = {
    id: "post_" + Math.random().toString(36).substring(2, 9),
    title,
    content,
    category,
    authorId: req.body._userId,
    authorName: req.body._userName,
    authorRole: req.body._userRole,
    createdAt: new Date().toISOString(),
    attachedFormId: attachedFormId || undefined
  };

  db.posts.unshift(newPost);
  saveDb();
  res.status(201).json(newPost);
});

// Form Responses System (Facilitator ONLY data isolation rules!)
app.get("/api/forms/:id/responses", authorizeRole(["FACILITATOR", "LEAD"]), (req, res) => {
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });

  // Access validation: ONLY Facilitator or Leads can query responses!
  const results = db.responses.filter((r: any) => r.formId === req.params.id);
  res.json(results);
});

// Save respondent submission (No account required!)
app.post("/api/respond/forms/:id", (req, res) => {
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (!form) return res.status(404).json({ error: "Form template not found." });
  if (form.status !== "PUBLISHED") {
    return res.status(400).json({ error: "Form template is not currently accepting responses." });
  }

  const { answers, respondentEmail } = req.body;
  if (!answers) {
    return res.status(400).json({ error: "Required answer data missing." });
  }

  const newResponse = {
    id: "resp_" + Math.random().toString(36).substring(2, 9),
    formId: req.params.id,
    answers,
    submittedAt: new Date().toISOString(),
    respondentEmail: respondentEmail || undefined
  };

  db.responses.push(newResponse);

  // If provided, auto subscribe them to updates
  if (respondentEmail) {
    const isSubscribed = db.subscribers.some((s: any) => s.formId === req.params.id && s.email.toLowerCase() === respondentEmail.toLowerCase());
    if (!isSubscribed) {
      db.subscribers.push({
        id: "sub_" + Math.random().toString(36).substring(2, 9),
        formId: req.params.id,
        email: respondentEmail.toLowerCase(),
        createdAt: new Date().toISOString()
      });
    }
  }

  saveDb();
  res.status(201).json({ success: true, responseId: newResponse.id });
});

// Form specific updates / isolated Announcements
app.get("/api/forms/:id/announcements", (req, res) => {
  const announcements = db.formAnnouncements.filter((a: any) => a.formId === req.params.id);
  res.json(announcements);
});

app.post("/api/forms/:id/announcements", authorizeRole(["FACILITATOR", "LEAD"]), (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content required." });

  const newAnn = {
    id: "f_ann_" + Math.random().toString(36).substring(2, 9),
    formId: req.params.id,
    title,
    content,
    createdAt: new Date().toISOString(),
    authorId: req.body._userId,
    authorName: req.body._userName
  };

  db.formAnnouncements.unshift(newAnn);
  saveDb();

  // Trigger dispatch to subscribers!
  const subs = db.subscribers.filter((s: any) => s.formId === req.params.id);
  subs.forEach((sub: any) => {
    sendSimulatedEmail(
      sub.email,
      `[Update from Form ${req.params.id}] ${title}`,
      `Hi subscriber,\n\nA new announcement was posted on the form announcement page: "${title}"\n\nContent:\n${content}\n\nUnsubscribe from this list at any time.`
    );
  });

  res.status(201).json(newAnn);
});

// Subscribers Management
app.get("/api/forms/:id/subscribers", authorizeRole(["FACILITATOR", "LEAD"]), (req, res) => {
  const list = db.subscribers.filter((s: any) => s.formId === req.params.id);
  res.json(list);
});

app.post("/api/forms/:id/subscribers", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const isSubscribed = db.subscribers.some((s: any) => s.formId === req.params.id && s.email.toLowerCase() === email.toLowerCase());
  if (isSubscribed) return res.status(200).json({ message: "Already subscribed." });

  const newSub = {
    id: "sub_" + Math.random().toString(36).substring(2, 9),
    formId: req.params.id,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString()
  };

  db.subscribers.push(newSub);
  saveDb();
  res.status(201).json(newSub);
});

// Targeted bulk/single email campaigns by form Facilitator
app.post("/api/campaigns", authorizeRole(["FACILITATOR", "LEAD"]), (req, res) => {
  const { recipients, subject, body } = req.body;
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Recipient array cannot be empty." });
  }
  if (!subject || !body) {
    return res.status(400).json({ error: "Subject and Body content are required" });
  }

  recipients.forEach((email: string) => {
    sendSimulatedEmail(email, subject, body);
  });

  res.json({ success: true, count: recipients.length });
});

// Logs for simulation inspectors inside UI
app.get("/api/logs/emails", (req, res) => {
  res.json(db.transactionalEmails || []);
});

app.get("/api/logs/facebook", (req, res) => {
  res.json(db.facebookPosts || []);
});

/* ==========================================================================
   AI ASSISTANT: RETRIEVE COMPLIED INTENT MATCH SCHEMA VIA @GOOGLE/GENAI
   ========================================================================== */
app.post("/api/gemini/generate-form", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "AI prompt matches cannot be empty." });
  }

  const aiClient = getGeminiClient();

  if (!aiClient) {
    // Elegant fallbacks if GEMINI_API_KEY is not configured yet
    console.log("Gemini API key not found in environment, triggering graceful demo response.");
    const sampleAIForm = [
      { id: "ai_q1", type: "text", label: "Professional Title", required: true, placeholder: "e.g. Software Architect" },
      { id: "ai_q2", type: "number", label: "Years of Experience", required: true },
      { id: "ai_q3", type: "select", label: "Preferred Coding Stack", required: true, options: ["TypeScript / Node", "Rust / Go", "Python / PyTorch", "Java Spring"] },
      { id: "ai_q4", type: "checkbox", label: "Organization Interests", required: false, options: ["Hackathons", "Mentoring", "Speaker Events"] },
      { id: "ai_q5", type: "textarea", label: "Describe matches or expectations", required: false, placeholder: "I want to help design scalable core platforms." }
    ];
    return res.json({
      title: "AI-Generated Student Forum",
      description: `Automatically created based on: "${prompt}" (Simulated AI Mode)`,
      fields: sampleAIForm
    });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an AI assistant built into OrgForm (a student organization form builder). The user has provided this natural language description of the registration or internal form they want to build:

"${prompt}"

Generate a structured JSON representation representing the form FIELDS that perfectly capture the user's requirements. Your response MUST be valid JSON only. Rely strictly on the schema type provided.

Expected Output JSON structure:
{
  "title": "A short elegant title for the form",
  "description": "A high-level explanation of the form",
  "fields": [
    {
      "id": "unique_string_id",
      "type": "text" | "textarea" | "radio" | "checkbox" | "select" | "number",
      "label": "Human readable exact question label",
      "required": true | false,
      "options": ["Option 1", "Option 2"] // Only include this property if type is radio, checkbox, or select. Must be an array of strings.
      "placeholder": "Descriptive short helper tip inside input. Only for text, number or textarea"
    }
  ]
}

Ensure types are strictly from the allowed options above. Make sure the JSON is parsed reliably. Put ONLY valid JSON in your reply, with no markdown code block surrounding it, or use code block with JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  label: { type: Type.STRING },
                  required: { type: Type.BOOLEAN },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  placeholder: { type: Type.STRING }
                },
                required: ["id", "type", "label", "required"]
              }
            }
          },
          required: ["title", "description", "fields"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    const parsed = JSON.parse(text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini compilation failed:", error);
    res.status(500).json({ error: "AI form generation failed. " + error.message });
  }
});

/* ==========================================================================
   VITE & STATIC ASSET MIDDLEWARE FOR ASYNC PREVIEW INFRASTRUCTURE
   ========================================================================== */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OrgForm Backend] Running on http://localhost:${PORT}`);
  });
}

startServer();
