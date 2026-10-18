import { Button, type ButtonProps } from '@/components/Button';
import { PlusIcon } from "@radix-ui/react-icons"
import { cx } from '@/lib/utils';

export default function ButtonIcon({ children, className, ...props }: ButtonProps) {
    return (
        <Button className={cx("w-full text-left inline-flex justify-start gap-2", className)} {...props}>
            <PlusIcon className="stroke-current stroke-[0.5]" /> {children}
        </Button>
    );
}
