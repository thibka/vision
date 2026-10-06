export default function Avatar({ children }: { children: React.ReactNode }) {
    return (
        <div className="
            w-7 h-7
            rounded-md
            bg-avatar-bg
            flex
            items-center justify-center
            text-avatar-fg
            font-semibold
            text-trim
        ">
            { children }
        </div>
    );
}