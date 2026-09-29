import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default async function RegisterWithSponsorPage(props: {
  params: Promise<{ sponsor: string }>;
}) {
  const params = await props.params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080e]" />}>
      <RegisterForm initialSponsor={params.sponsor} />
    </Suspense>
  );
}
