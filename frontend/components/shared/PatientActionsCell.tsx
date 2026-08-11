'use client';

import Link from 'next/link';
import { BiClipboard, BiSolidPencil, BiSolidCheckCircle, BiSolidUserCheck, BiSolidUserPlus, BiBriefcase, BiPencil, BiPrinter, BiSolidFile, BiSolidAward } from 'react-icons/bi';
import Dropdown from '@/components/ui/Dropdown';
import DropdownItem from '@/components/ui/DropdownItem';
import { printUrlSilently } from '@/lib/print-helper';

interface PatientActionsCellProps {
  patientUid: string;
  patientName: string;
  onEdit?: () => void;
  onAddTreatment?: () => void;
  onAddPrescription?: () => void;
  onAddWorkDone?: () => void;
  onGenerateCertificate?: () => void;
  onPrintCase?: () => void;
  mode?: 'full' | 'print-only';
}

export default function PatientActionsCell({
  patientUid,
  onEdit,
  onAddTreatment,
  onAddPrescription,
  onAddWorkDone,
  onPrintCase,
  mode = 'full',
}: PatientActionsCellProps) {
  if (mode === 'print-only') {
    return (
      <div className="flex items-center justify-center">
        <Dropdown
          align="right"
          trigger={
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border-2 border-slate-300 text-slate-500 rounded-md hover:bg-slate-500 hover:text-white transition-all cursor-pointer">
              <BiPrinter className="w-3.5 h-3.5" /> Print
            </span>
          }
        >
          <DropdownItem icon={<BiSolidFile className="text-cyan-500" />} onClick={onPrintCase}>
            Case Details
          </DropdownItem>
          <DropdownItem
            icon={<BiSolidAward className="text-amber-500" />}
            onClick={() => {
              if (patientUid) {
                printUrlSilently(`/patients/${patientUid}/certificate/print`);
              }
            }}
          >
            Certificate
          </DropdownItem>
        </Dropdown>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {/* Add Dropdown */}
      <Dropdown
        align="right"
        trigger={
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border-2 border-primary-500 text-primary-500 rounded-md hover:bg-primary-500 hover:text-white transition-all cursor-pointer">
            <BiSolidUserPlus className="w-3.5 h-3.5" /> Add
          </span>
        }
      >
        <DropdownItem icon={<BiClipboard className="text-primary-500" />} onClick={onAddTreatment}>
          Treatment Plan
        </DropdownItem>
        <DropdownItem icon={<BiSolidPencil className="text-emerald-500" />} onClick={onAddPrescription}>
          Prescription
        </DropdownItem>
        <DropdownItem icon={<BiSolidCheckCircle className="text-purple-500" />} onClick={onAddWorkDone}>
          Work Done
        </DropdownItem>
      </Dropdown>

      {/* View Dropdown */}
      <Dropdown
        align="right"
        trigger={
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border-2 border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
            <BiClipboard className="w-3.5 h-3.5" /> View
          </span>
        }
      >
        <Link href={`/patients/${patientUid}/treatments`} className="contents">
          <DropdownItem icon={<BiClipboard className="text-primary-500" />}>
            Treatment Plan
          </DropdownItem>
        </Link>
        <Link href={`/patients/${patientUid}/prescriptions`} className="contents">
          <DropdownItem icon={<BiSolidPencil className="text-emerald-500" />}>
            Prescriptions
          </DropdownItem>
        </Link>
        <Link href={`/patients/${patientUid}/work-done`} className="contents">
          <DropdownItem icon={<BiBriefcase className="text-purple-500" />}>
            Work Done
          </DropdownItem>
        </Link>
      </Dropdown>

      {/* Manage */}
      <div className="flex gap-1">
        <Link
          href={`/patients/${patientUid}/history`}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-all"
          title="Patient History"
        >
          <BiSolidUserCheck className="w-3.5 h-3.5" /> History
        </Link>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-all"
          title="Edit Patient"
        >
          <BiPencil className="w-3.5 h-3.5" /> Edit
        </button>
      </div>

    </div>
  );
}
