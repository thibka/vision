import { Button } from '@/components/Button';
import { PlusIcon } from "@radix-ui/react-icons"

export default function ButtonIcon({children}: {children: React.ReactNode}) {
    return (
        <Button className="w-full text-left inline-flex justify-start gap-2">
            <PlusIcon className="stroke-current stroke-[0.5]" /> {children}
        </Button>
    );
}