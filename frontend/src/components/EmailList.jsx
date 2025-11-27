import { useState } from "react";
import { Search, Mail, Clock, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getCategoryColor } from "@/lib/helpers";

export default function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  loading,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="md:w-1/4 w-full bg-white border-r md:border-r border-slate-200 flex flex-col h-full">
      {/* Search Header */}
      <div className="p-2 border-b border-slate-200">
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
          {loading ? (
            <div className="p-4 space-y-6">
              <div className="text-center p-4 bg-blue-50 text-blue-700 rounded-lg text-sm mb-2">
                <div className="flex justify-center mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                </div>
                <p className="font-medium">Loading your inbox...</p>
                <p className="text-xs mt-1 opacity-80">
                  Please wait, it will take about 30 seconds to load.
                </p>
              </div>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3 animate-pulse px-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/5"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-1/4 mt-2"></div>
                </div>
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
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
