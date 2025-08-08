import React from 'react';


export default function Table({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-md border">
            <div className="overflow-x-auto">
                <table className="w-full">
                    {children}
                </table>
            </div>
        </div>
    );
}
