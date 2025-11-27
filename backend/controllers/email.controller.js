import prisma from "../utils/prisma.js";
import connectAI from "../utils/genAI.js";
import dotenv from "dotenv";

dotenv.config();

const model = connectAI();

const getAllEmails = async (req, res) => {
  try {
    console.log("📧 Fetching all emails...");
    const emails = await prisma.email.findMany({
      orderBy: { recived_at: "desc" },
      include: { analysis: true },
    });

    console.log(`✅ Found ${emails.length} emails`);
    res.status(200).json(emails);
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
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
    const catPrompt = prompts.find((p) => p.type === "categorization")?.content;
    const actionPrompt = prompts.find((p) => p.type === "action_item")?.content;

    let processedCount = 0;
    let failedCount = 0;
    const DELAY_BETWEEN_REQUESTS = 5000; // 5 seconds delay
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

          const result = await model.generateContent(aiPrompt);
          const response = await result.response;

          console.log("AI Response:", response);

          const text = response
            .text()
            .replace(/```json|```/g, "")
            .trim();

          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            // Fallback if JSON fails
            data = {
              category: "General",
              summary: "Parse error",
              action_items: [],
            };
          }

          // Save results to DB
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
            `✅ Analyzed email ${processedCount}/${unreadEmails.length}`
          );

          // Add delay between requests
          if (processedCount < unreadEmails.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
            );
          }
        } catch (error) {
          retries++;

          // Check if it's a rate limit error
          if (error.status === 429) {
            const retryDelay = error.errorDetails?.find(
              (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
            )?.retryDelay;

            const delaySeconds = retryDelay
              ? parseInt(retryDelay.replace("s", ""))
              : 30;

            console.log(
              `⏳ Rate limit hit. Waiting ${delaySeconds}s before retry ${retries}/${MAX_RETRIES}...`
            );

            await new Promise((resolve) =>
              setTimeout(resolve, (delaySeconds + 2) * 1000)
            );
          } else if (retries >= MAX_RETRIES) {
            console.error(
              `❌ Failed to analyze email ${email.id} after ${MAX_RETRIES} retries`
            );
            failedCount++;
            break;
          } else {
            console.log(
              `⚠️  Retry ${retries}/${MAX_RETRIES} for email ${email.id}...`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
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
    console.log(error);
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

    // Clear all existing analysis
    await prisma.emailAnalysis.deleteMany({});
    console.log("🗑️ Cleared all email analysis due to prompt update");

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

    if (!email) return res.status(404).json({ error: "Email not found" });

    const result = await model.generateContent(`
      Context: You are an email assistant.
      Incoming Email: "${email.body}"
      
      YOUR TASK: ${promptData.content}
      
      Output: Just the body of the email reply. No pleasantries like "Here is the draft".
    `);

    const draftText = result.response.text();

    // If creating new analysis, try to generate a basic summary too
    const summaryResult = await model.generateContent(`
      Summarize this email in 2-3 sentences covering key points and action items.
      Email: "${email.body}"
    `);
    const summaryText = summaryResult.response.text();

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

    if (!email) return res.status(404).json({ error: "Email not found" });

    const result = await model.generateContent(`
      Context: You are an email assistant.
      Incoming Email: "${email.body}"
      
      YOUR TASK: ${promptData.content}
      
      Output: Just the body of the email reply. No pleasantries like "Here is the draft". Make it different from previous attempts.
    `);

    const draftText = result.response.text();

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

    console.log(`💬 Chat request for email ${id}:`, message);

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    if (!email) {
      console.log(`❌ Email ${id} not found`);
      return res.status(404).json({ error: "Email not found" });
    }

    // Build comprehensive context
    const emailContext = `
EMAIL DETAILS:
==============
From: ${email.from}
Subject: ${email.subject}
Received: ${new Date(email.recived_at).toLocaleString()}
${
  email.analysis
    ? `
Category: ${email.analysis.category}
Summary: ${email.analysis.summary}
Action Items: ${
        email.analysis.actionItems !== "[]"
          ? email.analysis.actionItems
          : "None"
      }
${
  email.analysis.responseDraft
    ? `Draft Reply: ${email.analysis.responseDraft}`
    : ""
}
`
    : ""
}

EMAIL BODY:
===========
${email.body}
    `.trim();

    console.log("📧 Sending context to AI...");

    const result = await model.generateContent(`
You are an intelligent email assistant helping the user understand and manage their emails.

The user is currently viewing this email:
${emailContext}

User Question: "${message}"

Answer the user's question based on all the email information provided above. Be concise, helpful, and reference specific details from the email when relevant. If the user asks about action items, deadlines, or next steps, refer to the actual content and any extracted action items.
    `);

    const response = result.response.text();
    console.log("✅ AI response generated successfully");

    res.status(200).json({ response });
  } catch (error) {
    console.error("❌ Error in chat:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      details: error.message,
    });
  }
};

const reanalyzeAllEmails = async (req, res) => {
  try {
    console.log("🔄 Starting re-analysis of all emails...");

    const emails = await prisma.email.findMany({
      include: { analysis: true },
    });

    if (!emails || emails.length === 0) {
      return res.status(200).json({ message: "No emails to re-analyze" });
    }

    const prompts = await prisma.prompt.findMany();
    const catPrompt = prompts.find((p) => p.type === "categorization")?.content;
    const actionPrompt = prompts.find((p) => p.type === "action_item")?.content;

    let processedCount = 0;
    let failedCount = 0;
    const DELAY_BETWEEN_REQUESTS = 5000; // 5 seconds delay between each request
    const MAX_RETRIES = 3;

    for (const email of emails) {
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

          const result = await model.generateContent(aiPrompt);
          const response = await result.response;

          const text = response
            .text()
            .replace(/```json|```/g, "")
            .trim();

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

          if (email.analysis) {
            // Update existing analysis
            await prisma.emailAnalysis.update({
              where: { emailId: email.id },
              data: {
                category: data.category,
                summary: data.summary,
                actionItems: JSON.stringify(data.action_items),
              },
            });
          } else {
            // Create new analysis
            await prisma.emailAnalysis.create({
              data: {
                emailId: email.id,
                category: data.category,
                summary: data.summary,
                actionItems: JSON.stringify(data.action_items),
                responseDraft: null,
              },
            });
          }

          processedCount++;
          success = true;
          console.log(
            `✅ Re-analyzed email ${processedCount}/${emails.length}`
          );

          // Add delay between requests to avoid rate limiting
          if (processedCount < emails.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
            );
          }
        } catch (error) {
          retries++;

          // Check if it's a rate limit error
          if (error.status === 429) {
            const retryDelay = error.errorDetails?.find(
              (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
            )?.retryDelay;

            const delaySeconds = retryDelay
              ? parseInt(retryDelay.replace("s", ""))
              : 30;

            console.log(
              `⏳ Rate limit hit. Waiting ${delaySeconds}s before retry ${retries}/${MAX_RETRIES}...`
            );

            await new Promise((resolve) =>
              setTimeout(resolve, (delaySeconds + 2) * 1000)
            );
          } else if (retries >= MAX_RETRIES) {
            console.error(
              `❌ Failed to re-analyze email ${email.id} after ${MAX_RETRIES} retries`
            );
            failedCount++;
            break;
          } else {
            console.log(
              `⚠️  Retry ${retries}/${MAX_RETRIES} for email ${email.id}...`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      }
    }

    console.log(
      `🎉 Re-analysis complete! Processed ${processedCount}/${emails.length} emails`
    );
    if (failedCount > 0) {
      console.log(`⚠️  ${failedCount} emails failed to process`);
    }

    res.status(200).json({
      message: "Re-analysis complete",
      processed: processedCount,
      failed: failedCount,
      total: emails.length,
    });
  } catch (error) {
    console.error("❌ Error re-analyzing emails:", error);
    res.status(500).json({ error: "Failed to re-analyze emails" });
  }
};

const analyzeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (email.analysis) {
      return res.status(200).json(email);
    }

    const prompts = await prisma.prompt.findMany();
    const catPrompt = prompts.find((p) => p.type === "categorization")?.content;
    const actionPrompt = prompts.find((p) => p.type === "action_item")?.content;

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

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```json|```/g, "")
      .trim();

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

    try {
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
    } catch (error) {
      if (error.code === "P2002") {
        // Race condition: record created between check and write
        // Just update it now
        await prisma.emailAnalysis.update({
          where: { emailId: email.id },
          data: {
            category: data.category,
            summary: data.summary,
            actionItems: JSON.stringify(data.action_items),
          },
        });
      } else {
        throw error;
      }
    }

    const updatedEmail = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error("Error analyzing email:", error);
    if (error.status === 429) {
      return res
        .status(429)
        .json({ error: "Daily AI limit reached. Please try again tomorrow." });
    }
    res.status(500).json({ error: "Failed to analyze email" });
  }
};

const getChatSuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await prisma.email.findUnique({
      where: { id: parseInt(id) },
      include: { analysis: true },
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Check if suggestions already exist in the database
    if (
      email.analysis &&
      email.analysis.suggestions &&
      Array.isArray(email.analysis.suggestions) &&
      email.analysis.suggestions.length > 0
    ) {
      console.log("✅ Returning cached suggestions from DB");
      return res.status(200).json({ suggestions: email.analysis.suggestions });
    }

    console.log("🤖 Generating new suggestions...");
    const result = await model.generateContent(`
      Context: You are an email assistant.
      Email Content:
      Subject: ${email.subject}
      Body: ${email.body}
      Category: ${email.analysis?.category || "General"}

      Task: Generate 4 short, relevant questions that the user might want to ask about this email.
      Examples: "What is the deadline?", "Summarize the key points", "Draft a reply", "Who is this from?"

      STRICT OUTPUT FORMAT (JSON ARRAY OF STRINGS ONLY):
      ["Question 1", "Question 2", "Question 3", "Question 4"]
    `);

    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    let suggestions = [];
    try {
      suggestions = JSON.parse(text);
    } catch (e) {
      suggestions = [
        "Summarize this email",
        "What are the action items?",
        "How urgent is this?",
        "Draft a polite reply",
      ];
    }

    // Always use upsert to handle race conditions
    try {
      await prisma.emailAnalysis.upsert({
        where: { emailId: parseInt(id) },
        update: {
          suggestions: suggestions,
        },
        create: {
          emailId: parseInt(id),
          category: "General",
          summary: "Pending analysis...",
          actionItems: "[]",
          suggestions: suggestions,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        await prisma.emailAnalysis.update({
          where: { emailId: parseInt(id) },
          data: {
            suggestions: suggestions,
          },
        });
      } else {
        throw error;
      }
    }
    console.log("💾 Saved suggestions to DB");

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    if (error.status === 429) {
      return res
        .status(429)
        .json({ error: "Daily AI limit reached. Please try again tomorrow." });
    }
    res.status(500).json({ error: "Failed to generate suggestions" });
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
