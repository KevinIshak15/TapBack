import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

export default function ReviewLanding() {
  const [, params] = useRoute("/r/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: business, isLoading } = useBusinessBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!business) {
    return <div className="p-8 text-center">Business not found.</div>;
  }

  const handleChoice = (experience: 'great' | 'concern') => {
    // Save to session storage or state management context
    sessionStorage.setItem('review_experience', experience);
    
    if (experience === 'concern') {
      setLocation(`/r/${slug}/feedback`);
    } else {
      setLocation(`/r/${slug}/review`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-in">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
          How was your experience at {business.name}?
        </h1>
        <p className="text-gray-500 mb-8">We value your honest feedback.</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleChoice('great')}
            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-green-50 border-2 border-green-100 hover:border-green-300 hover:bg-green-100 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <ThumbsUp className="w-8 h-8 text-green-600 fill-green-100" />
            </div>
            <span className="font-bold text-green-800">It was Great!</span>
          </button>

          <button
            onClick={() => handleChoice('concern')}
            className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-orange-50 border-2 border-orange-100 hover:border-orange-300 hover:bg-orange-100 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <ThumbsDown className="w-8 h-8 text-orange-600 fill-orange-100" />
            </div>
            <span className="font-bold text-orange-800">I have concerns</span>
          </button>
        </div>
      </div>
    </div>
  );
}
