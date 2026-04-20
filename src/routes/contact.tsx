import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";
import { supabase } from "@/integrations/supabase/client";
import { notifyFormRecipients } from "@/lib/email/send";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VolCop" },
      { name: "description", content: "Get in touch with VolCop sales for pricing, demos, or partnership inquiries." },
      { property: "og:title", content: "Contact — VolCop" },
      { property: "og:description", content: "Reach VolCop sales for pricing and partnership inquiries." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  message: z.string().trim().min(5, "Message is required").max(2000),
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fe: typeof errors = {};
      for (const i of result.error.issues) fe[i.path[0] as keyof typeof errors] = i.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const submissionId = crypto.randomUUID();
    const { error } = await supabase.from("contact_submissions").insert({
      id: submissionId,
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });
    if (error) {
      setSubmitting(false);
      toast.error("Could not send your message. Please try again.");
      return;
    }
    void notifyFormRecipients({
      formType: "Contact Inquiry",
      fields: [
        { label: "Name", value: result.data.name },
        { label: "Email", value: result.data.email },
        { label: "Message", value: result.data.message },
      ],
    });
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Message sent — we'll be in touch shortly.");
  };

  return (
    <MarketingShell>
      <section className="py-20 lg:py-28 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <SectionEyebrow>Get In Touch</SectionEyebrow>
            <SerifHeading as="h1" className="text-5xl lg:text-6xl mt-6 text-balance">
              Talk to VolCop.
            </SerifHeading>
            <p className="mt-6 text-lg text-[#4B5563] leading-relaxed">
              For demos, pricing, or partnership questions — we respond within one business day.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-start gap-4">
                <div className="size-10 bg-[#13243A] flex items-center justify-center text-white shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Email</div>
                  <a href="mailto:sales@volcop.com" className="text-lg text-[#13243A] font-semibold hover:text-[#B48A44]">sales@volcop.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 bg-[#13243A] flex items-center justify-center text-white shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Phone</div>
                  <p className="text-lg text-[#13243A] font-semibold">(561) 555-0142</p>
                  <p className="text-sm text-[#4B5563] mt-1">Mon–Fri, 9:00 AM – 5:00 PM ET</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 bg-[#13243A] flex items-center justify-center text-white shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Headquarters</div>
                  <address className="text-lg text-[#13243A] font-semibold not-italic mt-1">
                    United States
                  </address>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-white border border-[#0D141E]/15 p-10 text-center">
                <div className="size-16 mx-auto bg-[#13243A] flex items-center justify-center text-white">
                  <CheckCircle2 className="h-8 w-8 text-[#B48A44]" />
                </div>
                <SerifHeading as="h2" className="text-3xl mt-6">Message sent.</SerifHeading>
                <p className="mt-4 text-[#4B5563] max-w-md mx-auto leading-relaxed">
                  Thanks for reaching out. A member of our team will respond within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-[#0D141E]/15">
                <div className="p-6 border-b-2 border-[#13243A] bg-[#13243A] text-white">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Send a Message</div>
                  <SerifHeading as="h2" className="text-2xl text-white mt-2">Tell us how we can help</SerifHeading>
                </div>
                <div className="p-6 lg:p-8 space-y-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#13243A]">Name *</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className={`w-full bg-white border ${errors.name ? "border-red-500" : "border-[#0D141E]/20"} px-3 py-2.5 text-base text-[#0D141E] focus:outline-none focus:border-[#13243A] focus:ring-2 focus:ring-[#13243A]/20`}
                      placeholder="Sgt. Jane Smith"
                    />
                    {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#13243A]">Email *</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={255}
                      className={`w-full bg-white border ${errors.email ? "border-red-500" : "border-[#0D141E]/20"} px-3 py-2.5 text-base text-[#0D141E] focus:outline-none focus:border-[#13243A] focus:ring-2 focus:ring-[#13243A]/20`}
                      placeholder="you@agency.gov"
                    />
                    {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#13243A]">Message *</span>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={2000}
                      rows={5}
                      className={`w-full bg-white border ${errors.message ? "border-red-500" : "border-[#0D141E]/20"} px-3 py-2.5 text-base text-[#0D141E] focus:outline-none focus:border-[#13243A] focus:ring-2 focus:ring-[#13243A]/20 resize-y`}
                      placeholder="What can we help you with?"
                    />
                    {errors.message && <span className="text-xs text-red-600">{errors.message}</span>}
                  </label>
                </div>
                <div className="p-6 lg:p-8 border-t border-[#0D141E]/10 bg-[#F3F1EC]/40 flex items-center justify-between gap-4">
                  <Link to="/demo" className="text-xs font-bold uppercase tracking-wide text-[#13243A] hover:text-[#B48A44]">
                    Or request a full demo →
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E] disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Send Message <ArrowRight className="h-4 w-4" /></>}
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
