/**
 * Admin Login Page
 * Credentials-based login for admin dashboard
 */

import { LoginForm } from '@/components/admin/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg px-8 py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Polaris AI</h1>
            <p className="text-gray-600 mt-2">Admin Dashboard Login</p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-gray-500 mt-6">
            Protected area. Authorized personnel only.
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Version 0.1.0 &bull; Polaris AI Support
        </p>
      </div>
    </div>
  );
}
