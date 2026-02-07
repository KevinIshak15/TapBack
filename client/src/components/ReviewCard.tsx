import { Star, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  content: string;
  tags?: string[];
  isGenerated?: boolean;
  className?: string;
}

export function ReviewCard({ content, tags, isGenerated, className }: ReviewCardProps) {
  return (
    <div className={cn("p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all", className)}>
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
        {isGenerated && (
          <span className="ml-auto text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            AI Generated
          </span>
        )}
      </div>
      
      <div className="relative pl-6">
        <MessageSquareQuote className="absolute left-0 top-0 w-4 h-4 text-gray-400" />
        <p className="text-gray-700 leading-relaxed font-medium">"{content}"</p>
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
