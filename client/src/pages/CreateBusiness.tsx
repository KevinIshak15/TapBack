import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSchema, type InsertBusiness } from "@shared/schema";
import { useCreateBusiness } from "@/hooks/use-businesses";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateBusiness() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const createMutation = useCreateBusiness();

  const form = useForm<InsertBusiness>({
    resolver: zodResolver(insertBusinessSchema),
    defaultValues: {
      ownerId: user?.id,
      name: "",
      category: "",
      googleReviewUrl: "",
      focusAreas: [],
    },
  });

  const onSubmit = async (data: InsertBusiness) => {
    try {
      if (!user) return;
      // Don't send ownerId - it's added server-side
      await createMutation.mutateAsync(data);
      toast({
        title: "Success!",
        description: "Business profile created successfully.",
      });
      // Wait a bit for the query to invalidate, then navigate
      setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-8 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-strong border-slate-200/60 shadow-2xl">
            <CardHeader className="space-y-2 pb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-display">Add New Business</CardTitle>
              <CardDescription className="text-base">
                Set up your business profile to start collecting reviews and growing your online reputation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Business Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Joe's Coffee Shop"
                    className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold">
                    Category *
                  </Label>
                  <Input
                    id="category"
                    placeholder="e.g. Restaurant, Retail, Service"
                    className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    {...form.register("category")}
                  />
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleReviewUrl" className="text-sm font-semibold">
                    Google Review URL *
                  </Label>
                  <Input
                    id="googleReviewUrl"
                    placeholder="https://g.page/r/..."
                    className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    {...form.register("googleReviewUrl")}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Find this in your Google Business Profile dashboard under "Get more reviews".
                  </p>
                  {form.formState.errors.googleReviewUrl && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.googleReviewUrl.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all mt-8"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Business
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
