import React from 'react';
import { cn } from '@/lib/utils';


export default function TableBodyCell({ children, colSpan = 1, className, onClick }: { children: React.ReactNode, colSpan?: number, className?: string, onClick?: () => void }) {
    return (
        <td className={cn('h-[48px] p-2 align-middle text-sm whitespace-nowrap', className)} colSpan={colSpan} onClick={() => onClick?.()}>
            {children}
        </td>
    );
}
