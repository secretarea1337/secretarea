import { useLanguage } from '../src/contexts/LanguageContext';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const Disclaimer: React.FC = () => {
  const { t } = useLanguage();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full pt-24 pb-24 min-h-screen px-4 sm:px-6 md:px-8 font-sans bg-[#f9f9f8] dark:bg-slate-950">
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
             <Icon name="ArrowLeft" size={16} />
             {t('Back to Dashboard')}
          </Link>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="prose dark:prose-invert max-w-none"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight italic">N E X A 1337 Disclaimer</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-10">Last Updated: June 2026</p>

            <div className="space-y-8 text-slate-600 dark:text-slate-300">
              <section>
                <p>Welcome to N E X A 1337.</p>
                <p className="mt-2">By accessing and using this website, you acknowledge that you have read, understood, and agreed to the terms outlined in this disclaimer.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">General Information</h2>
                <p className="mb-2">The content available on N E X A 1337 is provided for informational, educational, archival, and discussion purposes only. The website does not claim ownership of any trademarks, logos, software, games, applications, images, names, brands, or copyrighted materials that may be referenced throughout the site.</p>
                <p>All trademarks, service marks, product names, company names, logos, and registered trademarks mentioned on this website are the property of their respective owners.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">No Ownership Claim</h2>
                <p className="mb-2">N E X A 1337 does not claim any ownership rights over third-party software, games, applications, digital products, or other copyrighted materials referenced on this website.</p>
                <p>Any references to third-party products are provided solely for identification and informational purposes.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Support Original Developers</h2>
                <p className="mb-2">We strongly encourage all users to support software developers, game studios, publishers, artists, creators, and other rights holders by purchasing legitimate copies, licenses, subscriptions, or official versions of their products whenever available.</p>
                <p>Supporting creators helps fund future development, updates, security improvements, and continued innovation.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">{t('User Responsibility')}</h2>
                <p className="mb-2">Visitors are solely responsible for their actions and for how they use any information made available through this website.</p>
                <p className="mb-2">Users must ensure that their activities comply with all applicable local, national, and international laws, regulations, license agreements, and terms of service.</p>
                <p>N E X A 1337 assumes no responsibility for misuse of information found on this website.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Third-Party Content and Links</h2>
                <p className="mb-2">This website may contain references, links, or redirects to third-party websites and services.</p>
                <p className="mb-2">N E X A 1337 does not control, monitor, verify, endorse, or guarantee the accuracy, availability, legality, security, or reliability of any third-party website, service, or content.</p>
                <p>Users access third-party resources entirely at their own risk.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">No Warranties</h2>
                <p className="mb-4">All information provided on this website is offered on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.</p>
                <p className="mb-2">N E X A 1337 makes no guarantees regarding:</p>
                <ul className="list-disc ps-5 mb-4 space-y-1">
                  <li>Accuracy of information</li>
                  <li>Availability of content</li>
                  <li>Reliability of external resources</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Security or absence of malware</li>
                  <li>Continuous operation of the website</li>
                </ul>
                <p>Users assume full responsibility for verifying any information before relying upon it.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Limitation of Liability</h2>
                <p className="mb-4">To the maximum extent permitted by applicable law, N E X A 1337 and its owners, administrators, contributors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:</p>
                <ul className="list-disc ps-5 mb-4 space-y-1">
                  <li>Use of the website</li>
                  <li>Inability to access the website</li>
                  <li>Errors or omissions in content</li>
                  <li>Third-party websites or services</li>
                  <li>Data loss</li>
                  <li>System damage</li>
                  <li>Security incidents</li>
                  <li>User actions based on information obtained from the website</li>
                </ul>
                <p>Use of this website is entirely at the user's own risk.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Copyright Concerns</h2>
                <p className="mb-2">N E X A 1337 respects intellectual property rights and expects users to do the same.</p>
                <p className="mb-2">If you are a copyright owner, authorized representative, developer, publisher, or rights holder and believe that any material referenced on this website infringes upon your intellectual property rights, you may contact us with sufficient details regarding your claim.</p>
                <p>Upon receiving a valid request, we will review the matter and take appropriate action where necessary.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Changes to This Disclaimer</h2>
                <p className="mb-2">N E X A 1337 reserves the right to modify, update, or replace this disclaimer at any time without prior notice.</p>
                <p>Users are encouraged to review this page periodically to stay informed of any changes.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Contact</h2>
                <p>For copyright concerns, legal inquiries, content removal requests, or general questions regarding this disclaimer, please contact the website administrator through the available contact channels.</p>
              </section>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Disclaimer;
