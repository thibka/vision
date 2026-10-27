import { cx } from '@/lib/utils';
import { isEmoji } from '@/lib/workspace-name';

export default function WorkspaceAvatar({
    icon,
    size = 'md',
}: {
    icon: string;
    size?: 'sm' | 'md';
}) {
    return (
        <div className={cx(`
            shrink-0
            rounded-md
            flex
            items-center justify-center
            text-trim
        `, size === 'sm' ? 'w-5 h-5 text-xs' : 'w-7 h-7', !isEmoji(icon) && 'bg-avatar-bg text-avatar-fg font-semibold')}>
            { icon }
        </div>
    );
}
