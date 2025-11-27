import { useState, useEffect, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { emailAPI } from "@/lib/api";

export default function AIChat({ email }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    // Reset chat when email changes
    if (email) {
      setMessages([]);
      setInput("");
      fetchSuggestions(email.id);
    }
  }, [email?.id]);

  const fetchSuggestions = async (emailId) => {
    setLoadingSuggestions(true);
    try {
      const response = await emailAPI.getSuggestions(emailId);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([
        "Summarize this email",
        "What are the action items?",
        "How urgent is this?",
        "Draft a polite reply",
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim() || !email) return;

    const userMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log("Sending chat message:", text.trim());
      const response = await emailAPI.chat(email.id, {
        message: text.trim(),
      });

      console.log("Chat response:", response.data);

      const aiMessage = {
        role: "assistant",
        content:
          response.data.response ||
          response.data.message ||
          "I'm here to help!",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage = {
        role: "assistant",
        content:
          error.response?.data?.error ||
          "Sorry, I couldn't process that request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="w-full md:w-[370px] md:border-l border-slate-200 bg-gradient-to-b from-slate-50 to-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-700 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              AI Assistant
            </h3>
            <p className="text-xs text-slate-500">Ask me anything</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-slate-700 mb-3">
            Quick questions:
          </p>
          {loadingSuggestions ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 bg-slate-100 rounded w-full"></div>
              <div className="h-8 bg-slate-100 rounded w-3/4"></div>
              <div className="h-8 bg-slate-100 rounded w-5/6"></div>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-auto py-2 px-3 text-left whitespace-normal break-words"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </Button>
            ))
          )}
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg px-3 py-2 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="resize-none text-sm min-h-[60px]"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
