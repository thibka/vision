import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <main className="flex h-full items-center justify-center p-4" aria-label="Sign up">
            <SignUp />
        </main>
    );
}
