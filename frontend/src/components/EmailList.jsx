import { useState } from "react";
import { Search, Mail, Clock, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getCategoryColor } from "@/lib/helpers";

export default function EmailList({ emails, selectedEmail, onSelectEmail }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-1/4 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-slate-100">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No emails found</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                  selectedEmail?.id === email.id
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "border-l-4 border-transparent"
                }`}
              >
                {/* Sender */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-900 truncate flex-1">
                    {email.from.split("@")[0]}
                  </h3>
                  <span className="text-xs text-slate-500 ml-2">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatRelativeTime(email.recived_at)}
                  </span>
                </div>

                {/* Subject */}
                <p className="text-sm font-medium text-slate-700 mb-2 truncate">
                  {email.subject}
                </p>

                {/* Preview */}
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                  {email.body.substring(0, 80)}...
                </p>

                {/* Category Tag */}
                {email.analysis && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(
                        email.analysis.category
                      )} ring-1`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {email.analysis.category}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
