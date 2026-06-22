import { notFound } from "next/navigation";
import { SuperShell } from "@/components/superadmin/SuperShell";
import { PageForm } from "@/components/admin/PageForm";
import { getSuperPageById, updateSuperPageAction } from "@/actions/pages";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Edit Page",
};

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSuperPage({ params }: EditPageProps) {
  const { id } = await params;
  const page = await getSuperPageById(id);

  if (!page) {
    notFound();
  }

  const boundUpdateAction = updateSuperPageAction.bind(null, id);

  async function editAction(
    _prevState: { success: boolean; error?: string; data?: { id: string; shortCode: string } },
    formData: FormData
  ): Promise<{ success: boolean; error?: string; data?: { id: string; shortCode: string } }> {
    "use server";
    const result = await boundUpdateAction({ success: false }, formData);
    return result;
  }

  return (
    <SuperShell title="Edit Page" description={`Editing ${page.businessName}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <a href={`/api/qr/${page.shortCode}?download=1`}>
            <Button variant="secondary">Download QR</Button>
          </a>
          <a href={`/api/superadmin/card/${page.shortCode}`}>
            <Button variant="secondary">Download Visiting Card</Button>
          </a>
          <a href={`/p/${page.shortCode}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">View Page</Button>
          </a>
        </div>

        <PageForm
          action={editAction}
          submitLabel="Save Changes"
          showSuccessAlert
          manualContent
          initialData={{
            businessName: page.businessName,
            businessType: page.businessType,
            tagline: page.tagline,
            benefits: page.benefits ?? [],
            phoneNumber: page.phoneNumber ?? "",
            whatsappNumber: page.whatsappNumber ?? "",
            instagramUrl: page.instagramUrl ?? "",
            youtubeUrl: page.youtubeUrl ?? "",
            googleMapsUrl: page.googleMapsUrl ?? "",
            customButtons: page.customButtons ?? [],
          }}
        />
      </div>
    </SuperShell>
  );
}
