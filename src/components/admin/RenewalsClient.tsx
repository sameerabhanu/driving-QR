"use client";

import { useRouter } from "next/navigation";
import { MONTHS } from "@/lib/utils";
import { Select } from "@/components/ui/Select";
import { RenewalsTable } from "./RenewalsTable";
import type { School } from "@/db/schema";

interface RenewalsClientProps {
  schools: School[];
  selectedMonth: number;
}

export function RenewalsClient({ schools, selectedMonth }: RenewalsClientProps) {
  const router = useRouter();

  const monthOptions = MONTHS.map((month, index) => ({
    value: String(index),
    label: month,
  }));

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Select
          label="Select Month"
          options={monthOptions}
          value={String(selectedMonth)}
          onChange={(e) => {
            router.push(`/admin/renewals?month=${e.target.value}`);
          }}
        />
      </div>

      <RenewalsTable schools={schools} month={MONTHS[selectedMonth]} />
    </div>
  );
}
