import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VolCop" },
      { name: "description", content: "VolCop privacy policy describing how volunteer program information is collected, used, and protected." },
      { property: "og:title", content: "Privacy Policy — VolCop" },
      { property: "og:description", content: "How VolCop handles volunteer program information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="py-20 lg:py-28 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <SectionEyebrow>Legal</SectionEyebrow>
          <SerifHeading as="h1" className="text-5xl lg:text-6xl mt-6 text-balance">
            Privacy Policy
          </SerifHeading>
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[#B48A44]">
            Effective date: May 1, 2026
          </p>

          <div className="mt-10 space-y-6 text-[#4B5563] leading-relaxed text-base">
            <p>
              VolCop provides mobile access to VolSmart volunteer operations tools for authorized volunteers, officers, coordinators, and administrators.
            </p>

            <SerifHeading as="h2" className="text-2xl pt-6">Information We Collect</SerifHeading>
            <p>
              The current mobile app prototype does not transmit information to VolCop servers and does not collect analytics or tracking data.
            </p>
            <p>
              For a production VolCop deployment, VolCop may process information needed to operate volunteer programs, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account identifiers such as name, badge number, role, unit, email address, and phone number</li>
              <li>Scheduling information such as assigned shifts, sign-ups, duty status, and completion history</li>
              <li>Training and certification status</li>
              <li>Roster, unit, fleet, form, and administrative records entered or maintained by authorized organization users</li>
              <li>Support messages or requests submitted through VolCop support channels</li>
            </ul>

            <SerifHeading as="h2" className="text-2xl pt-6">How Information Is Used</SerifHeading>
            <p>
              Information is used to provide authorized access, coordinate volunteer operations, manage schedules and training, maintain rosters and fleet records, support reporting, and respond to support requests.
            </p>

            <SerifHeading as="h2" className="text-2xl pt-6">Sharing</SerifHeading>
            <p>
              VolCop does not sell personal information. Information may be shared with the organization that administers the volunteer program, authorized VolCop administrators, and service providers that help operate VolCop under appropriate confidentiality and data protection obligations.
            </p>

            <SerifHeading as="h2" className="text-2xl pt-6">Tracking and Advertising</SerifHeading>
            <p>
              VolCop does not use third-party advertising or tracking in the current mobile app.
            </p>

            <SerifHeading as="h2" className="text-2xl pt-6">Retention and Deletion</SerifHeading>
            <p>
              Volunteer records are retained as required for program administration, reporting, legal, security, and operational needs. Authorized users may request correction or deletion of eligible personal information by contacting the organization administrator or VolCop support.
            </p>

            <SerifHeading as="h2" className="text-2xl pt-6">Security</SerifHeading>
            <p>
              VolCop uses reasonable administrative, technical, and organizational safeguards designed to protect volunteer program information.
            </p>

            <SerifHeading as="h2" className="text-2xl pt-6">Contact</SerifHeading>
            <p>
              For privacy questions or data requests, contact VolCop support:
            </p>
            <p>
              <a href="https://volcop.com/contact" className="text-[#13243A] font-semibold underline hover:text-[#B48A44]">
                https://volcop.com/contact
              </a>
            </p>
            <p>
              Before App Store submission, publish the final approved policy at:
            </p>
            <p>
              <a href="https://volcop.com/privacy" className="text-[#13243A] font-semibold underline hover:text-[#B48A44]">
                https://volcop.com/privacy
              </a>
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
