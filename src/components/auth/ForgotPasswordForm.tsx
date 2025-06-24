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
import { sendPasswordResetEmail } from "firebase/auth"; // Import the function
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

  // Set auth language from context for emails
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
      setSuccessMessage("If an account with this email exists, a password reset link has been sent. Please check your inbox.");
      form.reset();
    } catch (e: any) {
      // Firebase provides generic errors for password reset to prevent user enumeration.
      // So we typically show a generic success message regardless, but for debugging we can show the error.
      let errorMessage = "An error occurred. Please try again later.";
      if (e.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (e.code) {
        // For other Firebase errors, just show a generic message in production
        // but the actual error message during development can be helpful.
        console.error("Password Reset Error:", e);
      }
      setError(errorMessage);
      // For a better user experience, you might still want to show the success message
      // to prevent attackers from checking which emails are registered.
      setSuccessMessage("If an account with this email exists, a password reset link has been sent. Please check your inbox.");
    }
    
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
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
        {!successMessage && ( // Only show form if no success message
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
        
        {!successMessage && ( // Only show button if no success message
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
            ) : null}
            Send Reset Link
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
