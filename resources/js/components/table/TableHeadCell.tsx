import React from 'react';
import { cn } from '@/lib/utils';


export default function TableHeadCell({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <th className={cn('h-10 border-b px-2 text-left text-sm font-semibold whitespace-nowrap', className)}>
            {children}
        </th>
    );
}
