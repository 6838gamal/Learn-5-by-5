
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    // Removed the outer div that was centering, ConditionalAppShell will provide a basic layout for auth pages
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <KeyRound className="h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-2xl font-bold text-primary">Forgot Your Password?</CardTitle>
          <CardDescription>
            No worries! Enter your email address below and we&apos;ll send you a secure link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
  );
}
