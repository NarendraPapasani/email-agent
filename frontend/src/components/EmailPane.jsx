import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Sparkles,
  ChevronDown,
  Reply,
  ListTodo,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategoryColor, formatRelativeTime } from "@/lib/helpers";
import { emailAPI } from "@/lib/api";
import AIChat from "./AIChat";

export default function EmailPane({ email, onAnalyze, onBack, error }) {
  const [summary, setSummary] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [actionItems, setActionItems] = useState([]);
  const analyzingRef = useRef(null);

  useEffect(() => {
    if (email) {
      setSummary(email.analysis?.summary || "");
      setDraft(email.analysis?.responseDraft || "");
      setActionItems(
        email.analysis?.actionItems
          ? JSON.parse(email.analysis.actionItems)
          : []
      );

      if (!email.analysis && analyzingRef.current !== email.id) {
        analyzingRef.current = email.id;
        onAnalyze();
      }
    }
  }, [email]);

  const handleGenerateDraft = async () => {
    setLoadingDraft(true);
    try {
      const response = await emailAPI.generateDraft(email.id);
      setDraft(response.data.draft || response.data.responseDraft);
    } catch (error) {
      console.error("Failed to generate draft:", error);
    } finally {
      setLoadingDraft(false);
    }
  };

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Email Selected
          </h3>
          <p className="text-sm text-slate-500">
            Select an email from the list to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full">
      {/* Main Email Content (75% of the remaining space) */}
      <div className="flex-[3] flex flex-col bg-white">
        {/* Email Header - Outlook Style */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {email.subject}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {email.from.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{email.from}</p>
              <p className="text-sm text-slate-500">
                {formatRelativeTime(email.recived_at)}
              </p>
            </div>
            {email.analysis && (
              <Badge
                variant="outline"
                className={`${getCategoryColor(
                  email.analysis.category
                )} ring-1`}
              >
                {email.analysis.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Email Body */}
        <ScrollArea className="flex-1 p-3">
          {/* Error Display */}
          {error ? (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </div>
          ) : summary ? (
            <div className="mb-6 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-700 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-indigo-900">AI Summary</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {summary}
              </p>
            </div>
          ) : (
            <div className="mb-6 p-2 bg-slate-50 border border-slate-100 rounded-lg animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-700 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Generating AI Summary...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                <div className="h-3 bg-slate-200 rounded w-4/6"></div>
              </div>
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {email.body}
            </p>
          </div>

          {/* Reply Button */}
          <div className="mt-8 flex gap-3">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateDraft}
              disabled={loadingDraft}
              className="cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-700 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              {loadingDraft
                ? "Generating..."
                : draft
                ? "Regenerate"
                : "Auto Draft"}
            </Button>
          </div>

          {/* Draft Display */}
          {draft && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-700 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">
                  AI Generated Draft
                </h3>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {draft}
              </p>
            </div>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  Action Items
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {actionItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox id={`action-${index}`} />
                      <div className="flex-1">
                        <label
                          htmlFor={`action-${index}`}
                          className="text-sm font-medium text-slate-900 cursor-pointer"
                        >
                          {item.task}
                        </label>
                        {item.deadline && (
                          <p className="text-xs text-slate-500 mt-1">
                            Due: {item.deadline}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* AI Chat Sidebar (desktop) and Modal (mobile) */}
      <div className="hidden md:block">
        <AIChat email={email} />
      </div>

      {/* Mobile Chat Modal Trigger */}
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="fixed bottom-4 right-4 z-50 bg-indigo-600 text-white rounded-full p-3 shadow-lg">
              Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full h-full max-w-none p-0">
            <AIChat email={email} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
