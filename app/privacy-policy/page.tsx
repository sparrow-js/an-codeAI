import './markdown.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how needware protects your privacy and handles your data. Our commitment to transparency and data security.',
  robots: {
    index: true,
    follow: false,
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl markdown">
      <section className="container mx-auto dark:text-white">
        <h1>Privacy Policy</h1>
        <p className="text-sm">Last Updated: March 18, 2025</p>

        <h2>Introduction</h2>
        <p>
          This privacy policy explains how needware Labs Incorporated ("needware," "we," or "us") collects, uses, and protects your information when you use our website (needware.dev) and services. This policy applies to all users of our platform and services and should be read in conjunction with our Terms of service ("Terms"), which contain additional important information about how we handle your data and content.
        </p>

        <h2>Data Collection and Use</h2>
        <h3>Information We Collect</h3>
        <h4>Account Information</h4>
        <ul>
          <li>Email address</li>
          <li>Name</li>
          <li>Payment information for paid plans</li>
          <li>Account preferences and settings</li>
        </ul>
        <p>
          For detailed information about account management and your responsibilities regarding account information, please see the "User accounts and content" section of our Terms.
        </p>

        <h4>Service Usage Data</h4>
        <ul>
          <li>Generated code and prompts</li>
          <li>Platform interaction data</li>
          <li>Feature usage statistics</li>
          <li>Error logs and debugging information</li>
        </ul>
        <p>
          The ownership and usage rights of generated code and content are detailed in the "Intellectual property rights" section of our Terms.
        </p>

        <h4>Automatically Collected Information</h4>
        <ul>
          <li>IP addresses</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Operating system</li>
          <li>Access times and dates</li>
          <li>Pages visited</li>
        </ul>

        <h3>Analytics and Tracking</h3>
        <p>We use the following analytics and tracking tools:</p>
        <ul>
          <li>
            <strong>PostHog</strong>
            <ul>
              <li>We use PostHog for product analytics and user behavior tracking</li>
              <li>For details about PostHog's data handling, please see their Privacy policy</li>
            </ul>
          </li>
          <li>
            <strong>Google Analytics and related services</strong>
            <ul>
              <li>We use Google Analytics to understand website traffic and usage</li>
              <li>You can opt out using Google Analytics Opt-out Browser Add-on</li>
              <li>For more information, visit Google's Privacy & Terms</li>
            </ul>
          </li>
        </ul>

        <h2>Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar tracking technologies to:</p>
        <ul>
          <li>Maintain your session</li>
          <li>Remember your preferences</li>
          <li>Analyze platform usage</li>
          <li>Improve our services</li>
        </ul>
        <p>You can control cookie preferences through your browser settings.</p>

        <h2>How We Use Your Information</h2>
        <p>
          We use collected information as detailed in our Terms of service (see "Data usage, training, and learning" and "Service improvements and training" sections) for the following purposes:
        </p>
        <ul>
          <li>
            <strong>Provide and improve our services, including:</strong>
            <ul>
              <li>Platform functionality improvements</li>
              <li>AI model training (except for Enterprise plan users)</li>
              <li>Service quality enhancements</li>
            </ul>
          </li>
          <li>
            <strong>Support and operations:</strong>
            <ul>
              <li>Provide customer support</li>
              <li>Process payments</li>
              <li>Send service updates</li>
            </ul>
          </li>
          <li>
            <strong>Security and maintenance:</strong>
            <ul>
              <li>Maintain platform security</li>
              <li>Analyze usage patterns</li>
              <li>Debug technical issues</li>
              <li>Prevent abuse and fraud</li>
            </ul>
          </li>
        </ul>

        <p>
          For complete details about our data usage practices, training procedures, and especially Enterprise plan exceptions, please refer to the "Data usage, training, and learning" section in our Terms of service at needware.dev/terms.
        </p>

        <h2>Data Sharing and Processing</h2>
        <h3>Third-party Service Providers</h3>
        <p>We share data with trusted service providers as outlined in our Terms. For specific information about:</p>
        <ul>
          <li>Data processing practices</li>
          <li>Enterprise plan protections</li>
          <li>Service provider requirements</li>
          <li>Custom handling agreements</li>
        </ul>
        <p>Please see the "Data usage and learning" section of our Terms.</p>

        <h3>Enterprise Plan Users</h3>
        <p>Enterprise users enjoy additional data protection and privacy rights. For complete details about:</p>
        <ul>
          <li>Data training restrictions</li>
          <li>Custom agreements</li>
          <li>Third-party sharing limitations</li>
        </ul>
        <p>Please refer to the "Enterprise plan exceptions" section in our Terms.</p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request data correction</li>
          <li>Request data deletion</li>
          <li>Export your data</li>
          <li>Opt out of certain processing</li>
          <li>Withdraw consent</li>
        </ul>
        <p>Contact needwareofficial@gmail.com to exercise these rights.</p>

        <h2>Security Measures</h2>
        <p>We implement industry-standard security measures:</p>
        <ul>
          <li>Encrypted data transmission</li>
          <li>Secure data storage</li>
          <li>Access controls</li>
          <li>Regular security audits</li>
          <li>Employee training</li>
        </ul>

        <h2>Service Improvements and AI Training</h2>
        <p>
          As detailed in the "Data usage, training, and learning" section of our Terms, we may use certain data to improve our services and train our AI systems. Important exceptions and limitations apply, particularly for Enterprise users.
        </p>
        <p>Please refer to our Terms for complete information about:</p>
        <ul>
          <li>Types of data used for training</li>
          <li>Enterprise plan exceptions</li>
          <li>Data handling practices</li>
          <li>Your rights regarding data usage</li>
        </ul>

        <h2>Data Protection and Security</h2>
        <p>
          Our security measures and data protection practices complement the warranty disclaimers and liability limitations detailed in our Terms. For specific information about:
        </p>
        <ul>
          <li>Platform security</li>
          <li>Data handling</li>
          <li>Risk allocation</li>
          <li>Liability limitations</li>
        </ul>
        <p>Please see the "Disclaimer of warranties" and "Limitation of liability" sections in our Terms.</p>

        <h2>User Content Visibility</h2>
        <p>
          The content and code you generate using our services, including prompts and project files, are private and only accessible to you and needware's authorized employees, contractors, and partners as necessary to provide support and maintain platform functionality.
        </p>
        <p>
          If your project is set to "public," then the prompts and code can be visible to other users. Your public project can also be remixed and used as a starting point for other projects. Private projects are not remixable, and their code and prompts are not visible to other users.
        </p>
        <p>
          Other users cannot view your private content and projects unless you choose to make them publicly available through our platform's sharing and collaboration features.
        </p>

        <h2>Liability Protections</h2>
        <p>
          Our platform includes technical measures to protect the privacy and security of user content. However, we cannot be held liable for any issues that may arise from users deliberately circumventing our platform limitations or protections to access private content.
        </p>
        <p>
          Users are responsible for maintaining the confidentiality of their account information and for any activities that occur under their account, whether or not authorized by the user. We disclaim all liability for any damages, loss of profits, or other harm resulting from unauthorized access to user content.
        </p>
        <p>
          Our warranty disclaimers and liability limitations, as detailed in our Terms of Service, apply to all aspects of our platform and services, including the security and privacy of user data.
        </p>

        <h2>Children's Privacy</h2>
        <p>Our services are not intended for users under 18. We do not knowingly collect data from children.</p>

        <h2>International Data Transfers</h2>
        <p>
          We may transfer data internationally within our service provider network. We ensure appropriate safeguards are in place for these transfers.
        </p>

        <h2>Legal Framework</h2>
        <p>
          This privacy policy is part of and subject to our Terms. In case of any conflict between this privacy policy and our Terms, the Terms shall prevail.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy periodically. Changes will be handled in accordance with the process outlined in our Terms regarding policy updates.
        </p>

        <h2>Contact Details</h2>
        <h3>General Contact Information</h3>
        <p>
          Company name: needware Labs Incorporated<br />
          Website: https://needware.dev
        </p>

        <h3>Contact Us For</h3>
        <ul>
          <li>Privacy questions: needwareofficial@gmail.com</li>
          <li>Support (Enterprise & Scale plans): needwareofficial@gmail.com</li>
          <li>DMCA and legal issues: needwareofficial@gmail.com</li>
          <li>General feedback: needwareofficial@gmail.com</li>
          <li>Job applications: needwareofficial@gmail.com</li>
        </ul>

        <h3>Response Times</h3>
        <ul>
          <li>We aim to respond to privacy-related inquiries within 7 business days</li>
          <li>Support requests are handled according to your plan's service level agreement (see Terms of service for details)</li>
          <li>For urgent matters related to data protection or security incidents, please mark your email as "URGENT - Privacy concern"</li>
        </ul>

        <h2>Additional Resources</h2>
        <ul>
          <li>Terms of service: https://needware.dev/terms</li>
        </ul>

        <p>
          For the fastest response, please use the appropriate email address for your inquiry and include relevant account information when contacting us.
        </p>

        <p className="mt-8 text-sm">Last updated: March 18, 2025</p>
      </section>
    </main>
  );
}
