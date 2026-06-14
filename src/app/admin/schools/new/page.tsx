import { AdminLayout } from "@/components/admin/AdminLayout";
import { AddSchoolClient } from "@/components/admin/AddSchoolClient";

export const metadata = {
  title: "Add School",
};

export default function AddSchoolPage() {
  return (
    <AdminLayout
      title="Add School"
      description="Create a new driving school landing page with QR code"
    >
      <AddSchoolClient />
    </AdminLayout>
  );
}
