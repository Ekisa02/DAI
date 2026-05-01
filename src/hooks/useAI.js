import { useState } from "react";
import { useStore } from "../store/useStore";

const BASE = "https://openrouter.ai/api/v1/chat/completions";
const KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Use the working model from environment variables as primary
const PRIMARY_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || "nvidia/nemotron-nano-12b-v2-vl:free";
const TEXT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL_TEXT || "arcee-ai/trinity-large-preview:free";

// Fallback list for resilience - but primary uses your env vars
const FREE_MODELS = [
  "nvidia/nemotron-nano-12b-v2-vl:free",  // Your working model
  "arcee-ai/trinity-large-preview:free",   // Your backup model
  "deepseek/deepseek-chat-v3-0324:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-4-scout:free",
];

function buildSystem(profile) {
  const modeMap = {
    strict:
      "STRICT MODE: Be direct, no fluff, push hard, short punchy sentences.",
    zen: "ZEN MODE: Calm, mindful, compassionate, supportive tone.",
    balanced: "BALANCED MODE: Smart, practical, warm, realistic.",
  };
  const roleCtx =
    profile.role === "student"
      ? "The user is a STUDENT. All advice, plans, and responses must be academic/student-focused."
      : profile.role === "professional"
        ? "The user is a PROFESSIONAL. All advice must be career/work focused at a professional level."
        : "The user is BOTH a student and professional. Show both academic and professional perspectives.";

  return `You are Decimate AI, an elite decision intelligence assistant.
${modeMap[profile.aiPersonality] || modeMap.balanced}
${roleCtx}
User: ${profile.name || "User"} | Peak hours: ${profile.workStyle || "flexible"} | Goals: ${(profile.goals || []).join(", ") || "productivity"}
${profile.customInstructions ? "Custom: " + profile.customInstructions : ""}
Be concise. Max 3 short paragraphs unless creating a structured plan/timetable.`;
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const profile = useStore((s) => s.profile);

  async function callWithFallback(messages, modelIndex = 0, retryCount = 0) {
    // Build model list starting with your working credentials
    const modelsToTry = modelIndex === 0 ? 
      [PRIMARY_MODEL, TEXT_MODEL, ...FREE_MODELS.filter(m => m !== PRIMARY_MODEL && m !== TEXT_MODEL)] :
      FREE_MODELS;
    
    const currentIndex = modelIndex === 0 ? modelIndex : modelIndex - 2; // Adjust for the two env models
    
    if (currentIndex >= modelsToTry.length) {
      throw new Error(
        "All free models are currently unavailable. Please try again in 30-60 seconds."
      );
    }

    const model = modelsToTry[currentIndex];
    
    // Add delay between attempts
    if (currentIndex > 0 || retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 500 * (currentIndex + 1)));
    }

    try {
      console.log(`[Decimate AI] Trying model: ${model}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
      
      const res = await fetch(BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Decimate AI",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1200,
          temperature: 0.72,
          route: "fallback", // Helps with OpenRouter routing
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${res.status}`;
        
        console.warn(`[Decimate AI] Model "${model}" error: ${errMsg}`);
        
        // Check if we should retry or fallback
        const isRetryable = 
          errMsg.toLowerCase().includes("rate limit") ||
          errMsg.toLowerCase().includes("too many requests") ||
          res.status === 429;
        
        const isFallbackable = 
          isRetryable ||
          errMsg.toLowerCase().includes("no endpoints") ||
          errMsg.toLowerCase().includes("not found") ||
          errMsg.toLowerCase().includes("unavailable") ||
          errMsg.toLowerCase().includes("provider error") ||
          res.status === 404 ||
          res.status === 503 ||
          res.status === 502;

        // Retry same model for rate limits
        if (isRetryable && retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return callWithFallback(messages, modelIndex, retryCount + 1);
        }

        // Move to next model for other errors
        if (isFallbackable) {
          return callWithFallback(messages, modelIndex + 1, 0);
        }

        throw new Error(errMsg);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "";
      
      if (!content) {
        throw new Error("Empty response from model");
      }
      
      console.log(`[Decimate AI] Success with model: ${model}`);
      return content;
      
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        throw new Error("Network error: Please check your internet connection.");
      }
      
      // If it's not a network error and we haven't exhausted retries, try next model
      if (retryCount < 1) {
        return callWithFallback(messages, modelIndex + 1, 0);
      }
      
      throw err;
    }
  }

  async function callAI(messages) {
    if (!KEY) {
      return {
        ok: false,
        text: "⚠️ API key missing.\n\nAdd VITE_OPENROUTER_API_KEY to your Vercel environment variables.",
      };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const text = await callWithFallback(messages);
      return { ok: true, text };
    } catch (e) {
      const errorMessage = e.message;
      setError(errorMessage);
      
      // User-friendly error messages
      if (errorMessage.includes("All free models")) {
        return { 
          ok: false, 
          text: `⚠️ ${errorMessage}\n\nYour working models are:\n• ${PRIMARY_MODEL}\n• ${TEXT_MODEL}\n\nCheck https://openrouter.ai/status for outages.`
        };
      }
      
      return { ok: false, text: `Error: ${errorMessage}` };
    } finally {
      setLoading(false);
    }
  }

  // ── CHAT ───────────────────────────────────────────────────────────
  async function chat(userMsg, history = []) {
    const messages = [
      { role: "system", content: buildSystem(profile) },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMsg },
    ];
    return callAI(messages);
  }

  // ── ANALYSE DECISION ───────────────────────────────────────────────
  async function analyseDecision(choices, context = "") {
    const prompt = `The user needs help making a decision.
${context ? `Context: ${context}` : ""}
Options to choose from:
${choices.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Analyse these options. The user is a ${profile.role || "student/professional"}.
Respond in this EXACT format (no extra text before or after):

BEST CHOICE: [state the exact option text here]
WHY: [2-3 sentences explaining why this is the best choice]
TRADE-OFF: [1 sentence on what they give up by not choosing the others]`;

    return callAI([
      { role: "system", content: buildSystem(profile) },
      { role: "user", content: prompt },
    ]);
  }

  // ── REGENERATE DECISION ────────────────────────────────────────────
  async function reanalyseDecision(choices, context, previousChoice) {
    const prompt = `The user rejected: "${previousChoice}". Give a DIFFERENT recommendation.
${context ? `Context: ${context}` : ""}
Options:
${choices.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Pick a DIFFERENT option (not "${previousChoice}") and explain why it could work.
Respond in this EXACT format:

BEST CHOICE: [different option text]
WHY: [2-3 sentences with fresh reasoning]
TRADE-OFF: [1 sentence]`;

    return callAI([
      { role: "system", content: buildSystem(profile) },
      { role: "user", content: prompt },
    ]);
  }

  // ── CREATE PLAN ────────────────────────────────────────────────────
  async function createPlan(tasks, uploadedText = "") {
    const isStudent = profile.role === "student";
    const isPro = profile.role === "professional";

    let prompt;
    if (isStudent) {
      prompt = `Create a detailed STUDENT TIMETABLE for:
${tasks.length > 0 ? tasks.join("\n") : "General study tasks"}
${uploadedText ? `\nUploaded content:\n${uploadedText}` : ""}

Student peak hours: ${profile.workStyle || "flexible"}.
Include study blocks, short breaks, meals, and rest.
Use this exact format:

TIMETABLE TITLE: [title]

TIME BLOCKS:
[time] | [subject/task] | [duration] | [notes]
[time] | [subject/task] | [duration] | [notes]

STUDY TIPS:
- [tip 1]
- [tip 2]
- [tip 3]`;
    } else if (isPro) {
      prompt = `Create a PROFESSIONAL ACTION PLAN for:
${tasks.length > 0 ? tasks.join("\n") : "General work tasks"}
${uploadedText ? `\nUploaded content:\n${uploadedText}` : ""}

Peak hours: ${profile.workStyle || "flexible"}.
Use this exact format:

PLAN TITLE: [title]

PRIORITY TASKS:
[Priority] | [Task] | [Time Estimate] | [Expected Outcome]

EXECUTION SCHEDULE:
[time] | [task] | [focus level]

KEY MILESTONES:
- [milestone 1]
- [milestone 2]`;
    } else {
      prompt = `Create a COMBINED STUDENT & PROFESSIONAL DAILY PLAN for:
${tasks.length > 0 ? tasks.join("\n") : "General tasks"}
${uploadedText ? `\nUploaded content:\n${uploadedText}` : ""}

Peak hours: ${profile.workStyle || "flexible"}.

PLAN TITLE: [title]

MORNING (Academic Focus):
[time] | [task] | [notes]

AFTERNOON (Professional Focus):
[time] | [task] | [notes]

EVENING (Review & Rest):
[time] | [task] | [notes]

BALANCE TIPS:
- [tip]`;
    }

    return callAI([
      { role: "system", content: buildSystem(profile) },
      { role: "user", content: prompt },
    ]);
  }

  return {
    chat,
    analyseDecision,
    reanalyseDecision,
    createPlan,
    loading,
    error,
  };
}