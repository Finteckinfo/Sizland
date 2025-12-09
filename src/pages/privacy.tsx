import React from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage: NextPage = () => {
  const { resolvedTheme: theme } = useTheme();

  return (
    <PageLayout 
      title="Privacy Policy - Sizland" 
      description="Learn how Sizland protects your privacy and handles your data. Our commitment to transparency and security in our decentralized platform."
      flexDirection="col"
      justify="start"
      align="start"
      gap={8}
      requireAuth={false}
    >
      <div className="w-full max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
            Privacy Policy
          </h1>
          
          <div className={`prose prose-lg max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              This Privacy Policy describes how Sizland (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and discloses your personal information when you use our website, products, and services (collectively, &quot;Services&quot;).
            </p>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                1. Information We Collect
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:
              </p>
              <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4 space-y-2`}>
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials and profile information</li>
                <li>Payment and billing information</li>
                <li>Wallet addresses and blockchain transaction data</li>
                <li>Communications with us</li>
                <li>Any other information you choose to provide</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                2. How We Use Your Information
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                We use the information we collect to:
              </p>
              <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4 space-y-2`}>
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, and events</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                3. Information Sharing and Disclosure
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                We may share your information in the following circumstances:
              </p>
              <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4 space-y-2`}>
                <li>With your consent or at your direction</li>
                <li>With service providers who perform services on our behalf</li>
                <li>In connection with a merger, sale, or other business transaction</li>
                <li>To comply with legal obligations or protect our rights</li>
                <li>To prevent fraud or other illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                4. Data Security
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                5. Your Rights and Choices
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4 space-y-2`}>
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                6. Cookies and Tracking Technologies
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                We use cookies and similar tracking technologies to collect and use personal information about you. You can control cookies through your browser settings, but disabling cookies may affect the functionality of our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                7. Third-Party Services
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                8. Children&apos;s Privacy
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                9. Changes to This Privacy Policy
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. Your continued use of the Services after such changes constitutes your acceptance of the new Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                10. Contact Us
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                If you have any questions about this Privacy Policy, please contact us at privacy@sizland.tech
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPage;