import { PinLoginForm } from "@/components/shell/PinLoginForm";
import { shopLoginAction } from "@/actions/auth";

export const metadata = {
  title: "Reseller Login",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reseller Login</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your name and PIN to manage pages</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <PinLoginForm
            action={shopLoginAction}
            label="Shop PIN"
            maxLength={6}
            showName
            nameLabel="Your Name"
          />
        </div>
      </div>
    </div>
  );
}
