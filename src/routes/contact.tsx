import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";
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
    await notifyFormRecipients({
      formType: "Contact Inquiry",
      submissionId: crypto.randomUUID(),
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
                    Florida<br />
                    <span className="text-sm font-normal text-[#4B5563]">United States</span>
                  </address>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-[#0D141E]/15 p-8 lg:p-10">
              <SerifHeading as="h2" className="text-3xl">Prefer a structured intro?</SerifHeading>
              <p className="mt-4 text-[#4B5563] leading-relaxed">
                Most agencies start with a 30-minute demo. We'll show CopSmart
                in action with sample data sized to your unit, then answer
                your questions.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#0D141E]">
                <li>• Walk-through of every CopSmart module</li>
                <li>• Sample data sized to your agency</li>
                <li>• Pricing discussion based on your needs</li>
                <li>• Implementation and migration timeline</li>
              </ul>
              <Link to="/demo" className="mt-8 inline-flex items-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E]">
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 bg-[#13243A] text-white p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Pricing</div>
              <SerifHeading as="h3" className="text-2xl text-white mt-2">Quoted per agency.</SerifHeading>
              <p className="mt-3 text-white/80 leading-relaxed">
                CopSmart pricing depends on volunteer count, units, and
                migration scope. We'll prepare a written quote after our
                discovery call — no surprise per-seat fees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
