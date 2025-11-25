import { useState, useEffect } from "react";
import { Settings, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { promptAPI, emailAPI } from "@/lib/api";

export default function Header({ onRefresh, isRefreshing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompts, setPrompts] = useState({
    categorization: "",
    action_item: "",
    auto_reply: "",
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await promptAPI.getAll();
      const promptsData = response.data.reduce((acc, prompt) => {
        acc[prompt.type] = prompt.content;
        return acc;
      }, {});
      setPrompts(promptsData);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save prompts
      await promptAPI.update(prompts);

      // Re-analyze all emails with new prompts (with rate limiting)
      const result = await emailAPI.reanalyze();

      console.log("Re-analysis result:", result.data);

      // Refresh email list
      if (onRefresh) {
        await onRefresh();
      }

      setIsOpen(false);

      // Show success message if available
      if (result.data.failed > 0) {
        alert(
          `Re-analysis complete!\nProcessed: ${result.data.processed}/${result.data.total}\nFailed: ${result.data.failed}\n\nNote: This may take a while due to API rate limits (5s delay between emails).`
        );
      }
    } catch (error) {
      console.error("Failed to save prompts and re-analyze:", error);
      alert(
        "Re-analysis may be in progress. This takes time due to rate limits.\n\nPlease wait and refresh the page in a few minutes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="bg-blue-500 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AgentInbox
            </h1>
            {/* <p className="text-xs text-blue-100">AI-Powered Email Assistant</p> */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-white cursor-pointer bg-white/20 bg:hover:bg-white/30"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Analyzing..." : "Analyze Emails"}
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 cursor-pointer bg:white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Prompt Configuration
                </DialogTitle>
                <DialogDescription>
                  Configure AI prompts to customize email analysis and responses
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Categorization Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Categorization Prompt
                  </label>
                  <Textarea
                    value={prompts.categorization}
                    onChange={(e) =>
                      setPrompts({ ...prompts, categorization: e.target.value })
                    }
                    placeholder="Define how emails should be categorized..."
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {/* Action Item Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Action Item Extraction Prompt
                  </label>
                  <Textarea
                    value={prompts.action_item}
                    onChange={(e) =>
                      setPrompts({ ...prompts, action_item: e.target.value })
                    }
                    placeholder="Define how to extract action items..."
                    className="min-h-[100px] resize-y"
                  />
                </div>

                {/* Auto Reply Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Auto-Reply Draft Prompt
                  </label>
                  <Textarea
                    value={prompts.auto_reply}
                    onChange={(e) =>
                      setPrompts({ ...prompts, auto_reply: e.target.value })
                    }
                    placeholder="Define how to draft replies..."
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Re-analyzing All Emails...
                      </>
                    ) : (
                      "Save & Re-analyze"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
