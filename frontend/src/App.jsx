import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import EmailList from "@/components/EmailList";
import EmailPane from "@/components/EmailPane";
import { emailAPI } from "@/lib/api";

export default function App() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const abortControllerRef = useRef(null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    fetchEmails();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    // Abort any pending analysis when switching emails
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setAnalysisError(null);

    // Set selected email immediately to show it in the UI
    setSelectedEmail(email);

    try {
      const response = await emailAPI.getById(email.id);
      // Update with full details (including analysis)
      setSelectedEmail(response.data);
    } catch (error) {
      console.error("Failed to fetch email details:", error);
      // Keep the basic email if fetch fails
    }
  };

  const handleAnalyzeEmail = async (emailId) => {
    // If no ID passed, use selectedEmail.id
    const idToAnalyze = emailId || selectedEmail?.id;
    if (!idToAnalyze) return;

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setAnalysisError(null);

    try {
      // Trigger analysis for specific email
      const response = await emailAPI.analyze(idToAnalyze, controller.signal);

      // Only update if the user hasn't switched emails (or if they switched back to the same one)
      // Actually, we should check if the response ID matches the current selectedEmail ID
      // But since we are updating the list too, we can do that safely.
      // The critical part is updating selectedEmail ONLY if it matches.

      setSelectedEmail((current) => {
        if (current && current.id === response.data.id) {
          return response.data;
        }
        return current;
      });

      // Update email in the list
      setEmails((prev) =>
        prev.map((e) => (e.id === response.data.id ? response.data : e))
      );
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        console.log("Analysis canceled");
      } else {
        console.error("Failed to analyze email:", error);
        if (error.response && error.response.status === 429) {
          setAnalysisError(
            "Daily AI limit reached. Please try again tomorrow."
          );
        } else {
          setAnalysisError("Failed to analyze email. Please try again.");
        }
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
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
        {isMobile ? (
          // On mobile show either list or details full screen
          selectedEmail ? (
            <div className="w-full">
              <EmailPane
                email={selectedEmail}
                onAnalyze={() => handleAnalyzeEmail(selectedEmail.id)}
                onBack={() => setSelectedEmail(null)}
                error={analysisError}
              />
            </div>
          ) : (
            <div className="w-full">
              <EmailList
                emails={emails}
                selectedEmail={selectedEmail}
                onSelectEmail={handleSelectEmail}
                loading={loading}
              />
            </div>
          )
        ) : (
          // Desktop layout
          <>
            <EmailList
              emails={emails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleSelectEmail}
              loading={loading}
            />
            <EmailPane
              email={selectedEmail}
              onAnalyze={() => handleAnalyzeEmail(selectedEmail.id)}
              error={analysisError}
            />
          </>
        )}
      </div>
    </div>
  );
}
