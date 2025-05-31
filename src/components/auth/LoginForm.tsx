
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, Github, ChromeIcon } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    // Placeholder for actual email/password login logic using Firebase
    console.log("Email/Password login attempt:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Example:
    // try {
    //   const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    //   toast({ title: "Login Successful", description: `Welcome back, ${userCredential.user.email}!` });
    //   router.push('/');
    // } catch (e: any) {
    //   setError(e.message || "Failed to log in.");
    //   toast({ variant: "destructive", title: "Login Failed", description: e.message });
    // }
    setError("Email/Password login is not fully implemented yet. Please use social login or contact support.");
    toast({ variant: "destructive", title: "Login Incomplete", description: "Email/Password login not yet active."})
    setIsLoading(false);
  }

  const handleSocialLogin = async (providerName: 'Google' | 'Facebook') => {
    setIsLoading(true);
    setError(null);
    const provider = providerName === 'Google' ? new GoogleAuthProvider() : new FacebookAuthProvider();

    // Ensure Firebase is configured before attempting social login
    if (auth.app.options.apiKey === "YOUR_API_KEY_HERE") {
        setError("Firebase is not configured. Please update src/lib/firebase.ts with your project credentials.");
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Firebase credentials are missing. Social login cannot proceed.",
        });
        setIsLoading(false);
        return;
    }

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`${providerName} login successful:`, user);
      toast({
        title: "Login Successful",
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      router.push('/'); // Redirect to home page after successful login
    } catch (e: any) {
      console.error(`${providerName} login error:`, e);
      let errorMessage = "An unexpected error occurred during social login.";
      if (e.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email. Try signing in with the original method.";
      } else if (e.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelled. The sign-in popup was closed.";
      } else if (e.code === 'auth/cancelled-popup-request') {
        errorMessage = "Login cancelled. Multiple popup requests were made.";
      } else if (e.code) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" />Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Lock className="w-4 h-4" />Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-primary/80">
              Forgot your password?
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
          ) : null}
          Sign In
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" onClick={() => handleSocialLogin('Google')} disabled={isLoading}>
            <ChromeIcon className="mr-2 h-4 w-4" /> Google
          </Button>
          <Button variant="outline" type="button" onClick={() => handleSocialLogin('Facebook')} disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" /> Facebook {/* Using Github as placeholder */}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-semibold leading-6 text-primary hover:text-primary/80">
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  );
}
