import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  const sections = [
    { id: "acceptance", title: "Acceptance" },
    { id: "description", title: "Description" },
    { id: "accounts", title: "Accounts" },
    { id: "acceptable-use", title: "Acceptable Use" },
    { id: "ip", title: "IP" },
    { id: "liability", title: "Liability" },
    { id: "changes", title: "Changes" },
    { id: "law", title: "Law" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 bg-white">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-slate-500">Last updated: April 18, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-12 flex flex-col md:flex-row gap-12 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0 p-6 bg-slate-50 rounded-2xl border border-slate-100 sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4 pb-4 border-b border-slate-200">Table of Contents</h3>
            <ul className="space-y-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link 
                    href={`#${section.id}`}
                    className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-3xl">
            {/* TL;DR Box */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 mb-12">
              <h3 className="font-bold text-primary-900 mb-2">TL;DR</h3>
              <p className="text-sm text-primary-800 leading-relaxed">
                By using Tafsiri, you agree not to misuse our translation services, attempt to reverse-engineer our proprietary AI models, or use the tool for unlawful purposes. You retain ownership of your inputs, while we retain ownership of our platform. We offer the service "as-is" without guaranteed uptime, although we strive for 99.9%.
              </p>
            </div>

            <div className="space-y-12 text-slate-700 leading-relaxed">
              <section id="acceptance" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">1. Acceptance of Terms</h2>
                <p>Welcome to Tafsiri. By accessing or using our websites, software, translations algorithms, or applications (collectively, the "Service"), you signify your agreement to these Terms of Service. If you do not agree to these Terms, you may not use the Service.</p>
              </section>

              <section id="description" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">2. Description of Service</h2>
                <p>Tafsiri provides a suite of advanced machine-learning powered translation tools designed for personal and professional use. We constantly update and improve the Service, which means features may be added, modified, or removed from time to time.</p>
              </section>

              <section id="accounts" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">3. Accounts and Security</h2>
                <p>You must provide accurate information when creating an account. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              </section>

              <section id="acceptable-use" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">4. Acceptable Use Policy</h2>
                <p className="mb-4">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Translate material that facilitates illegal activity.</li>
                  <li>Attempt to bypass, exploit, or reverse-engineer the translation algorithms.</li>
                  <li>Use automated scripts or scrapers to access the service outside our official API.</li>
                </ul>
              </section>

              <section id="ip" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">5. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Tafsiri. Your user inputs remain your intellectual property, and you grant us a limited license to process this data solely to provide the translation service to you.</p>
              </section>

              <section id="liability" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">6. Limitation of Liability</h2>
                <p>In no event shall Tafsiri, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
              </section>

              <section id="changes" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">7. Changes to Terms</h2>
                <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes via email or prominently on our website.</p>
              </section>

              <section id="law" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">8. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.</p>
              </section>

              <section id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">9. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at legal@tafsiri.com.</p>
              </section>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
