import { redirect } from 'next/navigation';

export default function PatientBasePage({ params }: { params: { uid: string } }) {
  // Redirect to the history tab by default
  redirect(`/patients/${params.uid}/history`);
}
