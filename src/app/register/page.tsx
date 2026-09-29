import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default async function RegisterPage(props: {
  searchParams?: Promise<{ sponsor?: string; ref?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const initialSponsor = searchParams?.sponsor || searchParams?.ref;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080e]" />}>
      <RegisterForm initialSponsor={initialSponsor} />
    </Suspense>
  );
}
