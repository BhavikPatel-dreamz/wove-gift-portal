import React from "react";

const PiaManual = () => {
  return (
    <div className="max-w-360 m-auto pt-18.75">
      <div className="rounded-lg p-8">
        <div className="text-[30px] font-semibold text-[#1A1A1A] mb-1">
          MY PERKS (PTY) LTD (Trading as WoveGifts)
        </div>
        <p className="text-base font-medium text-[#4A4A4A] mb-1">
          Registration Number: 2019 / 054677 / 07
        </p>
        <p className="text-base font-medium text-[#4A4A4A] mb-1">Registered Address:</p>
        <p className="text-base font-medium text-[#4A4A4A] mb-1">8 Vineyard Road</p>
        <p className="text-base font-medium text-[#4A4A4A] mb-1">Claremont</p>
        <p className="text-base font-medium text-[#4A4A4A] mb-1">Cape Town</p>
        <p className="text-base font-medium text-[#4A4A4A] mb-4">South Africa</p>

        <p className="text-base font-medium text-[#4A4A4A] mb-1">
          Website: www.wovegifts.com
        </p>
        <p className="text-base font-medium text-[#4A4A4A] mb-4">
          Email: hello@wovegifts.com
        </p>

        <p className="text-base font-medium text-[#4A4A4A] mb-1">Document Version: 1.0</p>
        <p className="text-base font-medium text-[#4A4A4A] mb-1">
          Last Updated: 20 February 2026
        </p>
        <p className="text-base font-medium text-[#4A4A4A] mb-8">
          Approved By: Directors
        </p>

        <div className="space-y-8 text-[#4A4A4A]">
          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              1. PURPOSE OF THIS MANUAL
            </h2>
            <p className="text-base font-medium mb-3">
              This Manual is compiled in terms of Section 51 of the Promotion of
              Access to Information Act ("PAIA").
            </p>
            <p className="text-base font-medium mb-2">It serves to:</p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>
                Describe the records held by My Perks (Pty) Ltd trading as WoveGifts
              </li>
              <li>Outline the procedure for requesting access to such records</li>
              <li>Confirm compliance with PAIA and POPIA</li>
              <li>Describe the Company's data governance framework</li>
              <li>Support enterprise-level regulatory and procurement compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              2. COMPANY OVERVIEW
            </h2>
            <p className="text-base font-medium mb-3">
              My Perks (Pty) Ltd, trading as WoveGifts, is a South African digital
              gifting and voucher distribution platform that:
            </p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Issues digital gift cards and voucher codes</li>
              <li>Facilitates redemption with participating merchants</li>
              <li>Integrates via API with banks, telcos, and corporate clients</li>
              <li>Administers enterprise reward programmes</li>
              <li>Holds stored value instruments for settlement with merchants</li>
            </ul>
            <p className="text-base font-medium">
              The Company operates under formal governance and security controls
              aligned with internationally recognised information security standards.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              3. LEGAL FRAMEWORK
            </h2>
            <p className="text-base font-medium mb-2">
              This Manual is compiled in compliance with:
            </p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>The Constitution of the Republic of South Africa</li>
              <li>Promotion of Access to Information Act (PAIA)</li>
              <li>Protection of Personal Information Act (POPIA)</li>
              <li>Electronic Communications and Transactions Act (ECTA)</li>
              <li>Consumer Protection Act (CPA)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              4. INFORMATION OFFICER
            </h2>
            <p className="text-base font-medium mb-3">In accordance with POPIA:</p>
            <p className="text-base font-medium mb-1">Information Officer: Dylan Des Fountain</p>
            <p className="text-base font-medium mb-1">Designation: CEO</p>
            <p className="text-base font-medium mb-1">Email: hello@wovegifts.com</p>
            <p className="text-base font-medium mb-3">
              Registered Address: 8 Vineyard Road, Claremont, Cape Town
            </p>
            <p className="text-base font-medium mb-2">
              The Information Officer is responsible for:
            </p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>PAIA compliance</li>
              <li>POPIA compliance</li>
              <li>Data breach reporting</li>
              <li>Responding to access requests</li>
              <li>Liaising with the Information Regulator</li>
              <li>Ensuring internal governance alignment</li>
            </ul>
            <p className="text-base font-medium">
              The Information Officer is registered with the Information Regulator.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              5. RESPONSIBLE PARTY VS OPERATOR
            </h2>
            <p className="text-base font-medium mb-3">WoveGifts operates in dual capacity:</p>
            <p className="text-base font-semibold mb-2">5.1 As Responsible Party</p>
            <p className="text-base font-medium mb-2">Where:</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Customers purchase directly via the website</li>
              <li>Users create accounts</li>
              <li>Marketing communications are issued</li>
            </ul>
            <p className="text-base font-semibold mb-2">5.2 As Operator</p>
            <p className="text-base font-medium mb-2">Where:</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Voucher Codes are issued on behalf of corporate clients</li>
              <li>API integrations are used by banks or telcos</li>
              <li>Employee incentive programmes are administered</li>
            </ul>
            <p className="text-base font-medium">
              In Operator capacity, WoveGifts processes personal information strictly
              in accordance with contractual Data Processing Agreements.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              6. RECORDS HELD BY THE COMPANY
            </h2>
            <p className="text-base font-medium mb-3">
              The Company maintains records in the following structured categories:
            </p>

            <p className="text-base font-semibold mb-2">6.1 Corporate Governance Records</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Memorandum of Incorporation</li>
              <li>Shareholder agreements</li>
              <li>Board resolutions</li>
              <li>Corporate governance policies</li>
              <li>Risk management frameworks</li>
              <li>Compliance registers</li>
              <li>Insurance documentation</li>
            </ul>

            <p className="text-base font-semibold mb-2">6.2 Financial Records</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Annual Financial Statements</li>
              <li>General ledgers</li>
              <li>VAT records</li>
              <li>Income tax submissions</li>
              <li>Settlement schedules with merchants</li>
              <li>Float management reconciliations</li>
              <li>Payment processor reports</li>
              <li>Audit reports</li>
            </ul>

            <p className="text-base font-semibold mb-2">6.3 Client & Merchant Records</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Merchant agreements</li>
              <li>Corporate client contracts</li>
              <li>Service Level Agreements (SLAs)</li>
              <li>API integration agreements</li>
              <li>Data Processing Agreements (DPAs)</li>
              <li>Non-disclosure agreements</li>
              <li>Onboarding due diligence documentation</li>
            </ul>

            <p className="text-base font-semibold mb-2">
              6.4 Operational & Platform Records
            </p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Gift Card issuance records</li>
              <li>Voucher Code generation logs</li>
              <li>Redemption transaction logs</li>
              <li>Fraud monitoring records</li>
              <li>Campaign performance reports</li>
              <li>Customer communication records</li>
            </ul>

            <p className="text-base font-semibold mb-2">6.5 Human Resources Records</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Employment contracts</li>
              <li>Payroll records</li>
              <li>Performance records</li>
              <li>Disciplinary documentation</li>
              <li>Contractor agreements</li>
            </ul>

            <p className="text-base font-semibold mb-2">6.6 Information Security Records</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Access control logs</li>
              <li>Audit logs</li>
              <li>Security incident reports</li>
              <li>Risk assessments</li>
              <li>Vulnerability assessments</li>
              <li>Disaster recovery plans</li>
              <li>Business continuity plans</li>
            </ul>

            <p className="text-base font-semibold mb-2">
              6.7 Information Technology & Infrastructure Records
            </p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>Hosting agreements</li>
              <li>Cloud infrastructure documentation</li>
              <li>Encryption protocols</li>
              <li>System architecture documentation</li>
              <li>API documentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              7. PROCESSING OF PERSONAL INFORMATION
            </h2>
            <p className="text-base font-medium mb-3">
              In accordance with Section 51(1)(c)(i) of PAIA (as amended by POPIA),
              the Company processes personal information in the following categories:
            </p>
            <p className="text-base font-semibold mb-2">7.1 Categories of Data Subjects</p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Customers</li>
              <li>Gift recipients</li>
              <li>Corporate employees</li>
              <li>Merchant representatives</li>
              <li>Contractors</li>
              <li>Service providers</li>
            </ul>

            <p className="text-base font-semibold mb-2">
              7.2 Categories of Personal Information
            </p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Identification information</li>
              <li>Contact details</li>
              <li>Transaction history</li>
              <li>Payment confirmation data</li>
              <li>Device & IP data</li>
              <li>Employment information (corporate programmes)</li>
              <li>Support & communication records</li>
            </ul>

            <p className="text-base font-semibold mb-2">7.3 Purpose of Processing</p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>Contract performance</li>
              <li>Voucher issuance & redemption</li>
              <li>Payment validation</li>
              <li>Fraud prevention</li>
              <li>Legal compliance</li>
              <li>Customer support</li>
              <li>Reporting to corporate clients</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              8. INFORMATION SECURITY CONTROLS
            </h2>
            <p className="text-base font-medium mb-3">
              WoveGifts implements enterprise-grade technical and organisational
              measures including:
            </p>
            <ul className="list-disc pl-8 mb-3 text-base font-medium space-y-1">
              <li>Encryption in transit (TLS/SSL)</li>
              <li>Role-based access control</li>
              <li>Multi-factor authentication</li>
              <li>Secure cloud hosting</li>
              <li>Access logging & monitoring</li>
              <li>Segregation of duties</li>
              <li>Incident response procedures</li>
              <li>Business continuity planning</li>
            </ul>
            <p className="text-base font-medium">
              The Company aligns its information security management framework with
              ISO 27001 principles.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              9. CROSS-BORDER TRANSFERS
            </h2>
            <p className="text-base font-medium mb-2">
              Where personal information is processed outside South Africa:
            </p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>Appropriate contractual safeguards are in place; or</li>
              <li>The recipient country provides adequate data protection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              10. ACCESS REQUEST PROCEDURE
            </h2>
            <p className="text-base font-medium mb-2">To request access to records:</p>
            <ol className="list-decimal pl-8 mb-3 text-base font-medium space-y-1">
              <li>
                Complete PAIA Form 2 (Request for Access to Record of Private Body).
              </li>
              <li>Submit to the Information Officer.</li>
              <li>Pay the prescribed request fee (if applicable).</li>
              <li>Await formal response within statutory timeframes.</li>
            </ol>
            <p className="text-base font-medium mb-2">
              Requests must clearly specify:
            </p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>The record requested</li>
              <li>The right being exercised or protected</li>
              <li>The form of access required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              11. GROUNDS FOR REFUSAL
            </h2>
            <p className="text-base font-medium mb-2">Access may be refused where:</p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>Disclosure would reveal trade secrets</li>
              <li>Disclosure would harm commercial interests</li>
              <li>Disclosure would compromise fraud prevention systems</li>
              <li>Disclosure would violate privacy of third parties</li>
              <li>Disclosure would breach contractual confidentiality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">12. REMEDIES</h2>
            <p className="text-base font-medium mb-2">
              If dissatisfied with the outcome of a request:
            </p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>A complaint may be lodged with the Information Regulator</li>
              <li>Legal proceedings may be instituted in a competent court</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              13. AVAILABILITY OF THE MANUAL
            </h2>
            <p className="text-base font-medium mb-2">This Manual is:</p>
            <ul className="list-disc pl-8 text-base font-medium space-y-1">
              <li>Available at the registered office</li>
              <li>Published on www.wovegifts.com</li>
              <li>Available upon written request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-3">
              14. VERSION CONTROL
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-[#DADADA] text-left text-base font-medium">
                <thead>
                  <tr className="bg-[#F8F8F8]">
                    <th className="border border-[#DADADA] px-3 py-2">Version</th>
                    <th className="border border-[#DADADA] px-3 py-2">Date</th>
                    <th className="border border-[#DADADA] px-3 py-2">Description</th>
                    <th className="border border-[#DADADA] px-3 py-2">Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#DADADA] px-3 py-2">1.0</td>
                    <td className="border border-[#DADADA] px-3 py-2">20 Feb 2026</td>
                    <td className="border border-[#DADADA] px-3 py-2">
                      Initial Enterprise Release
                    </td>
                    <td className="border border-[#DADADA] px-3 py-2">Directors</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PiaManual;
