export const formatRelativeTime = (date) => {
  const now = new Date();
  const emailDate = new Date(date);
  const diffInSeconds = Math.floor((now - emailDate) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return emailDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getCategoryColor = (category) => {
  const colors = {
    Urgent: "bg-red-50 text-red-700 ring-red-600/20",
    Important: "bg-orange-50 text-orange-700 ring-orange-600/20",
    Work: "bg-blue-50 text-blue-700 ring-blue-600/20",
    Meeting: "bg-purple-50 text-purple-700 ring-purple-600/20",
    Newsletter: "bg-green-50 text-green-700 ring-green-600/20",
    Spam: "bg-gray-50 text-gray-700 ring-gray-600/20",
    General: "bg-slate-50 text-slate-700 ring-slate-600/20",
  };
  return colors[category] || colors.General;
};
