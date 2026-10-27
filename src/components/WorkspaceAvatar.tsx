import { cx } from '@/lib/utils';

export default function WorkspaceAvatar({
    children,
    size = 'md',
}: {
    children: React.ReactNode;
    size?: 'sm' | 'md';
}) {
    return (
        <div className={cx(`
            shrink-0
            rounded-md
            bg-avatar-bg
            flex
            items-center justify-center
            text-avatar-fg
            font-semibold
            text-trim
        `, size === 'sm' ? 'w-5 h-5 text-xs' : 'w-7 h-7')}>
            { children }
        </div>
    );
}
