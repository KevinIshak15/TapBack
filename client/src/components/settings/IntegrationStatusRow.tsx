import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Unplug } from "lucide-react";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

export interface IntegrationStatusRowProps {
  status: "disconnected" | "active" | "needs_reauth";
  connectedEmail?: string | null;
  loading?: boolean;
  onConnect: () => void;
  onReconnect: () => void;
  onDisconnect: () => void;
  disconnectLoading?: boolean;
}

export function IntegrationStatusRow({
  status,
  connectedEmail,
  loading,
  onConnect,
  onReconnect,
  onDisconnect,
  disconnectLoading,
}: IntegrationStatusRowProps) {
  const connected = status === "active" || status === "needs_reauth";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              connected ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}
          >
            {connected ? "Connected" : "Not connected"}
          </span>
        )}
        {connected && connectedEmail && (
          <span className="text-sm text-slate-600">{maskEmail(connectedEmail)}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {!connected && (
          <Button
            type="button"
            onClick={onConnect}
            disabled={loading}
            className="rounded-xl h-10 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Connect Google Business Profile
          </Button>
        )}
        {connected && (
          <>
            <Button type="button" variant="outline" size="sm" className="rounded-xl h-10" onClick={onReconnect}>
              Reconnect
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDisconnect}
              disabled={disconnectLoading}
            >
              {disconnectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4 mr-1" />}
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
