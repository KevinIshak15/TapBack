import { Link } from "wouter";
import { ArrowRight, Star, BarChart3, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold font-display">Revues</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="font-semibold shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-in">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Review Generation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 animate-in [animation-delay:100ms]">
              Get more <span className="text-primary">5-star</span> Google reviews.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 animate-in [animation-delay:200ms] leading-relaxed">
              We guide your happy customers to leave authentic, glowing reviews using AI, while intercepting negative feedback privately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in [animation-delay:300ms]">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-2xl">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <QrCode className="w-8 h-8 text-primary" />,
                title: "Scan & Go",
                desc: "Customers simply scan a QR code. No apps to download, no friction."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-accent" />,
                title: "AI Writing Assistant",
                desc: "We help happy customers write detailed, keyword-rich reviews in seconds."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-green-600" />,
                title: "Feedback Filtering",
                desc: "Direct negative feedback to a private form, keeping your public rating pristine."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2024 Revues. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
