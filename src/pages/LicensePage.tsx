import { FC } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";

const LicensePage: FC = () => {
  return (
    <>
      <Seo
        title="Service License"
        description="CRXANODE service and documentation license terms."
        canonical="/license"
        noindex
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center">CRXANODE Service License</h1>

        <div className="prose dark:prose-invert prose-lg max-w-none">
          <p>
            <strong>Version:</strong> 1.0 &nbsp;|&nbsp; <strong>Effective Date:</strong>{" "}
            October 16, 2025
          </p>
          <p>
            This license governs the use of all content, documentation, APIs, and related
            resources provided by <strong>CRXANODE</strong> through{" "}
            <a href="https://crxanode.com" target="_blank" rel="noopener noreferrer">
              crxanode.com
            </a>{" "}
            and its subdomains, including but not limited to validator guides, RPC
            endpoints, snapshots, and CDN resources.
          </p>

          <h2>1. Ownership & Copyright</h2>
          <p>
            All materials, including but not limited to text, images, code, and data
            published under the CRXANODE Service, are the property of{" "}
            <strong>CRXANODE</strong> unless otherwise stated. All rights are reserved.
          </p>

          <h2>2. Permitted Use</h2>
          <ul>
            <li>
              You may access and use CRXANODE public endpoints (RPC/API/gRPC/CDN) for
              personal, educational, and non-commercial purposes.
            </li>
            <li>
              You may share or reference our guides and documentation with proper
              attribution: <em>“Source: CRXANODE — crxanode.com”</em>.
            </li>
            <li>
              Developers may use the provided public resources in open-source or research
              projects, provided they do not modify or resell the original materials.
            </li>
          </ul>

          <h2>3. Restrictions</h2>
          <ul>
            <li>
              You may not redistribute, rebrand, or resell CRXANODE data, snapshots, or
              content without explicit written permission.
            </li>
            <li>
              You may not perform excessive or malicious automated requests (e.g., DDoS,
              scraping, stress-testing) against our infrastructure.
            </li>
            <li>
              You may not remove watermarks, copyright notices, or metadata identifying CRX
              Anode as the original source.
            </li>
          </ul>

          <h2>4. Commercial Use</h2>
          <p>
            Commercial usage (including resale, service integration, or monetization of
            CRXANODE resources) requires a separate written license. Please contact us at{" "}
            <a href="mailto:admin@crxanode.com">admin@crxanode.com</a> to discuss commercial
            partnerships.
          </p>

          <h2>5. Disclaimer</h2>
          <p>
            All services are provided <strong>“AS IS”</strong> without any warranty,
            express or implied, including but not limited to merchantability, fitness for a
            particular purpose, or non-infringement. CRXANODE is not responsible for any
            loss, downtime, or damage resulting from the use of this service.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, CRXANODE shall not be liable for any
            direct, indirect, incidental, or consequential damages arising from or in
            connection with the use of its services, including network interruptions,
            validator misconfigurations, or data corruption.
          </p>

          <h2>7. Updates</h2>
          <p>
            CRXANODE may revise this license periodically. The latest version will always
            be available at{" "}
            <a href="https://docs.crxanode.com/license" target="_blank" rel="noopener noreferrer">
              docs.crxanode.com/license
            </a>.
          </p>

          <h2>8. Jurisdiction</h2>
          <p>
            This license is governed by the laws of the Republic of Indonesia. Any disputes
            arising under this license shall be settled in the jurisdiction of the{" "}
            <strong>Bekasi District Court</strong>.
          </p>

          <h2>9. Contact</h2>
          <p>
            For license inquiries, permissions, or abuse reports, please reach out to:{" "}
            <a href="mailto:admin@crxanode.com">admin@crxanode.com</a>
          </p>

          <hr />

          <p className="text-sm opacity-80">
            © 2025 CRXANODE. All rights reserved. Unauthorized use, reproduction, or
            redistribution of any materials without explicit permission is strictly
            prohibited.
          </p>
        </div>
        <div className="text-center mt-8">
          <Link to="/" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export { LicensePage };
