import { SuperShell } from "@/components/superadmin/SuperShell";
import { CreateShopClient } from "@/components/superadmin/CreateShopClient";

export const metadata = {
  title: "Add Shop",
};

export default function AddShopPage() {
  return (
    <SuperShell title="Add Shop" description="Onboard a new reseller shop">
      <CreateShopClient />
    </SuperShell>
  );
}
