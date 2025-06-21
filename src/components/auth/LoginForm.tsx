"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, ChromeIcon } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  type UserCredential 
} from 'firebase/auth';

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

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "Login Successful", description: `Welcome back, ${userCredential.user.email}!` });
      router.push('/'); 
    } catch (e: any) {
      let errorMessage = "Failed to log in. Please check your email and password.";
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (e.code === 'auth/invalid-app-id') {
        errorMessage = "Configuration Error: Invalid App ID. Please verify your Firebase project settings.";
      }
      else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
    }
    setIsLoading(false);
  }

  const handleSocialLogin = async (providerName: 'Google') => { 
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider(); 

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`${providerName} login successful:`, user);
      toast({
        title: "Login Successful",
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      router.push('/'); 
    } catch (e: any) {
      console.error(`${providerName} login error:`, e);
      let errorMessage = "An unexpected error occurred during social login.";
      if (e.code === 'auth/operation-not-allowed') {
        errorMessage = "Google Sign-In is not enabled for this project. \n\nTo fix this: \n1. Go to your Firebase Console. \n2. Navigate to Authentication > Sign-in method. \n3. Find 'Google' in the list of providers and enable it.";
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email. Try signing in with the original method.";
      } else if (e.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelled. The sign-in popup was closed.";
      } else if (e.code === 'auth/cancelled-popup-request') {
        errorMessage = "Login cancelled. Multiple popup requests were made.";
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (e.code === 'auth/invalid-app-id') {
         errorMessage = "Configuration Error: Invalid App ID for Google Sign-In. Please check the following: \n1. The `appId` in `src/lib/firebase.ts` must exactly match the Web App ID from your Firebase project settings. \n2. The Google Sign-In provider must be enabled in the Firebase Console. \n3. Ensure your project's support email is set in the Firebase Console (Project settings > General).";
      } else if (e.code) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Configuration error. Please check the details shown on the login form.",
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
            <AlertDescription style={{ whiteSpace: 'pre-wrap' }}>{error}</AlertDescription>
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

        <div className="grid grid-cols-1 gap-3"> 
          <Button variant="outline" type="button" onClick={() => handleSocialLogin('Google')} disabled={isLoading}>
            <ChromeIcon className="mr-2 h-4 w-4" /> Google
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
