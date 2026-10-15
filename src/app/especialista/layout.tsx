import type { ReactNode } from 'react';

export default function EspecialistaLayout({ children }: { children: ReactNode }) {
   return <div className="min-h-screen bg-[#fafafa]">{children}</div>;
}