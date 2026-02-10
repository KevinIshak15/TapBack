import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { useCreateBusiness } from "@/hooks/use-businesses";
import {
  useGoogleIntegrationStatus,
  useGoogleLocations,
  useSelectGoogleLocations,
  useDisconnectGoogle,
  type GoogleLocationOption,
} from "@/hooks/use-google-integration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, Building2, AlertTriangle, ExternalLink, Unplug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WARNING_MESSAGE =
  "You must connect Google Business Profile to add a business. reAiviews needs access to your profile to import locations, reviews, and insights.";

export default function CreateBusiness() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const statusQuery = useGoogleIntegrationStatus();
  const locationsQuery = useGoogleLocations(statusQuery.data?.status === "active");
  const selectLocationsMutation = useSelectGoogleLocations();
  const disconnectMutation = useDisconnectGoogle();
  const createMutation = useCreateBusiness();

  const [selectedLocations, setSelectedLocations] = useState<GoogleLocationOption[]>([]);
  const [connecting, setConnecting] = useState(false);

  const status = statusQuery.data?.status ?? "disconnected";
  const connectedEmail = statusQuery.data?.connectedEmail;
  const locations = locationsQuery.data?.locations ?? [];
  const locationsError = locationsQuery.data?.error;
  const activationUrl = locationsQuery.data?.activationUrl;

  // Handle OAuth return: refetch status and show toast
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("google_connected");
    const error = params.get("google_error");
    if (connected === "1") {
      statusQuery.refetch();
      toast({ title: "Connected", description: "Google Business Profile connected successfully." });
      window.history.replaceState({}, "", "/business/new");
    }
    if (error) {
      toast({
        variant: "destructive",
        title: "Google connection failed",
        description: error === "access_denied" ? "You denied access." : String(error),
      });
      window.history.replaceState({}, "", "/business/new");
    }
  }, []);

  const handleConnectGoogle = () => {
    setConnecting(true);
    window.location.href = "/api/integrations/google/start";
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      setSelectedLocations([]);
      toast({ title: "Disconnected", description: "Google Business Profile disconnected." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to disconnect." });
    }
  };

  const toggleLocation = (loc: GoogleLocationOption) => {
    setSelectedLocations((prev) => {
      const exists = prev.some((l) => l.locationResourceName === loc.locationResourceName);
      if (exists) return prev.filter((l) => l.locationResourceName !== loc.locationResourceName);
      return [...prev, loc];
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (status !== "active") {
      toast({ variant: "destructive", title: "Connect Google", description: WARNING_MESSAGE });
      return;
    }
    if (selectedLocations.length === 0) {
      toast({
        variant: "destructive",
        title: "Select a location",
        description: "Select at least one Google Business Profile location to add.",
      });
      return;
    }
    try {
      await selectLocationsMutation.mutateAsync(selectedLocations);
      const created = await createMutation.mutateAsync({
        locationResourceNames: selectedLocations.map((l) => l.locationResourceName),
      });
      toast({
        title: "Success!",
        description: created.length === 1 ? "Business added." : `${created.length} businesses added.`,
      });
      setTimeout(() => setLocation("/dashboard"), 100);
    } catch (e: any) {
      const msg = e?.message || "Failed to add business.";
      const alreadyAdded = e?.alreadyAdded;
      toast({
        variant: "destructive",
        title: "Error",
        description: alreadyAdded ? "This location is already added." : msg,
      });
    }
  };

  const canSubmit = status === "active" && selectedLocations.length > 0 && !createMutation.isPending;
  const isDisabled = status !== "active" || status === "needs_reauth";

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Please sign in to add a business.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="space-y-2 pb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-display">Add New Business</CardTitle>
            <CardDescription className="text-base">
              Connect your Google Business Profile to import locations. Use the Google account that owns your business. Select the location(s) to add to reAiviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* NEEDS_REAUTH banner */}
            {status === "needs_reauth" && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Google connection expired or was revoked.</p>
                  <p className="text-sm text-amber-800 mt-1">Please reconnect to add or manage businesses.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 text-amber-800"
                    onClick={handleConnectGoogle}
                  >
                    Reconnect Google
                  </Button>
                </div>
              </div>
            )}

            {/* Google connection block */}
            <div className="space-y-3">
              {statusQuery.isLoading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking connection…</span>
                </div>
              ) : status === "disconnected" ? (
                <>
                  <p className="text-sm text-slate-600">{WARNING_MESSAGE}</p>
                  <Button
                    onClick={handleConnectGoogle}
                    disabled={connecting}
                    className="gap-2"
                  >
                    {connecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    Connect Google Business Profile
                  </Button>
                </>
              ) : status === "active" ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium text-slate-700">
                      Connected to Google{connectedEmail ? ` (${connectedEmail})` : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleConnectGoogle}>
                        Reconnect
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDisconnect()}
                        disabled={disconnectMutation.isPending}
                      >
                        <Unplug className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Location picker */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-800 mb-3">
                      Select the Google Business Profile location(s) to add to reAiviews
                    </p>
                    {locationsQuery.isLoading ? (
                      <div className="flex items-center gap-2 text-slate-500 py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading locations…</span>
                      </div>
                    ) : locations.length === 0 ? (
                      <div className="text-sm py-2 space-y-1">
                        {locationsError ? (
                          <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 space-y-2">
                            <p>{locationsError}</p>
                            {activationUrl && (
                              <a
                                href={activationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-amber-800 underline font-medium"
                              >
                                {locationsError?.toLowerCase().includes("quota") || locationsError?.toLowerCase().includes("request access")
                                  ? "Request GBP API access"
                                  : "Enable My Business Account Management API"}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-500">No locations found. Check your Google Business Profile has at least one location.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {locations.map((loc) => (
                          <label
                            key={loc.locationResourceName}
                            className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedLocations.some((l) => l.locationResourceName === loc.locationResourceName)}
                              onCheckedChange={() => toggleLocation(loc)}
                            />
                            <div className="text-sm">
                              <span className="font-medium text-slate-900">{loc.locationName || loc.locationResourceName}</span>
                              {loc.storeAddress && (
                                <p className="text-slate-500 truncate">{loc.storeAddress}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Inline warning when submit disabled */}
            {isDisabled && status !== "needs_reauth" && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                {WARNING_MESSAGE}
              </p>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full h-12 font-medium"
              disabled={!canSubmit}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Add Business
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
