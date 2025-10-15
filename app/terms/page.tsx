import './markdown.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read needware\'s Terms of Service. Understand your rights and responsibilities when using our AI-powered software development platform.',
  robots: {
    index: true,
    follow: false,
  },
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl markdown">
      <section className="container mx-auto dark:text-white">
        <h1>Terms of Service</h1>
        <p>Last Updated: March 18, 2025</p>

        <h2>Introduction</h2>
        <p>
          These terms constitute a legal agreement between you and needware Labs
          Incorporated ("needware," "we," or "us"). Your use of needware.dev (the
          "Site") and the services made available on the Site ("Services") is
          subject to these Terms of Service (these "Terms"). By using the Site and
          any of our Services, you:
        </p>
        <ul>
          <li>Acknowledge that you have read and understood these Terms</li>
          <li>Agree to be bound by these Terms</li>
          <li>Agree to our Privacy Policy (needware.dev/privacy-policy)</li>
          <li>Commit to comply with all applicable laws and regulations</li>
        </ul>

        <h2>License to use our services</h2>
        <p>
          Subject to these Terms, we grant you a limited, personal, non-exclusive,
          non-transferable license to use our Services. This license includes the
          right to use our Services for both personal and commercial purposes,
          subject to your subscription plan and these Terms.
        </p>

        <h2>Intellectual property rights</h2>
        <h3>Our rights</h3>
        <p>needware Labs Incorporated owns and retains all rights, title, and interest in and to:</p>
        
        <h4>Brand elements</h4>
        <ul>
          <li>The "needware" name and brand</li>
          <li>The "needware.dev" domain name and all related domains and variants</li>
          <li>The "GPT Engineer" trademark and brand and variants</li>
          <li>All needware logos, designs, and visual elements</li>
          <li>All marketing materials and website content</li>
        </ul>

        <h4>Platform elements</h4>
        <ul>
          <li>The Site architecture and design</li>
          <li>All platform features and functionalities</li>
          <li>Our proprietary algorithms and systems</li>
          <li>The user interface and experience design</li>
          <li>All documentation and supporting materials</li>
        </ul>

        <h4>Website content</h4>
        <ul>
          <li>All text, graphics, and media on needware.dev</li>
          <li>Blog posts, documentation, and guides</li>
          <li>Marketing materials and promotional content</li>
          <li>Interface elements and design components</li>
        </ul>

        <p>
          These elements are protected by copyright, trademark, trade dress, patent
          laws, and other intellectual property rights.
        </p>

        <h3>Clear distinction of rights</h3>
        <p>
          To be explicitly clear, while needware owns all rights to the platform
          and brand elements described above, this ownership is entirely separate
          from and does not extend to:
        </p>
        <ul>
          <li>User-generated content</li>
          <li>Code generated using our platform</li>
          <li>Applications built with our tools</li>
          <li>Custom configurations and implementations</li>
          <li>Modified or derivative works created from generated code</li>
          <li>
            Your own code commits and changes made outside of needware but
            committed or visible in any way
          </li>
        </ul>

        <h3>User rights</h3>
        <p>needware makes no claim to ownership of:</p>
        <ul>
          <li>All code generated using our Services</li>
          <li>Applications and solutions built using our platform</li>
          <li>Custom implementations and modifications</li>
          <li>Derivative works based on generated code</li>
          <li>Your business logic and application structure</li>
        </ul>

        <h4>Usage rights</h4>
        <p>You may freely:</p>
        <ul>
          <li>Use generated code commercially</li>
          <li>Modify and adapt generated code</li>
          <li>Distribute generated code in any form</li>
          <li>Sell applications built using our platform</li>
          <li>Open source your implementations</li>
        </ul>

        <p>To be explicitly clear:</p>
        <ul>
          <li>needware places no restrictions on your use of generated code</li>
          <li>
            You are free to use, modify, and distribute generated code without
            attribution requirements
          </li>
          <li>
            No licenses or royalties are owed by needware users to needware for
            using generated code
          </li>
          <li>Your implementations and modifications are yours to control</li>
          <li>
            You can combine generated code with other sources without needing
            approval from needware
          </li>
        </ul>

        <h2>Data usage, training, and learning</h2>
        <p>
          We collect and process data from your use of the Services to improve our
          platform, provide support, and enhance user experience. While our Privacy
          policy contains detailed information about data collection and
          processing, this section outlines how we use your data within our
          Services.
        </p>

        <h3>Service improvement and training</h3>
        <p>
          Your use of our platform contributes to its continuous improvement. We
          analyze generated code, prompts, and usage patterns to enhance our AI
          systems and improve code generation accuracy. This analysis helps us
          understand how developers interact with our platform, enabling us to
          optimize performance and reliability while identifying areas for
          enhancement.
        </p>

        <p>We specifically use this data to:</p>
        <ul>
          <li>
            Train and refine our AI systems, improving their ability to understand
            developer requirements and generate appropriate code
          </li>
          <li>
            Enhance the quality and accuracy of code generation through pattern
            analysis and learning
          </li>
          <li>Optimize platform performance based on real-world usage patterns</li>
          <li>Identify and resolve technical issues through systematic analysis</li>
          <li>
            Develop new features and capabilities based on user needs and behavior
          </li>
        </ul>

        <h3>Support and operational uses</h3>
        <p>
          We utilize collected data to provide comprehensive support and maintain
          optimal platform operations. This includes monitoring system performance,
          analyzing error patterns, and generating internal reports that help us
          maintain and improve service quality. Our support team uses this
          information to:
        </p>
        <ul>
          <li>
            Provide more effective technical assistance by understanding common
            issues and usage patterns
          </li>
          <li>Monitor and maintain platform stability and performance</li>
          <li>
            Generate insights that help improve our documentation and user guides
          </li>
          <li>Create aggregate usage statistics for service optimization</li>
          <li>Develop internal analytics that guide platform improvements</li>
        </ul>

        <h3>Enterprise plan considerations</h3>
        <p>Enterprise customers receive enhanced data protection and control. For these users:</p>
        <ul>
          <li>We explicitly waive our right to use their data for training purposes</li>
          <li>Custom data handling agreements are available</li>
          <li>No sharing with third parties occurs without explicit consent</li>
        </ul>

        <h3>Data retention and management</h3>
        <p>We maintain clear policies regarding data retention and management:</p>
        <ul>
          <li>
            Data is retained only as long as necessary for the purposes described
            above
          </li>
          <li>
            You may request data deletion subject to our retention policies and
            technical feasibility
          </li>
          <li>Some data may be retained for compliance purposes</li>
        </ul>

        <h3>Our commitment to responsible data usage</h3>
        <p>
          We are committed to responsible data usage practices that balance
          platform improvement with user privacy and trust. This includes:
        </p>
        <ul>
          <li>Implementing strict data access controls</li>
          <li>Regular security audits and compliance checks</li>
          <li>Employee training on data handling</li>
          <li>Transparent data usage practices</li>
          <li>Regular policy reviews and updates</li>
        </ul>

        <p>
          For complete details about data collection, processing, and your privacy
          rights, please refer to our Privacy policy at needware.dev/privacy-policy.
        </p>

        <h2>User accounts and content</h2>
        <h3>Account creation and management</h3>
        <ul>
          <li>You may create an account to use our Services</li>
          <li>You are responsible for maintaining account security</li>
          <li>Currently, account deletion must be requested via support</li>
          <li>We reserve the right to terminate accounts that violate these Terms</li>
        </ul>

        <h3>User content</h3>
        <p>You may upload content including but not limited to:</p>
        <ul>
          <li>Code</li>
          <li>Images</li>
          <li>Videos</li>
          <li>Fonts</li>
          <li>Other digital assets</li>
        </ul>

        <p>You represent that:</p>
        <ul>
          <li>You have all necessary rights to upload such content</li>
          <li>Your content does not violate any laws or third-party rights</li>
          <li>You are solely responsible for your content and its use</li>
        </ul>

        <h2>Services and pricing</h2>
        <h3>Plans and limits</h3>
        <ul>
          <li>Free plan: 5 free trials</li>
          <li>Paid plans: As described at https://needware.dev/pricing</li>
          <li>Message limits reset at the start of each month</li>
          <li>We reserve the right to modify plans and pricing at any time</li>
        </ul>

        <h3>Support services</h3>
        <ul>
          <li>Available only to Scale and Enterprise plan subscribers</li>
          <li>Contact via needwareofficial@gmail.com</li>
          <li>Limited to platform-related issues</li>
          <li>Does not include application debugging services</li>
          <li>Subject to our capacity and availability</li>
        </ul>

        <h2>Subscription / Payment terms</h2>
        <ul>
          <li>Our service is subscription-based with recurring monthly billing</li>
          <li>Subscriptions automatically renew at the end of each billing period</li>
          <li>No annual billing options currently available</li>
        </ul>

        <h2>Fulfillment and Service Policies</h2>
        <h3>Service Delivery</h3>
        <ul>
          <li>
            Access to our platform is granted immediately upon successful payment
            processing
          </li>
          <li>You will receive login credentials via email</li>
          <li>
            If you experience any issues with access, contact needwareofficial@gmail.com
          </li>
        </ul>

        <h3>Refund Policy</h3>
        <ul>
          <li>
            All payments are non-refundable unless otherwise determined by us
          </li>
          <li>
            In cases where refunds are approved, they will be processed to the
            original payment method
          </li>
          <li>Refunds may be considered in cases of:</li>
          <ul>
            <li>Billing errors</li>
            <li>Duplicate charges</li>
            <li>Other circumstances at our sole discretion</li>
          </ul>
        </ul>

        <h3>Cancellation Policy</h3>
        <h4>How to Cancel</h4>
        <p>You can cancel your subscription at any time by:</p>
        <ul>
          <li>Navigating to your Profile</li>
          <li>Selecting Plans & Billing</li>
          <li>Clicking Manage Subscription</li>
          <li>Selecting Cancel</li>
        </ul>

        <h4>Cancellation Terms</h4>
        <ul>
          <li>
            Your subscription remains active until the end of the current billing
            period
          </li>
          <li>
            You will continue to have full access until the end of your paid
            period
          </li>
          <li>Your subscription will not automatically renew after cancellation</li>
          <li>Any unused message credits expire at the end of the subscription</li>
          <li>
            No partial refunds are provided for unused portions of the billing
            period
          </li>
        </ul>

        <h3>Digital Service Notice</h3>
        <ul>
          <li>
            As a digital service providing access to our AI software engineering
            platform, traditional return policies do not apply
          </li>
          <li>All sales are final unless otherwise specified in these terms</li>
        </ul>

        <h2>DMCA compliance</h2>
        <p>
          We respect intellectual property rights and comply with the Digital
          Millennium Copyright Act (DMCA). For any DMCA-related issues, contact us
          at needwareofficial@gmail.com with:
        </p>
        <ul>
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Identification of the allegedly infringing material</li>
          <li>Your contact information</li>
          <li>A statement of good faith belief in the infringement</li>
          <li>A statement of accuracy under penalty of perjury</li>
        </ul>

        <h2>Prohibited uses</h2>
        <p>You explicitly agree not to:</p>
        <ul>
          <li>Reverse engineer the Services</li>
          <li>Use automated tools or bots without permission</li>
          <li>Attempt to access unauthorized areas of the Services</li>
          <li>Use the Services for illegal activities</li>
          <li>Create multiple free accounts to circumvent limits</li>
          <li>Use the Services in a way that could harm other users</li>
          <li>Upload malicious code or content</li>
          <li>Attempt to overwhelm or crash our systems</li>
        </ul>
        <p>
          needware may never be used to develop anything subjected to sanctions or
          other export restrictions, or are in any other way not compliant with
          the laws of the jurisdiction that needware or the user operates in.
          needware may also never be used by in regions, or by anyone subject to
          sanctions or export restrictions.
        </p>

        <h2>Promotions and feedback</h2>
        <h3>Promotions</h3>
        <p>
          We may offer promotions, contests, or sweepstakes, which may have
          additional terms and conditions.
        </p>

        <h3>User feedback</h3>
        <ul>
          <li>We welcome feedback and suggestions</li>
          <li>We may implement any feedback without compensation</li>
          <li>
            Providing feedback grants us a perpetual, worldwide license to use it
          </li>
          <li>No credit or compensation is due for implemented suggestions</li>
        </ul>

        <h2>Disclaimer of warranties</h2>
        <p className="uppercase">
          YOUR USE OF THE SITE, SERVICES AND ALL needware CONTENT IS ENTIRELY AT
          YOUR OWN RISK. THE PLATFORM, SERVICES, AND ALL CONTENT ARE PROVIDED "AS
          IS" AND "AS AVAILABLE" WITHOUT ANY GUARANTEES. TO THE FULLEST EXTENT
          PERMITTED BY LAW, needware AND OUR SUPPLIERS AND LICENSORS EXPLICITLY
          DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
          LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE MAKE NO GUARANTEES
          REGARDING THE ACCURACY, RELIABILITY, OR USEFULNESS OF THE PLATFORM,
          SERVICES, OR ANY needware CONTENT, AND YOUR USE OF THESE IS ENTIRELY AT
          YOUR OWN RISK. ANY MATERIALS OR CODE YOU DOWNLOAD OR ACCESS THROUGH OUR
          PLATFORM OR SERVICES IS OBTAINED AT YOUR OWN DISCRETION AND RISK, AND
          YOU WILL BE SOLELY RESPONSIBLE FOR ANY SYSTEM DAMAGE OR DATA LOSS THAT
          MAY RESULT. NO ORAL OR WRITTEN INFORMATION OR ADVICE PROVIDED BY US OR
          THROUGH OUR PLATFORM OR SERVICES SHALL CREATE ANY WARRANTY NOT EXPRESSLY
          STATED IN THIS AGREEMENT. CERTAIN JURISDICTIONS MAY PROHIBIT SUCH
          WARRANTY DISCLAIMERS, SO SOME OR ALL OF THESE LIMITATIONS MAY NOT APPLY
          TO YOU.
        </p>

        <h2>Limitation of liability</h2>
        <p className="uppercase">
          needware, ALONG WITH ITS AFFILIATES, AGENTS, OFFICERS, EMPLOYEES,
          SUPPLIERS AND LICENSORS, SHALL NOT BE LIABLE FOR ANY DAMAGES, WHETHER
          DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY,
          INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOST PROFITS, GOODWILL, DATA,
          USE, OR OTHER INTANGIBLE LOSSES (EVEN IF ADVISED OF SUCH POSSIBILITY),
          ARISING FROM YOUR USE OF OR INABILITY TO USE OUR PLATFORM, SERVICES, OR
          needware CONTENT. UNDER NO CIRCUMSTANCES WILL needware BE HELD
          RESPONSIBLE FOR ANY DAMAGES OR LOSSES RESULTING FROM UNAUTHORIZED
          ACCESS, SECURITY BREACHES, OR INTERFERENCE WITH OUR PLATFORM, SERVICES,
          OR YOUR ACCOUNT.
        </p>

        <p className="uppercase">
          TO THE MAXIMUM EXTENT ALLOWED BY LAW, needware ACCEPTS NO LIABILITY OR
          RESPONSIBILITY FOR:
        </p>

        <ul className="uppercase">
          <li>Content errors, inaccuracies, or omissions in any form</li>
          <li>
            Personal injury or property damage resulting from your use of our
            platform or services
          </li>
          <li>Unauthorized access to our servers or your personal information</li>
          <li>
            Service interruptions, transmission failures, or platform
            unavailability
          </li>
          <li>
            Malicious software or code that may be transmitted through our
            platform
          </li>
          <li>
            Any errors, losses, or damages arising from the use of our content or
            services
          </li>
        </ul>

        <p className="uppercase">AI-generated code that:</p>
        <ul className="uppercase">
          <li>Contains bugs, errors, or security vulnerabilities</li>
          <li>Fails to meet your specific requirements or expectations</li>
          <li>Does not achieve your intended business or technical goals</li>
          <li>Becomes obsolete or incompatible with other systems</li>
          <li>Causes issues when integrated with other software</li>
          <li>Results in any form of data loss or corruption</li>
        </ul>

        <p className="uppercase">AI system limitations or failures, including:</p>
        <ul className="uppercase">
          <li>Incorrect or incomplete code generation</li>
          <li>Misunderstanding of your requirements or prompts</li>
          <li>Generation of non-optimal or inefficient solutions</li>
          <li>Inconsistencies in code output quality</li>
          <li>Failures to follow best practices or coding standards</li>
        </ul>

        <p className="uppercase">Platform-related issues such as:</p>
        <ul className="uppercase">
          <li>Temporary or permanent service unavailability</li>
          <li>Slow response times or performance degradation</li>
          <li>Loss of saved projects or conversation history</li>
          <li>Interface bugs or usability issues</li>
          <li>API failures or inconsistencies</li>
          <li>Authentication or authorization problems</li>
        </ul>

        <p className="uppercase">Business impact resulting from:</p>
        <ul className="uppercase">
          <li>Reliance on generated code in production systems</li>
          <li>Time or resources spent modifying generated code</li>
          <li>Project delays or missed deadlines</li>
          <li>Additional development costs or technical debt</li>
          <li>Integration challenges with existing systems</li>
          <li>Customer or user dissatisfaction</li>
        </ul>

        <p className="uppercase">Third-party related issues:</p>
        <ul className="uppercase">
          <li>Compatibility problems with external services</li>
          <li>Licensing issues in generated code</li>
          <li>Security vulnerabilities in recommended dependencies</li>
          <li>Changes in external APIs or services</li>
          <li>Conflicts with other development tools</li>
        </ul>

        <p className="uppercase">Data-related concerns:</p>
        <ul className="uppercase">
          <li>Loss of prompt history or generated code</li>
          <li>Unintended data exposure in generated code</li>
          <li>Training data biases affecting code generation</li>
          <li>Incorrect handling of sensitive information</li>
          <li>Data privacy or compliance issues</li>
        </ul>

        <p className="uppercase">
          THIS LIST IS NOT EXHAUSTIVE, AND needware'S LIMITATION OF LIABILITY
          EXTENDS TO ALL POSSIBLE ISSUES, WHETHER LISTED HERE OR NOT, ARISING FROM
          THE USE OF OUR AI-POWERED PLATFORM AND SERVICES.
        </p>

        <p className="uppercase">
          IN NO EVENT SHALL OUR TOTAL LIABILITY AND THAT OF OUR SUPPLIERS AND
          LICENSORS, ARISING FROM OR RELATING TO YOUR USE OF THE PLATFORM,
          SERVICES, AND needware CONTENT (INCLUDING WARRANTY CLAIMS), REGARDLESS OF
          THE TYPE OF CLAIM OR LEGAL THEORY, EXCEED THE AMOUNT YOU HAVE PAID TO
          US FOR THE SERVICES IN THE TWELVE MONTHS PRECEDING THE CLAIM. IF YOU
          RESIDE IN CALIFORNIA, YOU WAIVE CALIFORNIA CIVIL CODE §1542, WHICH
          STATES: A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS THE CREDITOR OR
          RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR
          AT THE TIME OF EXECUTING THE RELEASE. SOME JURISDICTIONS DO NOT PERMIT
          LIABILITY LIMITATIONS FOR CERTAIN DAMAGES, SO THESE LIMITATIONS MAY NOT
          FULLY APPLY TO YOU.
        </p>

        <h2>Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless needware, including
          our officers, directors, employees, agents, licensors, affiliates, and
          representatives, from and against any claims, liabilities, damages,
          judgments, awards, losses, costs, or expenses (including reasonable
          legal fees) arising from:
        </p>
        <ul>
          <li>Your use of our platform and services</li>
          <li>Breach of these Terms</li>
          <li>Infringement of third-party rights</li>
          <li>Applications, websites, or services you create using our platform</li>
          <li>Any content you submit or share through our services</li>
        </ul>

        <h2>Legal notices and governing law</h2>
        <p>
          Our platform and services operate from our offices in Delaware, United
          States. We make no claims about the appropriateness or availability of
          the services for use in other locations. Users accessing our platform
          from other jurisdictions do so voluntarily and must comply with all
          applicable local and United States laws, including export and import
          regulations. Access is prohibited from United States embargoed countries
          or by denied or restricted parties under U.S. law.
        </p>

        <p>
          These Terms shall be governed by Delaware law, excluding conflicts of
          law principles. Any disputes related to these Terms or your use of our
          platform must be brought exclusively in the courts of Delaware, and you
          consent to the personal jurisdiction of these courts. Our failure to
          exercise any right or provision of these Terms doesn't constitute a
          waiver unless we acknowledge it in writing. If any provision of these
          Terms is found invalid or unenforceable, the remaining provisions will
          continue in full effect.
        </p>

        <h2>Contact information</h2>
        <p>For any questions regarding these Terms, contact us at:</p>
        <p>Email: needwareofficial@gmail.com</p>
      </section>
    </main>
  );
}
