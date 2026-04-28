import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "VolCop";

interface FormSubmissionNotificationProps {
  formType?: string;
  submittedAt?: string;
  fields?: Array<{ label: string; value: string }>;
}

const FormSubmissionNotificationEmail = ({
  formType = "Form submission",
  submittedAt,
  fields = [],
}: FormSubmissionNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {formType} on {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={brand}>{SITE_NAME}</Text>
          <Text style={brandSub}>VolSmart Platform</Text>
        </Section>
        <Heading style={h1}>New {formType}</Heading>
        {submittedAt ? (
          <Text style={meta}>Received {submittedAt}</Text>
        ) : null}
        <Hr style={hr} />
        <Section>
          {fields.map((f) => (
            <Section key={f.label} style={fieldRow}>
              <Text style={fieldLabel}>{f.label}</Text>
              <Text style={fieldValue}>{f.value || "—"}</Text>
            </Section>
          ))}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          This is an automated notification from the {SITE_NAME} marketing site.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: FormSubmissionNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New ${data.formType ?? "form submission"} — ${SITE_NAME}`,
  displayName: "Form submission notification",
  previewData: {
    formType: "Demo Request",
    submittedAt: "Apr 18, 2026 04:15 AM ET",
    fields: [
      { label: "Full Name", value: "Sgt. Jane Smith" },
      { label: "Work Email", value: "jsmith@agency.gov" },
      { label: "Agency", value: "Metropolitan County Sheriff's Office" },
      { label: "Agency Size", value: "150-500" },
      { label: "Role / Title", value: "Volunteer Coordinator" },
      { label: "Phone", value: "(561) 555-0142" },
      { label: "Message", value: "Looking to replace our spreadsheets." },
    ],
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
};
const container = { padding: "24px 28px", maxWidth: "600px" };
const brandBar = {
  backgroundColor: "#13243A",
  padding: "16px 20px",
  marginBottom: "24px",
};
const brand = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold" as const,
  margin: "0",
  letterSpacing: "0.05em",
};
const brandSub = {
  color: "#B48A44",
  fontSize: "11px",
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
  margin: "4px 0 0",
};
const h1 = {
  fontSize: "22px",
  fontWeight: "bold" as const,
  color: "#0D141E",
  margin: "0 0 6px",
};
const meta = { fontSize: "12px", color: "#4B5563", margin: "0 0 8px" };
const hr = { borderColor: "#0D141E22", margin: "16px 0" };
const fieldRow = { margin: "0 0 14px" };
const fieldLabel = {
  fontSize: "11px",
  fontWeight: "bold" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#B48A44",
  margin: "0 0 2px",
};
const fieldValue = {
  fontSize: "14px",
  color: "#0D141E",
  margin: "0",
  lineHeight: "1.5",
};
const footer = {
  fontSize: "11px",
  color: "#999999",
  margin: "20px 0 0",
};
