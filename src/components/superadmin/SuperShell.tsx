import { Shell, type NavItem } from "@/components/shell/Shell";
import { superLogoutAction } from "@/actions/auth";

const navItems: NavItem[] = [
  { href: "/superadmin", label: "Shops", icon: "shops", exact: true },
  { href: "/superadmin/shops/new", label: "Add Shop", icon: "plus" },
];

interface SuperShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SuperShell({ title, description, children }: SuperShellProps) {
  return (
    <Shell
      brandTitle="Super Admin"
      brandSubtitle="Platform Control"
      navItems={navItems}
      logoutAction={superLogoutAction}
      title={title}
      description={description}
    >
      {children}
    </Shell>
  );
}
