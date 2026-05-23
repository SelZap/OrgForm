/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FormField } from "../types";
import { Plus, Trash, Sparkles, FileCode, CheckSquare, ListPlus, Wand2, Info } from "lucide-react";

interface FormBuilderUIProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  title: string;
  onTitleChange: (t: string) => void;
  description: string;
  onDescriptionChange: (d: string) => void;
}

export const FormBuilderUI: React.FC<FormBuilderUIProps> = ({
  fields,
  onFieldsChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "ai" | "code">("visual");

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Raw Code state
  const [rawJson, setRawJson] = useState(JSON.stringify(fields, null, 2));
  const [jsonError, setJsonError] = useState("");

  // Handlers for visual list
  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: "q_" + Math.random().toString(36).substring(2, 9),
      type,
      label: `Question #${fields.length + 1} (${type})`,
      required: false,
    };
    if (["radio", "checkbox", "select"].includes(type)) {
      newField.options = ["Option A", "Option B"];
    }
    const updated = [...fields, newField];
    onFieldsChange(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  const removeField = (id: string) => {
    const updated = fields.filter((f) => f.id !== id);
    onFieldsChange(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  const updateField = (id: string, updatedProps: Partial<FormField>) => {
    const updated = fields.map((f) => {
      if (f.id === id) {
        return { ...f, ...updatedProps } as FormField;
      }
      return f;
    });
    onFieldsChange(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const currentOptions = field.options || [];
    updateField(fieldId, {
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    });
  };

  const removeOption = (fieldId: string, index: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;
    const currentOptions = [...field.options];
    currentOptions.splice(index, 1);
    updateField(fieldId, { options: currentOptions });
  };

  const updateOptionText = (fieldId: string, index: number, value: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;
    const currentOptions = [...field.options];
    currentOptions[index] = value;
    updateField(fieldId, { options: currentOptions });
  };

  // AI compilation
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/gemini/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
      } else {
        if (data.title) onTitleChange(data.title);
        if (data.description) onDescriptionChange(data.description);
        if (Array.isArray(data.fields)) {
          onFieldsChange(data.fields);
          setRawJson(JSON.stringify(data.fields, null, 2));
          setActiveTab("visual");
        }
      }
    } catch (e: any) {
      setAiError(e.message || "Failed to parse AI structure.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply RAW JSON change
  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        throw new Error("Form Fields specification must be a JSON Array []");
      }
      // Basic structure validator
      parsed.forEach((item, idx) => {
        if (!item.id || !item.type || !item.label) {
          throw new Error(`Field index ${idx} is missing 'id', 'type', or 'label' specifications.`);
        }
      });
      onFieldsChange(parsed);
      setJsonError("");
      setActiveTab("visual");
    } catch (err: any) {
      setJsonError("Invalid JSON pattern: " + err.message);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden font-sans shadow-sm">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab("visual")}
          className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-r border-gray-200 transition-colors cursor-pointer ${
            activeTab === "visual"
              ? "bg-white border-b-2 border-b-black text-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-gray-500" />
          <span>Interactive Editor</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-r border-gray-200 transition-colors cursor-pointer ${
            activeTab === "ai"
              ? "bg-white border-b-2 border-b-black text-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-gray-500" />
          <span>Gemini AI Copilot</span>
        </button>

        <button
          onClick={() => {
            setRawJson(JSON.stringify(fields, null, 2));
            setActiveTab("code");
          }}
          className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === "code"
              ? "bg-white border-b-2 border-b-black text-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-gray-500" />
          <span>JSON Schema Editor</span>
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-6">
        
        {/* TAB 1: VISUAL GOOGLE FORMS BUILDING BLOCKS */}
        {activeTab === "visual" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start border-b border-gray-200 pb-6">
              <div className="md:col-span-1">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 font-mono">Structure Actions</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-4">Click below to append a new native form element into user list.</p>
                <div className="flex flex-col gap-1.5">
                  {(["text", "textarea", "number", "select", "radio", "checkbox"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addField(t)}
                      className="flex items-center justify-between text-left px-3 py-2 bg-white text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-300 rounded transition-colors cursor-pointer"
                    >
                      <span>Add {t.toUpperCase()} field</span>
                      <Plus className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic visual editor items list */}
              <div className="md:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 font-mono">Form Questions: {fields.length} item{fields.length === 1 ? "" : "s"}</span>
                  {fields.length === 0 && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono font-semibold">Empty Fields Setup</span>
                  )}
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 border border-gray-250 rounded p-4 relative group hover:border-gray-400 transition-colors">
                      <div className="absolute top-2.5 right-2 flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                          {field.type.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-1 text-gray-400 hover:text-red-650 transition-colors cursor-pointer"
                          title="Delete Field"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-1.5">
                        <div className="md:col-span-8">
                          <label className="block text-[10px] font-bold text-gray-400 font-mono mb-1 uppercase">Field Label / Title</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded text-gray-800 text-xs px-3 py-2 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                            placeholder="e.g. Enter your email"
                          />
                        </div>

                        <div className="md:col-span-4 self-end">
                          <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="w-3.5 h-3.5 rounded text-black focus:ring-black bg-white border-gray-300"
                            />
                            <span className="text-xs font-semibold text-gray-500 select-none">Mark Required</span>
                          </label>
                        </div>
                      </div>

                      {/* Display placeholder configuration */}
                      {["text", "textarea", "number"].includes(field.type) && (
                        <div className="mt-3">
                          <label className="block text-[10px] font-bold text-gray-400 font-mono mb-1 uppercase">Input Hint Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded text-gray-800 text-xs px-3 py-1.5 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                            placeholder="e.g. Enter your full name here..."
                          />
                        </div>
                      )}

                      {/* Display Radio, Checkbox, Select multi option values */}
                      {["radio", "checkbox", "select"].includes(field.type) && (
                        <div className="mt-3 bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider font-mono">Options Configuration</span>
                            <button
                              type="button"
                              onClick={() => addOption(field.id)}
                              className="text-[10px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ListPlus className="w-3 h-3 text-gray-600" />
                              <span>Add Option</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(field.options || []).map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-450 font-mono font-bold w-5">{oIdx + 1}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOptionText(field.id, oIdx, e.target.value)}
                                  className="flex-1 bg-white border border-gray-300 rounded text-gray-800 text-xs px-2 py-1 focus:ring-1 focus:ring-black focus:border-black"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(field.id, oIdx)}
                                  className="p-1 text-gray-450 hover:text-red-500 cursor-pointer"
                                >
                                  <Trash className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded p-8 text-center text-gray-400 font-sans">
                      No fields configured yet. Click an action element on the left or use the Gemini AI Copilot above to build the template automatically!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GEMINI NARRATIVE COMPILER CO-PILOT */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded border border-gray-200 p-4 flex gap-3 text-gray-750">
              <Sparkles className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-gray-900 mb-1">Interactive Gemini AI Form Builder</h5>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Describe what kind of registration or submission form you wish to build in natural language.
                  Gemini will analyze your description and automatically generate the perfect questionnaire structure with accurate titles, descriptions, and field choices.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-450 font-mono uppercase">What is your form about?</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="w-full bg-white border border-gray-300 rounded text-gray-850 text-xs p-3 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="e.g. Build a student developer recruitment form that asks for applicant full name, student council ID, portfolio github URL, year level with options freshman to senior, and multiple workshops checkbox choices."
              />
              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {aiError}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-40"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isAiLoading ? "Processing Form Context with Gemini..." : "Generate Form Template"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RAW JSON CODE INTEGRITY COMPILER */}
        {activeTab === "code" && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded border border-gray-200 p-4 flex gap-3 text-gray-750">
              <Info className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-gray-950 mb-1">Direct Developer JSON Block Entry</h5>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Inspect or manually modify the raw fields schema array of your form template. Changes made on visual editor are automatically mapped back here. Ensure array structure complies.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-450 font-mono uppercase">Raw JSON Specification</label>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                rows={12}
                className="w-full bg-white border border-gray-200 rounded text-gray-800 text-xs font-mono p-4 focus:ring-1 focus:ring-black focus:border-black focus:outline-none"
                placeholder="[ { id: 'q1', ... } ]"
              />
              {jsonError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {jsonError}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleJsonApply}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Parse & Apply Schema</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
