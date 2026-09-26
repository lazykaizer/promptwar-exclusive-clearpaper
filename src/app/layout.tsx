import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearPaper — Understand What You Sign",
  description:
    "ClearPaper helps you understand legal documents in plain language. Upload a rental agreement, job offer, freelance contract, or NDA and get a clause-by-clause breakdown, risk analysis, and plain-language summary. Jo likha hai, wahi samjho.",
  keywords: [
    "legal document analysis",
    "contract review",
    "plain language legal",
    "rental agreement review",
    "NDA analysis",
    "job offer review",
    "legal AI India",
  ],
  openGraph: {
    title: "ClearPaper — Understand What You Sign",
    description:
      "Clause-by-clause breakdown, risk analysis, and plain-language summaries for any legal document.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
