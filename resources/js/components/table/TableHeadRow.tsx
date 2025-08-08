import React from 'react';


export default function TableHeadRow({ children }: { children: React.ReactNode }) {
    return (
        <tr className="rounded-t-md hover:bg-gray-50 dark:hover:bg-gray-50/5">
            {children}
        </tr>
    );
}
