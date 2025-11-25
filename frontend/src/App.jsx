import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EmailList from "@/components/EmailList";
import EmailPane from "@/components/EmailPane";
import { emailAPI } from "@/lib/api";

export default function App() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await emailAPI.getAll();
      setEmails(response.data || []);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = async (email) => {
    try {
      const response = await emailAPI.getById(email.id);
      setSelectedEmail(response.data);
    } catch (error) {
      console.error("Failed to fetch email details:", error);
      setSelectedEmail(email);
    }
  };

  const handleAnalyzeEmail = async () => {
    if (!selectedEmail || selectedEmail.analysis) return;

    try {
      // Trigger analysis by fetching email again after a short delay
      // This assumes the backend automatically analyzes emails on first fetch
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await emailAPI.getById(selectedEmail.id);
      setSelectedEmail(response.data);

      // Update email in the list
      setEmails((prev) =>
        prev.map((e) => (e.id === response.data.id ? response.data : e))
      );
    } catch (error) {
      console.error("Failed to analyze email:", error);
    }
  };

  const handleRefresh = () => {
    fetchEmails();
    if (selectedEmail) {
      handleSelectEmail(selectedEmail);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header onRefresh={handleRefresh} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List - 25% width */}
        <EmailList
          emails={emails}
          selectedEmail={selectedEmail}
          onSelectEmail={handleSelectEmail}
          loading={loading}
        />

        {/* Email Pane with AI Chat - 75% width */}
        <EmailPane email={selectedEmail} onAnalyze={handleAnalyzeEmail} />
      </div>
    </div>
  );
}
