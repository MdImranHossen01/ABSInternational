import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | ABS International Dashboard',
    default: 'Dashboard | ABS International',
  },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
