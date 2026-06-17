import { PinLoginForm } from "@/components/shell/PinLoginForm";
import { superLoginAction } from "@/actions/auth";

export const metadata = {
  title: "Super Admin Login",
};

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          <p className="mt-2 text-sm text-gray-400">Platform control panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <PinLoginForm action={superLoginAction} label="Admin PIN" maxLength={6} />
        </div>
      </div>
    </div>
  );
}
