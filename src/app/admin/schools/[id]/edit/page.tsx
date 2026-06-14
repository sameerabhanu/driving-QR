import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EditSchoolForm } from "@/components/admin/EditSchoolForm";
import { getSchoolById, updateSchoolAction } from "@/actions/schools";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Edit School",
};

interface EditSchoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  const boundUpdateAction = updateSchoolAction.bind(null, id);

  return (
    <AdminLayout
      title="Edit School"
      description={`Editing ${school.schoolName}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <a href={`/api/qr/${school.slug}?download=1`}>
            <Button variant="secondary">Download QR</Button>
          </a>
          <a href={`/${school.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">View Landing Page</Button>
          </a>
        </div>

        <EditSchoolForm
          action={boundUpdateAction}
          initialData={{
            schoolName: school.schoolName,
            phoneNumber: school.phoneNumber,
            whatsappNumber: school.whatsappNumber,
            googleMapsUrl: school.googleMapsUrl,
            slug: school.slug,
          }}
        />
      </div>
    </AdminLayout>
  );
}
