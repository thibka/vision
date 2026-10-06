import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <main className="flex h-full items-center justify-center p-4" aria-label="Sign in">
            <SignIn />
        </main>
    );
}
