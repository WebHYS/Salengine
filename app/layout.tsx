import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'SalesCoach Dashboard',
  description: 'Coaching dashboard for door-to-door sales teams'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
