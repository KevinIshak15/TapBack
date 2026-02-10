import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSchema, type InsertBusiness } from "@shared/schema";
import { useCreateBusiness } from "@/hooks/use-businesses";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";

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
    <AppShell>
      <div className="max-w-2xl space-y-6">
        <PageHeader
          title="Add business"
          description="Set up your business profile to start collecting reviews."
        />
        <Card className="app-card">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Business name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Joe's Coffee Shop"
                  className="h-10 rounded-lg border-slate-200 bg-white"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                  Category
                </Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) => form.setValue("category", value, { shouldValidate: true })}
                >
                  <SelectTrigger id="category" className="h-10 rounded-lg border-slate-200 bg-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Cafe">Cafe</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Beauty & Wellness">Beauty & Wellness</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Home Services">Home Services</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Fitness & Sports">Fitness & Sports</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Travel & Hospitality">Travel & Hospitality</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleReviewUrl" className="text-sm font-medium text-slate-700">
                  Google review URL
                </Label>
                <Input
                  id="googleReviewUrl"
                  placeholder="https://g.page/r/..."
                  className="h-10 rounded-lg border-slate-200 bg-white"
                  {...form.register("googleReviewUrl")}
                />
                <p className="text-xs text-slate-500">
                  From your Google Business Profile under “Get more reviews”.
                </p>
                {form.formState.errors.googleReviewUrl && (
                  <p className="text-sm text-red-600">{form.formState.errors.googleReviewUrl.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5 mr-2" />
                    Create business
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
