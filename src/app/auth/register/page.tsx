
import RegisterForm from "@/components/auth/RegisterForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepForward } from "lucide-react";

export default function RegisterPage() {
  return (
    // Removed the outer div that was centering, ConditionalAppShell will provide a basic layout for auth pages
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <StepForward className="h-12 w-12 text-primary mb-3" />
          <CardTitle className="text-2xl font-bold text-primary">Create Your Account</CardTitle>
          <CardDescription>Join LinguaLeap and start your language adventure.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
  );
}
