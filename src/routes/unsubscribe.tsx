import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MarketingShell, SerifHeading } from "@/components/marketing/marketing-shell";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — VolCop" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    if (!t) {
      setState({ kind: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        if (r.status === 404) return setState({ kind: "invalid" });
        const data = await r.json();
        if (data?.valid) return setState({ kind: "valid" });
        if (data?.reason === "already_unsubscribed") return setState({ kind: "already" });
        setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "error", message: "Could not verify link." }));
  }, []);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (data?.success) return setState({ kind: "done" });
      if (data?.reason === "already_unsubscribed") return setState({ kind: "already" });
      setState({ kind: "error", message: data?.error ?? "Failed to unsubscribe." });
    } catch (e) {
      setState({ kind: "error", message: "Network error." });
    }
  };

  return (
    <MarketingShell>
      <section className="py-24">
        <div className="mx-auto max-w-xl px-6 text-center">
          <SerifHeading as="h1" className="text-4xl">Email preferences</SerifHeading>
          <div className="mt-8 bg-white border border-[#0D141E]/15 p-8">
            {state.kind === "loading" && <p className="text-[#4B5563]">Verifying link…</p>}
            {state.kind === "valid" && (
              <>
                <p className="text-[#0D141E]">Click below to unsubscribe from VolCop emails.</p>
                <button onClick={confirm} className="mt-6 inline-flex items-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E]">
                  Confirm Unsubscribe
                </button>
              </>
            )}
            {state.kind === "submitting" && <p className="text-[#4B5563]">Processing…</p>}
            {state.kind === "done" && (
              <p className="text-[#0D141E]">You've been unsubscribed. We're sorry to see you go.</p>
            )}
            {state.kind === "already" && (
              <p className="text-[#0D141E]">You've already unsubscribed from this address.</p>
            )}
            {state.kind === "invalid" && (
              <p className="text-[#4B5563]">This unsubscribe link is invalid or has expired.</p>
            )}
            {state.kind === "error" && (
              <p className="text-red-600">{state.message}</p>
            )}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
