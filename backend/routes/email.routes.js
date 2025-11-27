import express from "express";

import {
  getAllEmails,
  getEmailById,
  getPrompts,
  getResponseDraft,
  updatePrompts,
  emailIngestion,
  regenerateDraft,
  chatWithEmail,
  reanalyzeAllEmails,
  analyzeEmail,
  getChatSuggestions,
} from "../controllers/email.controller.js";

const router = express.Router();

// Email routes
router.get("/emails", getAllEmails);
router.get("/emails/:id", getEmailById);
router.post("/emails/ingest", emailIngestion);
router.post("/emails/:id/analyze", analyzeEmail);
router.post("/emails/reanalyze", reanalyzeAllEmails);
router.post("/emails/:id/generate-draft", getResponseDraft);
router.post("/emails/:id/regenerate-draft", regenerateDraft);
router.post("/emails/:id/chat", chatWithEmail);
router.get("/emails/:id/suggestions", getChatSuggestions);

// Prompt routes
router.get("/prompts", getPrompts);
router.post("/prompts/update", updatePrompts);

export default router;
