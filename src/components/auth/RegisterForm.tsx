"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, User, ChromeIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { useLocalization } from "@/hooks/useLocalization";

const registerFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLocalization();

  // Set auth language from context for emails
  useEffect(() => {
    auth.languageCode = language;
  }, [language]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      toast({ title: "Registration Successful", description: "Welcome! Your account has been created. Please log in." });
      router.push('/auth/login'); 
    } catch (e: any) {
      let errorMessage = "Failed to register. Please try again.";
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use. Try logging in or using a different email.";
      } else if (e.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (e.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/Password sign-up is not enabled for this project. Please enable it in your Firebase Console under Authentication > Sign-in method.";
      } else if (e.code === 'auth/invalid-app-id') {
        errorMessage = "Configuration Error: Invalid App ID. Please verify your Firebase project settings.";
      }
      else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Registration Failed", description: errorMessage });
    }
    setIsLoading(false);
  }

  const handleSocialSignup = async (providerName: 'Google') => { 
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider(); 
    
    try {
      const result = await signInWithPopup(auth, provider);
      // The signed-in user info.
      const user = result.user;
      
      console.log(`${providerName} signup successful:`, user);
      toast({
        title: "Sign Up Successful",
        description: `Welcome, ${user.displayName || user.email}! Your account is ready. Redirecting...`,
      });
      router.push('/'); 
    } catch (e: any) {
      // Handle Errors here.
      const errorCode = e.code;
      const errorMessage = e.message;
      
      console.error(`${providerName} signup error:`, e);

      let displayErrorMessage = "An unexpected error occurred during social signup.";
      if (errorCode === 'auth/account-exists-with-different-credential') {
        displayErrorMessage = "An account with this email already exists. Please go to the login page and sign in.";
      } else if (errorCode === 'auth/operation-not-allowed') {
        displayErrorMessage = "Google Sign-In is not enabled for this project. \n\nTo fix this: \n1. Go to your Firebase Console. \n2. Navigate to Authentication > Sign-in method. \n3. Find 'Google' in the list of providers and enable it.";
      } else if (errorCode === 'auth/popup-closed-by-user') {
        displayErrorMessage = "Signup cancelled. The sign-in popup was closed.";
      } else if (errorCode === 'auth/cancelled-popup-request') {
        displayErrorMessage = "Signup cancelled. Multiple popup requests were made.";
      } else if (errorCode === 'auth/network-request-failed') {
        displayErrorMessage = "Network error. Please check your internet connection.";
      } else if (errorCode === 'auth/invalid-app-id') {
         displayErrorMessage = "Configuration Error: Invalid App ID for Google Sign-In. Please check the following: \n1. The `appId` in `src/lib/firebase.ts` must exactly match the Web App ID from your Firebase project settings. \n2. The Google Sign-In provider must be enabled in the Firebase Console. \n3. Ensure your project's support email is set in the Firebase Console (Project settings > General).";
      } else if (errorMessage) {
        displayErrorMessage = errorMessage;
      }
      setError(displayErrorMessage);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: displayErrorMessage,
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
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription style={{ whiteSpace: 'pre-wrap' }}>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" />Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Lock className="w-4 h-4" />Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
          ) : null}
          Sign Up
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3"> 
          <Button variant="outline" type="button" onClick={() => handleSocialSignup('Google')} disabled={isLoading}>
            <ChromeIcon className="mr-2 h-4 w-4" /> Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
