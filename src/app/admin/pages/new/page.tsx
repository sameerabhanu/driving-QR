import { AdminShell } from "@/components/admin/AdminShell";
import { AddPageClient } from "@/components/admin/AddPageClient";

export const metadata = {
  title: "Add Page",
};

export default function AddPagePage() {
  return (
    <AdminShell
      title="Add Page"
      description="Create a new client landing page with a QR code"
    >
      <AddPageClient />
    </AdminShell>
  );
}
