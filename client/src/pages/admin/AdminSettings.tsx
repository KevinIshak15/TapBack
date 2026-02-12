import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-600 mt-0.5">Platform-level settings (basic form placeholder)</p>
      </div>
      <Card className="app-card">
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Configure platform defaults. Backend not wired yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input id="siteName" placeholder="TapBack" className="bg-white" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input id="supportEmail" type="email" placeholder="support@example.com" className="bg-white" readOnly />
          </div>
          <Button disabled>Save (not wired)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
