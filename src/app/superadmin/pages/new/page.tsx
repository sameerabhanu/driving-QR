import { SuperShell } from "@/components/superadmin/SuperShell";
import { AddSuperPageClient } from "@/components/superadmin/AddSuperPageClient";

export const metadata = {
  title: "Add Page",
};

export default function AddSuperPagePage() {
  return (
    <SuperShell
      title="Add Page"
      description="Create a landing page with a QR code (manual content, no credits)"
    >
      <AddSuperPageClient />
    </SuperShell>
  );
}
