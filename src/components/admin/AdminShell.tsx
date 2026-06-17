import { Shell, type NavItem } from "@/components/shell/Shell";
import { shopLogoutAction } from "@/actions/auth";

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/pages/new", label: "Add Page", icon: "plus" },
  { href: "/admin/expiring", label: "Expiring Pages", icon: "calendar" },
];

interface AdminShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <Shell
      brandTitle="Reseller Panel"
      brandSubtitle="Page Manager"
      navItems={navItems}
      logoutAction={shopLogoutAction}
      title={title}
      description={description}
    >
      {children}
    </Shell>
  );
}
