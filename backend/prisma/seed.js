import mockEmails from "../utils/mockEmails.js";
import prisma from "../utils/prisma.js";

async function main() {
  console.log("Seeding database...");

  await prisma.emailAnalysis.deleteMany();
  await prisma.email.deleteMany();
  await prisma.prompt.deleteMany();

  console.log("Deleted existing data.");

  await prisma.prompt.createMany({
    data: [
      {
        type: "categorization",
        content:
          "Analyze the email content and categorize it into one of the following: 'Important', 'Promotional', 'Spam', 'General', 'Meeting', 'Urgent'. Return only the category name.",
      },
      {
        type: "action_item",
        content:
          "Extract any action items, tasks, or requests from the email. Return them as a JSON array of strings. If there are no action items, return an empty array.",
      },
      {
        type: "auto_reply",
        content:
          "Draft a professional and concise reply to this email based on its context. If it's a meeting request, suggest checking the calendar. If it's spam, ignore it.",
      },
    ],
  });
  console.log("Seeded Prompts.");

  await prisma.email.createMany({
    data: mockEmails,
  });
  console.log(`Seeded ${mockEmails.length} Emails.`);

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
