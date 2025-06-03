
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, User, ChromeIcon } from "lucide-react"; // Removed Github icon
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  // FacebookAuthProvider, // Removed FacebookAuthProvider
  signInWithPopup, 
  createUserWithEmailAndPassword,
  updateProfile,
  type UserCredential 
} from 'firebase/auth';

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

    if (auth.app.options.apiKey === "AIzaSyDeN1mxcNwQqOyBtLE2AgZoBzf5exPYBoc" && auth.app.options.appId === "YOUR_APP_ID_HERE") {
        setError("Firebase is not configured correctly. Please update src/lib/firebase.ts with your project credentials, especially the App ID.");
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Firebase credentials (App ID) are missing. Email/Password registration cannot proceed.",
        });
        setIsLoading(false);
        return;
    }

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
        errorMessage = "Network error. Please check your internet connection and Firebase configuration (including App ID in src/lib/firebase.ts).";
      } else if (e.code === 'auth/invalid-app-id') {
        errorMessage = "Invalid App ID in Firebase configuration. Please check src/lib/firebase.ts.";
      }
      else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Registration Failed", description: errorMessage });
    }
    setIsLoading(false);
  }

  const handleSocialSignup = async (providerName: 'Google') => { // Removed 'Facebook'
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider(); // Only Google provider

    if (auth.app.options.apiKey === "AIzaSyDeN1mxcNwQqOyBtLE2AgZoBzf5exPYBoc" && auth.app.options.appId === "YOUR_APP_ID_HERE") {
        setError("Firebase is not configured correctly. Please update src/lib/firebase.ts with your project credentials, especially the App ID.");
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Firebase credentials (App ID) are missing. Social signup cannot proceed.",
        });
        setIsLoading(false);
        return;
    }
    
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`${providerName} signup successful:`, user);
      toast({
        title: "Sign Up Successful",
        description: `Welcome, ${user.displayName || user.email}! Your account is ready. Redirecting...`,
      });
      router.push('/'); 
    } catch (e: any) {
      console.error(`${providerName} signup error:`, e);
      let errorMessage = "An unexpected error occurred during social signup.";
       if (e.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email. Try signing in with the original method.";
      } else if (e.code === 'auth/popup-closed-by-user') {
        errorMessage = "Signup cancelled. The sign-in popup was closed.";
      } else if (e.code === 'auth/cancelled-popup-request') {
        errorMessage = "Signup cancelled. Multiple popup requests were made.";
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and Firebase configuration (including App ID in src/lib/firebase.ts).";
      } else if (e.code === 'auth/invalid-app-id') {
        errorMessage = "Invalid App ID in Firebase configuration. Please check src/lib/firebase.ts.";
      } else if (e.code) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
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
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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

        <div className="grid grid-cols-1 gap-3"> {/* Changed to grid-cols-1 */}
          <Button variant="outline" type="button" onClick={() => handleSocialSignup('Google')} disabled={isLoading}>
            <ChromeIcon className="mr-2 h-4 w-4" /> Google
          </Button>
          {/* Facebook button removed */}
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
