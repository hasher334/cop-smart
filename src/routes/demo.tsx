import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";
import { supabase } from "@/integrations/supabase/client";
import { notifyFormRecipients } from "@/lib/email/send";
import { toast } from "sonner";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Request a Demo — CopSmart by VolCop" },
      { name: "description", content: "Schedule a 30-minute live walkthrough of the CopSmart volunteer management platform tailored to your agency." },
      { property: "og:title", content: "Request a Demo — CopSmart" },
      { property: "og:description", content: "Live 30-minute walkthrough with sample data sized to your agency." },
    ],
  }),
  component: DemoPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  work_email: z.string().trim().email("Valid agency email required").max(255),
  agency: z.string().trim().min(2, "Agency name is required").max(150),
  agency_size: z.string().max(50).optional(),
  role_title: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(1000).optional(),
});

type FormState = z.infer<typeof schema>;

const initial: FormState = {
  full_name: "",
  work_email: "",
  agency: "",
  agency_size: "",
  role_title: "",
  phone: "",
  message: "",
};

function DemoPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setSubmitting(true);
    const submissionId = crypto.randomUUID();
    const { error } = await supabase
      .from("demo_requests")
      .insert({
        id: submissionId,
        full_name: result.data.full_name,
        work_email: result.data.work_email,
        agency: result.data.agency,
        agency_size: result.data.agency_size || null,
        role_title: result.data.role_title || null,
        phone: result.data.phone || null,
        message: result.data.message || null,
      });
    setSubmitting(false);

    if (error) {
      toast.error("Submission failed. Please try again or email sales@volcop.com.");
      return;
    }

    // Fire-and-forget notification email to internal recipients.
    void notifyFormRecipients({
      formType: "Demo Request",
      submissionId,
      fields: [
        { label: "Full Name", value: result.data.full_name },
        { label: "Work Email", value: result.data.work_email },
        { label: "Agency", value: result.data.agency },
        { label: "Agency Size", value: result.data.agency_size || "—" },
        { label: "Role / Title", value: result.data.role_title || "—" },
        { label: "Phone", value: result.data.phone || "—" },
        { label: "Message", value: result.data.message || "—" },
      ],
    });

    setSubmitted(true);
    toast.success("Demo request received — we'll be in touch within one business day.");
  };

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  return (
    <MarketingShell>
      <section className="py-20 lg:py-24 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
          {/* Left: pitch */}
          <div className="lg:col-span-5">
            <SectionEyebrow>Live Demo</SectionEyebrow>
            <SerifHeading as="h1" className="text-5xl lg:text-6xl mt-6 text-balance">
              See CopSmart with your agency in mind.
            </SerifHeading>
            <p className="mt-6 text-lg text-[#4B5563] leading-relaxed">
              Tell us about your unit. We'll prepare a 30-minute walkthrough
              with sample data sized to your operation and answer every
              question your team has.
            </p>
            <ul className="mt-10 space-y-4">
              {[
                "30-minute live walkthrough on Zoom or Teams",
                "Sample data sized to your agency",
                "Conversation with the people who built it",
                "No commitment, no high-pressure pitch",
                "Written pricing quote follows by email",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B48A44] mt-0.5 shrink-0" />
                  <span className="text-[#0D141E]">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 p-6 border border-[#0D141E]/15 bg-white">
              <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Already a CopSmart user?</div>
              <p className="mt-2 text-sm text-[#4B5563]">
                If your agency already has credentials, sign in directly.
              </p>
              <Link to="/login" className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#13243A] hover:text-[#B48A44]">
                Sign in to CopSmart <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-white border border-[#0D141E]/15 p-10 lg:p-14 text-center">
                <div className="size-16 mx-auto bg-[#13243A] flex items-center justify-center text-white">
                  <CheckCircle2 className="h-8 w-8 text-[#B48A44]" />
                </div>
                <SerifHeading as="h2" className="text-3xl mt-6">Request received.</SerifHeading>
                <p className="mt-4 text-[#4B5563] max-w-md mx-auto leading-relaxed">
                  Thank you. A member of our team will reach out within one
                  business day to schedule your walkthrough.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/product" className="px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#13243A] border border-[#0D141E]/20 hover:border-[#B48A44]">
                    Read more about CopSmart
                  </Link>
                  <Link to="/" className="px-6 py-3 text-sm font-bold uppercase tracking-wide bg-[#13243A] text-white hover:bg-[#0D141E]">
                    Return Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-[#0D141E]/15">
                <div className="p-6 border-b-2 border-[#13243A] bg-[#13243A] text-white">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Demo Request Form</div>
                  <SerifHeading as="h2" className="text-2xl text-white mt-2">Tell us about your agency</SerifHeading>
                </div>
                <div className="p-6 lg:p-8 grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name *" error={errors.full_name}>
                    <input
                      required
                      value={form.full_name}
                      onChange={update("full_name")}
                      maxLength={100}
                      className={inputClass(!!errors.full_name)}
                      placeholder="Sgt. Jane Smith"
                    />
                  </Field>
                  <Field label="Work Email *" error={errors.work_email}>
                    <input
                      required
                      type="email"
                      value={form.work_email}
                      onChange={update("work_email")}
                      maxLength={255}
                      className={inputClass(!!errors.work_email)}
                      placeholder="jsmith@agency.gov"
                    />
                  </Field>
                  <Field label="Agency *" error={errors.agency} className="sm:col-span-2">
                    <input
                      required
                      value={form.agency}
                      onChange={update("agency")}
                      maxLength={150}
                      className={inputClass(!!errors.agency)}
                      placeholder="e.g., Metropolitan County Sheriff's Office"
                    />
                  </Field>
                  <Field label="Role / Title" error={errors.role_title}>
                    <input
                      value={form.role_title}
                      onChange={update("role_title")}
                      maxLength={100}
                      className={inputClass(false)}
                      placeholder="Volunteer Coordinator"
                    />
                  </Field>
                  <Field label="Agency Size">
                    <select
                      value={form.agency_size}
                      onChange={update("agency_size")}
                      className={inputClass(false)}
                    >
                      <option value="">Select…</option>
                      <option value="<50">Under 50 volunteers</option>
                      <option value="50-150">50 – 150 volunteers</option>
                      <option value="150-500">150 – 500 volunteers</option>
                      <option value="500+">500+ volunteers</option>
                    </select>
                  </Field>
                  <Field label="Phone" error={errors.phone} className="sm:col-span-2">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      maxLength={30}
                      className={inputClass(false)}
                      placeholder="(561) 555-0142"
                    />
                  </Field>
                  <Field label="What would you like to discuss?" error={errors.message} className="sm:col-span-2">
                    <textarea
                      value={form.message}
                      onChange={update("message")}
                      maxLength={1000}
                      rows={4}
                      className={inputClass(false) + " resize-y"}
                      placeholder="Current pain points, must-have features, timeline…"
                    />
                  </Field>
                </div>
                <div className="p-6 lg:p-8 border-t border-[#0D141E]/10 bg-[#F3F1EC]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-[#4B5563]">
                    By submitting, you agree to be contacted by VolCop about CopSmart. We never share your data.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Request Demo <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function inputClass(hasError: boolean) {
  return `w-full bg-white border ${hasError ? "border-red-500" : "border-[#0D141E]/20"} px-3 py-2.5 text-base text-[#0D141E] focus:outline-none focus:border-[#13243A] focus:ring-2 focus:ring-[#13243A]/20`;
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-[#13243A]">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
