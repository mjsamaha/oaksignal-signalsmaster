import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, FileText, Lock, Scale } from "lucide-react";

export const metadata = {
  title: "Legal - Signals Master",
  description: "Terms of Reference and Privacy Policy for Signals Master.",
};

export default async function LegalPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const activeTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'terms';

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 max-w-4xl">
      <div className="space-y-6 text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Legal & Privacy
        </h1>
        <p className="text-xl text-muted-foreground">
          Transparency about how we operate and protect your data.
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="terms" className="text-lg">Terms of Reference</TabsTrigger>
          <TabsTrigger value="privacy" className="text-lg">Privacy Policy</TabsTrigger>
        </TabsList>

        {/* TERMS OF REFERENCE CONTENT */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Terms of Reference</CardTitle>
              </div>
              <CardDescription>
                Usage guidelines and codes of conduct for the Signals Master platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm md:text-base leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 1. Acceptance of Terms
                </h3>
                <p className="text-muted-foreground">
                  By accessing Signals Master, you agree to be bound by these Terms of Reference. 
                  This platform is designed primarily for the education and training of Sea Cadets. 
                  If you do not agree to these terms, please do not use the application.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 2. Code of Conduct
                </h3>
                <p className="text-muted-foreground">
                  As a user of this platform, specifically within the context of the Sea Cadet program, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Academic Honesty:</strong> Complete exams and ranked challenges without unauthorized assistance.</li>
                  <li><strong>Respectful Identity:</strong> Use appropriate names for your profile that adhere to cadet standards.</li>
                  <li><strong>Fair Play:</strong> Do not attempt to exploit bugs, use scripts, or manipulate timers in Ranked Mode.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 3. Anti-Cheat & Integrity
                </h3>
                <p className="text-muted-foreground">
                  Signals Master employs server-side validation to ensure competitive integrity. 
                  We reserve the right to disqualify any results flagged as suspicious (e.g., impossible reaction times) 
                  and may suspend access for accounts found violating these integrity rules.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 4. Intellectual Property
                </h3>
                <p className="text-muted-foreground">
                  All flag imagery, code, and content are the property of the Signals Master project or used with permission 
                  relevant to the Sea Cadet training curriculum. You may not copy, modify, or distribute the platform&apos;s code without permission.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> 5. Disclaimer & Affiliation
                </h3>
            
                <p className="text-muted-foreground mt-2">
                  This educational tool is provided &quot;as is&quot;. While we strive for accuracy in flag representations and meanings, 
                  it should be used as a supplement to official training manuals (e.g., ATP-1, C-09-001), not a replacement.
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRIVACY POLICY CONTENT */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-2xl">Privacy Policy</CardTitle>
              </div>
              <CardDescription>
                How we collect, use, and protect your personal data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm md:text-base leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 1. Data Collection
                </h3>
                <p className="text-muted-foreground">
                  To provide the training experience, we collect only necessary information:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Account Info:</strong> Name, Email, and Cadet Unit (for profile creation).</li>
                  <li><strong>Performance Data:</strong> Quiz scores, exam results, reaction times, and specific flag error rates.</li>
                  <li><strong>Technical Data:</strong> IP address and device type (for security and anti-cheat validation).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 2. Data Usage
                </h3>
                <p className="text-muted-foreground">
                  Your data is used strictly for:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Educational Tracking:</strong> Helping you identify weak areas (e.g., &quot;Review these 5 flags&quot;).</li>
                  <li><strong>Instructor Review:</strong> Allowing authorized officers to validate promotion readiness based on exam results.</li>
                  <li><strong>Leaderboards:</strong> Displaying your rank and badge achievements publicly within the app.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 3. Data Storage & Security
                </h3>
                <p className="text-muted-foreground">
                  We use <strong>Google Firebase</strong> for authentication and database storage. 
                  Exam results are stored as immutable records. We implement strict security rules to prevent unauthorized 
                  access to your personal profile. We do not sell data to third parties.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 4. Your Rights
                </h3>
                <p className="text-muted-foreground">
                  You have the right to request a copy of your performance data or request account deletion. 
                  Note that &quot;Official Exam&quot; records may be retained for unit administrative purposes as per Sea Cadet training policies.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 5. Contact Us
                </h3>
                <p className="text-muted-foreground">
                  If you have questions about this policy, please contact the project administrator or your training officer.
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Last Updated: February 8, 2026</p>
      </div>
    </div>
  );
}
