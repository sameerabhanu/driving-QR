import { Sidebar } from "./Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </header>
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
