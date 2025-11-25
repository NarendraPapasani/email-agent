const mockEmails = [
  {
    from: "alice.manager@company.com",
    subject: "Project Kickoff Meeting - Q4 Roadmap",
    body: "Hi Team,\n\nI hope this message finds you well. We need to gather tomorrow at 10 AM in Room 302 to discuss our ambitious Q4 roadmap planning session. Please make sure to thoroughly review the attached pre-read document containing our strategic objectives, key performance indicators, budget allocations, resource requirements, and timeline projections. This meeting is critical for aligning our departmental goals with company-wide initiatives. Your input and feedback are essential for successful execution. Looking forward to a productive discussion.\n\nBest regards,\nAlice",
    recived_at: new Date("2025-11-20T09:00:00Z"),
  },
  {
    from: "alert@monitoring.system",
    subject: "WARNING: High CPU Usage on Production Server",
    body: "URGENT ALERT: Production database server 'prod-db-01' has exceeded critical CPU usage threshold of 90% for the past 5 consecutive minutes. Current usage at 94.7%. This sustained high utilization is affecting query response times and may lead to service degradation. Immediate investigation required to identify resource-intensive processes, check for runaway queries, review connection pools, and assess if scaling is necessary. Automated failover procedures are on standby. Please acknowledge receipt and provide estimated time to resolution.\n\n- SysAdmin Monitoring Bot",
    recived_at: new Date("2025-11-20T10:15:00Z"),
  },
  {
    from: "bob.developer@company.com",
    subject: "Question about the new API endpoint",
    body: "Hey there,\n\nI've been reviewing the updated API documentation for our v2 release and I'm encountering some issues with the /api/v2/users endpoint. When I send GET requests to this endpoint, I'm consistently receiving 404 Not Found errors. I've double-checked the URL structure, verified my authentication tokens, and confirmed the request headers match the specification. Could you please clarify if this endpoint has been deployed to our staging environment yet? Also, are there any known issues or dependencies I should be aware of? I need to complete integration testing by end of week.\n\nThanks for your help,\nBob",
    recived_at: new Date("2025-11-20T11:30:00Z"),
  },
  {
    from: "spam.king@lottery-winner.net",
    subject: "CONGRATULATIONS! You've won $1,000,000!!!",
    body: "Dear Lucky Winner,\n\nYou have been randomly selected as the grand prize winner of our international lottery promotion! Your email address won an incredible ONE MILLION DOLLARS in our automated drawing system. To claim your winnings immediately, simply click the verification link below and provide your banking details for direct deposit transfer. This is a limited time offer that expires in 24 hours. Don't miss this once-in-a-lifetime opportunity! Act now before your prize is forfeited to an alternate winner. Congratulations again on your amazing fortune!\n\n[CLAIM YOUR PRIZE NOW - Suspicious Link]",
    recived_at: new Date("2025-11-20T12:00:00Z"),
  },
  {
    from: "hr@company.com",
    subject: "Policy Update: Remote Work Guidelines",
    body: "Dear All Employees,\n\nEffective immediately, we are implementing updated remote work policies to enhance productivity and maintain work-life balance. The new guidelines include mandatory core collaboration hours from 10 AM to 3 PM in your local timezone, bi-weekly office attendance requirements, enhanced security protocols for remote connections, and updated equipment reimbursement procedures. Please carefully review the attached comprehensive policy document which outlines eligibility criteria, approval workflows, performance expectations, communication standards, and compliance requirements. All managers must discuss these changes with their teams within the next week.\n\nHuman Resources Team",
    recived_at: new Date("2025-11-19T14:00:00Z"),
  },
  {
    from: "charlie.client@external.org",
    subject: "Re: Proposal for upcoming project",
    body: "Hi Team,\n\nThank you for submitting such a detailed and comprehensive proposal for our upcoming digital transformation project. Our executive committee has reviewed the document and we're genuinely impressed with the technical approach, resource allocation, and innovative solutions you've presented. However, we do have several important questions regarding the proposed timeline, particularly around phases two and three. The budget breakdown looks reasonable, but we'd like to discuss potential cost optimization opportunities and payment milestone structures. Could we schedule a video conference call early next week to address these concerns and finalize the agreement?\n\nBest regards,\nCharlie",
    recived_at: new Date("2025-11-19T15:45:00Z"),
  },
  {
    from: "newsletter@technews.io",
    subject: "Weekly Tech Digest: AI takes over?",
    body: "Welcome to this week's Technology Digest!\n\nThis week brought groundbreaking developments in artificial intelligence with multiple companies releasing advanced language models featuring unprecedented capabilities. Major tech stock markets experienced significant volatility responding to regulatory announcements and earnings reports. Cybersecurity experts warn about emerging threats targeting cloud infrastructure. Electric vehicle manufacturers unveiled next-generation battery technologies promising extended range and faster charging. Quantum computing research achieved new milestones in error correction. Social media platforms face increased scrutiny over content moderation policies. Read our in-depth analysis and expert commentary on these stories and more inside this edition.\n\nStay informed with TechNews!",
    recived_at: new Date("2025-11-19T08:00:00Z"),
  },
  {
    from: "billing@saas-service.com",
    subject: "Invoice #99283 - Payment Successful",
    body: "Dear Valued Customer,\n\nWe are writing to confirm that your recent payment of $49.99 has been successfully processed and applied to your account. Your premium subscription plan has been automatically renewed for another monthly billing cycle, ensuring uninterrupted access to all features including advanced analytics, priority customer support, increased storage capacity, API access, and collaborative workspace tools. Your next billing date is scheduled for December 26, 2025. You can review your complete billing history, update payment methods, or modify your subscription tier anytime through your account dashboard. Thank you for continuing to trust our service.\n\nBilling Department",
    recived_at: new Date("2025-11-18T09:20:00Z"),
  },
  {
    from: "security@company.com",
    subject: "Security Alert: New login from unknown device",
    body: "SECURITY NOTIFICATION:\n\nWe have detected a new login attempt to your company account from an unrecognized device and location. Login details: iPhone 15 Pro, iOS 17.2, IP address registered in London, United Kingdom at November 18, 2025 6:30 PM GMT. If you initiated this login, no action is required and you can safely disregard this message. However, if you did not authorize this access, your account security may be compromised. We strongly recommend immediately resetting your password, reviewing recent account activity, enabling two-factor authentication, and checking connected devices. Our security team is monitoring your account for suspicious activity.\n\nSecurity Operations Center",
    recived_at: new Date("2025-11-18T18:30:00Z"),
  },
  {
    from: "dave.friend@gmail.com",
    subject: "Lunch today?",
    body: "Hey buddy!\n\nHope your morning is going well and you're not too swamped with meetings. I was thinking about grabbing some lunch around 12:30 today and wondered if you'd like to join me. There's this new taco place that just opened up downtown near the office that I've been wanting to try - they supposedly have amazing carnitas and their homemade salsas are getting rave reviews. Weather looks nice too, so we could walk over together. Let me know if you're free and interested. If today doesn't work, we could always shoot for later this week instead.\n\nCheers,\nDave",
    recived_at: new Date("2025-11-18T11:00:00Z"),
  },
  {
    from: "recruiter@hiring.com",
    subject: "Interview Invitation - Software Engineer Role",
    body: "Dear Candidate,\n\nCongratulations! We were very impressed with your application and background for our Senior Software Engineer position. We would like to formally invite you to participate in our comprehensive interview process. The interview will consist of technical coding assessments, system design discussions, behavioral questions, and team culture fit evaluation. We're looking for candidates with strong problem-solving abilities, excellent communication skills, and passion for building scalable solutions. Please share your availability for next week, preferably Tuesday through Thursday between 9 AM and 4 PM. We're excited about the possibility of you joining our innovative engineering team.\n\nBest regards,\nTalent Acquisition Team",
    recived_at: new Date("2025-11-17T10:00:00Z"),
  },
  {
    from: "support@vendor.com",
    subject: "Ticket #5521: Resolved",
    body: "Hello,\n\nWe are pleased to inform you that support ticket #5521 regarding login authentication issues has been successfully resolved. Our engineering team identified the root cause as a session management configuration error affecting a small subset of users. We've deployed a fix to production that addresses the cookie persistence problem and updated our authentication middleware. The solution has been tested across multiple browsers and devices to ensure consistent functionality. Please attempt to log in again and verify that you can now access your account without issues. If you experience any further problems or have additional questions, don't hesitate to reopen this ticket.\n\nCustomer Support Team",
    recived_at: new Date("2025-11-17T13:15:00Z"),
  },
  {
    from: "eve.designer@company.com",
    subject: "Design Assets for Landing Page",
    body: "Hi Development Team,\n\nI'm excited to share that the final design assets for our new marketing landing page are now complete and ready for implementation. The package includes high-resolution hero images optimized for retina displays, SVG vector graphics for logos and icons, responsive layout specifications for mobile and desktop viewports, color palette with hex codes and accessibility contrast ratios, typography guidelines with font weights and line heights, and interactive prototype demonstrating animations and transitions. All files are organized in the shared drive with clear naming conventions. If you need alternative file formats, different export sizes, or have any questions about design specifications, please let me know immediately.\n\nCreative regards,\nEve",
    recived_at: new Date("2025-11-16T16:40:00Z"),
  },
  {
    from: "frank.ops@company.com",
    subject: "Scheduled Maintenance: Saturday 2 AM",
    body: "Dear Team Members,\n\nThis is an official notification regarding scheduled infrastructure maintenance that will impact our production database systems. The maintenance window is scheduled for this Saturday, November 16th at 2:00 AM UTC and is expected to last approximately 30 minutes. During this period, we will be performing critical database schema migrations, applying security patches, optimizing indexes for improved query performance, and upgrading backup systems. All customer-facing applications will experience temporary downtime. We will be monitoring systems closely throughout the maintenance window and have rollback procedures prepared if any issues arise. Emergency contact information has been distributed to the on-call team.\n\nOperations Department",
    recived_at: new Date("2025-11-16T09:00:00Z"),
  },
  {
    from: "marketing@promo-offers.com",
    subject: "Last Chance! 50% OFF everything!",
    body: "FINAL HOURS - DON'T MISS OUT!\n\nThis is your last opportunity to take advantage of our biggest promotional sale event of the entire year with massive fifty percent discounts on absolutely everything in our catalog! We're offering unprecedented savings on electronics, fashion, home goods, sporting equipment, beauty products, and much more. Free shipping on all orders over $50. No exclusions, no tricks, no hidden fees. But hurry - this incredible offer expires tonight at midnight sharp! Stock is limited and popular items are selling out fast. Shop now before it's too late and save big on all your favorite brands and products. Your wallet will thank you!\n\nShop immediately at PromoOffers.com",
    recived_at: new Date("2025-11-15T12:00:00Z"),
  },
  {
    from: "grace.intern@company.com",
    subject: "Question regarding setup",
    body: "Hi Everyone,\n\nI hope I'm not bothering anyone, but I'm running into some technical difficulties setting up my local development environment and could really use some assistance. I've followed the setup instructions in the README documentation step by step, but when I run 'npm install' command, I'm encountering multiple dependency resolution errors and version conflict warnings. I've already tried clearing my npm cache, deleting node_modules folder, and ensuring I'm using the correct Node.js version specified in the project requirements. The error messages mention something about peer dependencies and incompatible package versions. Has anyone else experienced similar issues recently? Any guidance would be greatly appreciated.\n\nThank you,\nGrace",
    recived_at: new Date("2025-11-15T14:20:00Z"),
  },
  {
    from: "notifications@socialmedia.com",
    subject: "You have 3 new notifications",
    body: "Recent Activity Update:\n\nYour social network has been busy while you were away! Alice Thompson commented on your recent post about weekend hiking adventures, sharing her own experiences and recommendations for nearby trails. Bob Martinez liked and shared your stunning sunset photography from your beach vacation last month. Charlie Rodriguez sent you a friend connection request - you have 12 mutual friends in common including several colleagues from your previous workplace. Additionally, you were tagged in 2 new photos from the company team building event, and your professional profile has been viewed 47 times this week. Check out all your notifications and stay connected with your growing network.\n\nSocial Media Platform",
    recived_at: new Date("2025-11-14T20:00:00Z"),
  },
  {
    from: "heidi.finance@company.com",
    subject: "Expense Report Approval Needed",
    body: "Dear Manager,\n\nI am submitting the comprehensive expense report for our recent team offsite and strategic planning retreat that requires your review and approval. The report includes detailed itemized receipts for hotel accommodations, conference room rentals, catering services, team dinner expenses, transportation costs, and miscellaneous supplies. Total expenditure amounts to $3,847.62, which is within our allocated quarterly budget for team development activities. All expenses comply with company reimbursement policies and have been properly categorized according to accounting department guidelines. Please review the attached documentation at your earliest convenience and provide approval so we can process reimbursements for team members promptly.\n\nBest regards,\nHeidi - Finance Department",
    recived_at: new Date("2025-11-14T11:10:00Z"),
  },
  {
    from: "ivan.vendor@supply.com",
    subject: "Delay in shipment #4421",
    body: "Dear Valued Customer,\n\nWe sincerely regret to inform you that shipment order #4421 containing your equipment supplies will unfortunately be delayed by approximately 2 business days beyond the originally scheduled delivery date. This unexpected delay is due to severe weather conditions and transportation disruptions affecting our primary shipping routes and distribution centers across the region. Our logistics team is actively working with alternate carriers to minimize the impact and ensure your order arrives as quickly as possible. The revised estimated delivery date is now November 15th. We understand this may cause inconvenience to your operations and deeply apologize for any complications. Please contact our customer service department if you have urgent concerns.\n\nSincerely,\nIvan - Supply Chain Management",
    recived_at: new Date("2025-11-13T08:45:00Z"),
  },
  {
    from: "judy.ceo@company.com",
    subject: "Q3 All-Hands Meeting Recording",
    body: "Dear Team,\n\nThank you to everyone who attended yesterday's Q3 All-Hands meeting where we discussed our quarterly performance results, celebrated team achievements, reviewed strategic initiatives, and outlined our priorities for the upcoming quarter. For those who were unable to attend due to scheduling conflicts, client meetings, or being in different time zones, the complete meeting recording is now available on our internal company intranet portal. The recording includes the full presentation slides, executive updates, department highlights, Q&A session, and announcement of new organizational changes. Please take time to watch and familiarize yourself with our direction. Your engagement and contributions are vital to our continued success.\n\nWith appreciation,\nJudy - CEO",
    recived_at: new Date("2025-11-13T17:00:00Z"),
  },
];

export default mockEmails;
