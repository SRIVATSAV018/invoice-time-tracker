import React from 'react';


export default function TableHead({ children }: { children: React.ReactNode }) {
    return (
        <thead>
            {children}
        </thead>
    );
}
