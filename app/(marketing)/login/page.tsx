import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Authentication is not configured in this environment.</p>
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <SignIn routing="path" path="/login" forceRedirectUrl="/auth/success" />
    </div>
  );
}
