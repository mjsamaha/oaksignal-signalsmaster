"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl]
  );
  const redirectConfig = {
    signInForceRedirectUrl: "/auth/success",
    signUpForceRedirectUrl: "/auth/success",
    signInFallbackRedirectUrl: "/auth/success",
    signUpFallbackRedirectUrl: "/auth/success",
  };

  if (!clerkPublishableKey) {
    return <>{children}</>;
  }

  if (!convex) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey} {...redirectConfig}>
        {children}
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} {...redirectConfig}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
