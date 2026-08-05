import { redirect } from 'next/navigation';

export default async function PatientBasePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  // Redirect to the history tab by default
  redirect(`/patients/${uid}/history`);
}
