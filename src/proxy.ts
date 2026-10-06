import { clerkMiddleware } from '@clerk/nextjs/server';

// Only resolves the session; each page checks access itself with `auth.protect()`
export default clerkMiddleware({ signInUrl: '/sign-in', signUpUrl: '/sign-up' });

export const config = {
    matcher: [
        // Skip Next.js internals and static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
