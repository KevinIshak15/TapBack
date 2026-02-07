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
import { Loader2, ArrowLeft } from "lucide-react";
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
      focusAreas: []
    }
  });

  const onSubmit = async (data: InsertBusiness) => {
    try {
      if (!user) return;
      await createMutation.mutateAsync({ ...data, ownerId: user.id });
      toast({ title: "Success", description: "Business profile created!" });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Add New Business</CardTitle>
            <CardDescription>Setup your business profile to start collecting reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Joe's Coffee Shop" 
                  {...form.register("name")} 
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g. Restaurant, Retail, Service" 
                  {...form.register("category")} 
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleReviewUrl">Google Review URL</Label>
                <Input 
                  id="googleReviewUrl" 
                  placeholder="https://g.page/r/..." 
                  {...form.register("googleReviewUrl")} 
                />
                <p className="text-xs text-muted-foreground">Find this in your Google Business Profile dashboard under "Get more reviews".</p>
                {form.formState.errors.googleReviewUrl && (
                  <p className="text-sm text-red-500">{form.formState.errors.googleReviewUrl.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Business
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
