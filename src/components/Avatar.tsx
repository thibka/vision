export default function Avatar({ children }: { children: React.ReactNode }) {
    return (
        <div className="
            w-7 h-7
            rounded-md
            bg-gray-50
            flex
            items-center justify-center
            text-gray-700 
            font-semibold 
            text-trim
        ">
            { children }
        </div>
    );
}