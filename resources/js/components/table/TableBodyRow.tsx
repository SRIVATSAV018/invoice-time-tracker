import React from 'react';


export default function TableBodyRow({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <tr className={`hover:bg-muted/50 ${className}`}>
            {children}
        </tr>
    );
}
