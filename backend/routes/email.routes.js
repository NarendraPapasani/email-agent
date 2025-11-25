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
} from "../controllers/email.controller.js";

const router = express.Router();

// Email routes
router.get("/emails", getAllEmails);
router.get("/emails/:id", getEmailById);
router.post("/emails/ingest", emailIngestion);
router.post("/emails/reanalyze", reanalyzeAllEmails);
router.post("/emails/:id/generate-draft", getResponseDraft);
router.post("/emails/:id/regenerate-draft", regenerateDraft);
router.post("/emails/:id/chat", chatWithEmail);

// Prompt routes
router.get("/prompts", getPrompts);
router.post("/prompts/update", updatePrompts);

export default router;
