
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useLocalization } from "@/hooks/useLocalization";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { language } = useLocalization();

  useEffect(() => {
    auth.languageCode = language;
  }, [language]);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccessMessage("Password reset email sent! If an account exists, you will receive an email with a secure link to reset your password shortly.");
      form.reset();
    } catch (e: any) {
      // This logic now properly displays errors to the user.
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (e.code === 'auth/invalid-email') {
        errorMessage = "The email address you entered is not valid.";
      } else if (e.code === 'auth/user-not-found') {
        // While we don't want to confirm if a user exists for security,
        // for debugging purposes, we can log it. The UI will show a generic message.
        console.warn("Attempted password reset for non-existent user:", data.email);
        errorMessage = "Could not send reset email. Please check your email address or try again later.";
      } else if (e.message) {
        // Display other Firebase errors directly to help debug configuration issues.
        errorMessage = `Firebase Error: ${e.message}`;
      }
      console.error("Password Reset Error:", e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Sending Email</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert variant="default" className="bg-green-50 border-green-300 text-green-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {!successMessage && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" />Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {!successMessage && (
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
            ) : null}
            Send Password Reset Link
            </Button>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary/80 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </p>
      </form>
    </Form>
  );
}
