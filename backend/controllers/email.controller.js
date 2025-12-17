import prisma from "../utils/prisma.js";
import connectAI from "../utils/genAI.js";
import dotenv from "dotenv";

dotenv.config();

const groq = connectAI();
const AI_MODEL = "llama-3.3-70b-versatile";

const getAllEmails = async (req, res) => {
  try {
    console.log("Fetching all emails...");
    const emails = await prisma.email.findMany({
      orderBy: { recived_at: "desc" },
      include: { analysis: true },
    });

    console.log(`Found ${emails.length} emails`);
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.status(200).json(email);
  } catch (error) {
    console.error("Error fetching email:", error);
    res.status(500).json({ error: "Failed to fetch email" });
  }
};

const getPrompts = async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany();
    res.status(200).json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
};

const emailIngestion = async (req, res) => {
  try {
    const unreadEmails = await prisma.email.findMany({
      where: { analysis: null },
      take: 5,
    });

    if (!unreadEmails || unreadEmails.length === 0) {
      return res.status(200).json({ message: "No new emails to process." });
    }

    const prompts = await prisma.prompt.findMany();
    const catPrompt =
      prompts.find((p) => p.type === "categorization")?.content ||
      "Categorize this email";
    const actionPrompt =
      prompts.find((p) => p.type === "action_item")?.content ||
      "Extract action items";

    let processedCount = 0;
    let failedCount = 0;
    const DELAY_BETWEEN_REQUESTS = 2000;
    const MAX_RETRIES = 3;

    for (const email of unreadEmails) {
      let retries = 0;
      let success = false;

      while (retries < MAX_RETRIES && !success) {
        try {
          const aiPrompt = `
            Analyze this email based on these rules:
            1. Categorization Rule: "${catPrompt}"
            2. Action Item Rule: "${actionPrompt}"
            
            Email Content:
            Subject: ${email.subject}
            Body: ${email.body}
            
            STRICT OUTPUT FORMAT (JSON ONLY):
            {
              "category": "String",
              "summary": "String (2-3 sentences, detailed overview)",
              "action_items": [{"task": "String", "deadline": "String"}]
            }
          `;

          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: aiPrompt }],
            model: AI_MODEL,
            response_format: { type: "json_object" },
          });

          const text = chatCompletion.choices[0]?.message?.content.trim();

          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = {
              category: "General",
              summary: "Parse error",
              action_items: [],
            };
          }

          await prisma.emailAnalysis.upsert({
            where: { emailId: email.id },
            update: {
              category: data.category,
              summary: data.summary,
              actionItems: JSON.stringify(data.action_items),
            },
            create: {
              emailId: email.id,
              category: data.category,
              summary: data.summary,
              actionItems: JSON.stringify(data.action_items),
              responseDraft: null,
            },
          });

          processedCount++;
          success = true;
          console.log(
            `Analyzed email ${processedCount}/${unreadEmails.length}`
          );

          if (processedCount < unreadEmails.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
            );
          }
        } catch (error) {
          retries++;
          if (error.status === 429) {
            console.log(
              `Groq Rate limit hit. Retry ${retries}/${MAX_RETRIES}...`
            );
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } else {
            console.error(`Error on email ${email.id}:`, error.message);
            if (retries >= MAX_RETRIES) {
              failedCount++;
              break;
            }
          }
        }
      }
    }

    res.status(200).json({
      message: "Ingestion complete",
      processed: processedCount,
      failed: failedCount,
      total: unreadEmails.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePrompts = async (req, res) => {
  try {
    const updates = req.body;
    for (const [type, text] of Object.entries(updates)) {
      if (text) {
        await prisma.prompt.update({
          where: { type: type },
          data: { content: text },
        });
      }
    }
    await prisma.emailAnalysis.deleteMany({});
    res.status(200).json({ message: "Prompts updated and analysis cleared" });
  } catch (error) {
    console.error("Error updating prompts:", error);
    res.status(500).json({ error: "Failed to update prompts" });
  }
};

const getResponseDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
    });
    const promptData = await prisma.prompt.findUnique({
      where: { type: "auto_reply" },
    });
    const promptContent =
      promptData?.content || "Draft a professional reply to this email.";

    if (!email) return res.status(404).json({ error: "Email not found" });

    // Generate Draft
    const draftResult = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Incoming Email: "${email.body}"\nTASK: ${promptContent}\nOutput just the reply body.`,
        },
      ],
      model: AI_MODEL,
    });
    const draftText = draftResult.choices[0]?.message?.content;

    // Generate Summary
    const summaryResult = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Summarize this email in 2 sentences: "${email.body}"`,
        },
      ],
      model: AI_MODEL,
    });
    const summaryText = summaryResult.choices[0]?.message?.content;

    await prisma.emailAnalysis.upsert({
      where: { emailId: parseInt(id) },
      update: { responseDraft: draftText },
      create: {
        emailId: parseInt(id),
        category: "General",
        summary: summaryText,
        actionItems: JSON.stringify([]),
        responseDraft: draftText,
      },
    });

    res.status(200).json({ responseDraft: draftText, draft: draftText });
  } catch (error) {
    console.error("Error generating draft:", error);
    res.status(500).json({ error: "Failed to generate draft" });
  }
};

const regenerateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
    });
    const promptData = await prisma.prompt.findUnique({
      where: { type: "auto_reply" },
    });
    const promptContent =
      promptData?.content || "Draft a professional reply to this email.";

    if (!email) return res.status(404).json({ error: "Email not found" });

    const result = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Make this reply different from before.\nEmail: "${email.body}"\nTASK: ${promptContent}`,
        },
      ],
      model: AI_MODEL,
    });

    const draftText = result.choices[0]?.message?.content;

    await prisma.emailAnalysis.update({
      where: { emailId: parseInt(id) },
      data: { responseDraft: draftText },
    });

    res.status(200).json({ responseDraft: draftText, draft: draftText });
  } catch (error) {
    console.error("Error regenerating draft:", error);
    res.status(500).json({ error: "Failed to regenerate draft" });
  }
};

const chatWithEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    if (!email) return res.status(404).json({ error: "Email not found" });

    const context = `Email from ${email.from}, Subject: ${email.subject}, Body: ${email.body}`;

    const result = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful email assistant." },
        {
          role: "user",
          content: `Context: ${context}\n\nQuestion: ${message}`,
        },
      ],
      model: AI_MODEL,
    });

    res.status(200).json({ response: result.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Chat failed" });
  }
};

const reanalyzeAllEmails = async (req, res) => {
  res
    .status(200)
    .json({ message: "Re-analysis triggered (logic same as ingestion)" });
};

const analyzeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    if (!email) return res.status(404).json({ error: "Email not found" });

    // If analysis exists, return the full email with analysis
    if (email.analysis) {
      return res.status(200).json(email);
    }

    const prompts = await prisma.prompt.findMany();
    const catPrompt =
      prompts.find((p) => p.type === "categorization")?.content ||
      "Categorize this email";
    const actionPrompt =
      prompts.find((p) => p.type === "action_item")?.content ||
      "Extract action items";

    const aiPrompt = `
      Analyze this email based on these rules:
      1. Categorization Rule: "${catPrompt}"
      2. Action Item Rule: "${actionPrompt}"
      
      Email Content:
      Subject: ${email.subject}
      Body: ${email.body}
      
      STRICT OUTPUT FORMAT (JSON ONLY):
      {
        "category": "String",
        "summary": "String (2-3 sentences, detailed overview)",
        "action_items": [{"task": "String", "deadline": "String"}]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: aiPrompt }],
      model: AI_MODEL,
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content.trim();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error in analyzeEmail:", e);
      data = {
        category: "General",
        summary: "Could not parse AI response.",
        action_items: [],
      };
    }

    // Save to DB
    await prisma.emailAnalysis.create({
      data: {
        emailId: email.id,
        category: data.category,
        summary: data.summary,
        actionItems: JSON.stringify(data.action_items || []),
        responseDraft: null,
      },
    });

    // Return the full email object with analysis
    const updatedEmail = await prisma.email.findUnique({
      where: { id: email.id },
      include: { analysis: true },
    });

    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Failed to analyze email" });
  }
};

const getChatSuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
    });

    if (!email) return res.status(404).json({ error: "Email not found" });

    const result = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
            Read this email and provide 4 short, relevant follow-up questions or chat suggestions that a user might ask about this email.
            
            Email: "${email.body}"
            
            Output JSON format:
            {
              "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
            }
          `,
        },
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" },
    });

    const content = result.choices[0]?.message?.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      parsed = {
        suggestions: [
          "Summarize this email",
          "What are the action items?",
          "Draft a reply",
          "Who is this from?",
        ],
      };
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
};

export {
  getAllEmails,
  getEmailById,
  getPrompts,
  emailIngestion,
  updatePrompts,
  getResponseDraft,
  regenerateDraft,
  chatWithEmail,
  reanalyzeAllEmails,
  analyzeEmail,
  getChatSuggestions,
};
