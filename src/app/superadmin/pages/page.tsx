import { SuperShell } from "@/components/superadmin/SuperShell";
import { SuperPagesTable } from "@/components/superadmin/SuperPagesTable";
import { getSuperPages } from "@/actions/pages";

export const metadata = {
  title: "Pages",
};

export default async function SuperPagesPage() {
  const pages = await getSuperPages();

  return (
    <SuperShell title="Pages" description="Landing pages created by the super admin">
      <SuperPagesTable pages={pages} />
    </SuperShell>
  );
}
