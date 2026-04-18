import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  const sections = [
    { id: "collection", title: "Data Collection" },
    { id: "usage", title: "Usage" },
    { id: "storage", title: "Storage & Security" },
    { id: "rights", title: "Your Rights" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 bg-white">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-500">Effective Date: April 18, 2026</p>
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
          <div className="flex-1 max-w-3xl space-y-12 text-slate-700 leading-relaxed">
            
            <section id="collection" className="scroll-mt-24">
              <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">1. Data Collection</h2>
              <p className="mb-4">Protecting your privacy is fundamental to our business. We collect the following types of information when you use Tafsiri:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password hash, and payment details (processed securely via our payment provider).</li>
                <li><strong>Usage Data:</strong> Source text inputs and generated translations. Note: Enterprise customers can opt out of data-logging entirely.</li>
                <li><strong>Analytics Data:</strong> IP addresses, browser types, and interaction metrics to improve our interface.</li>
              </ul>
            </section>

            <section id="usage" className="scroll-mt-24">
              <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">2. Application & Usage of Data</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide, maintain, and improve the translation algorithms.</li>
                <li>To process transactions and send related information including confirmations and invoices.</li>
                <li>To send technical notices, updates, security alerts, and support messages.</li>
                <li><strong>For free-tier users:</strong> To anonymously train and refine our machine learning models. We strip personal identifying context before training.</li>
              </ul>
            </section>

            <section id="storage" className="scroll-mt-24">
              <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">3. Storage & Security</h2>
              <p>All data is encrypted in transit using industry-standard TLS 1.3 and at rest using AES-256 encryption. We utilize enterprise-grade cloud infrastructure with strictly controlled access policies. Your translation history is stored securely for your convenience, and you may delete it at any time from your dashboard.</p>
            </section>

            <section id="rights" className="scroll-mt-24">
              <h2 className="text-2xl font-bold font-serif text-slate-900 mb-4">4. Your Rights</h2>
              <p className="mb-4">Depending on your location (e.g., under GDPR or CCPA), you possess specific rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to access, update, or delete the information we have on you.</li>
                <li>The right to rectify any inaccurate data.</li>
                <li>The right to object to our processing of your personal data.</li>
                <li>The right to request data portability in a structured, machine-readable format.</li>
              </ul>
              <p className="mt-4">To exercise any of these rights, please contact our Data Protection Officer at privacy@tafsiri.com.</p>
            </section>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
