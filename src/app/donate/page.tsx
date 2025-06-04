
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, CreditCard, Home, AlertTriangle, DollarSign, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Text placeholders for payment method logos
const PaymentMethodPlaceholders = [
  { name: "Visa", icon: <CreditCard className="w-6 h-6 text-blue-600" /> },
  { name: "Mastercard", icon: <CreditCard className="w-6 h-6 text-red-500" /> },
  { name: "American Express", icon: <CreditCard className="w-6 h-6 text-sky-500" /> },
  { name: "PayPal", icon: <svg className="w-6 h-6 fill-current text-blue-700" viewBox="0 0 24 24"><path d="M7.076 21.194a.605.605 0 01-.511-.298L2.49 13.51a.32.32 0 01.09-.418l1.397-.986a.32.32 0 01.418.09l2.976 4.23a.32.32 0 00.49.027l8.46-9.069a.32.32 0 01.428-.043l1.427.951a.32.32 0 01.043.427l-9.497 10.176a.604.604 0 01-.47.236h-.003zm9.982-11.426c-.606 0-1.016.493-1.016 1.062 0 .56.336 1.019.942 1.019h.419c.605 0 .96-.287.972-.768.012-.384-.204-.856-.918-.856h-.4zm2.084 3.3c-.06.302-.3.78-.768.78-.492 0-.828-.347-.828-.815 0-.42.252-.78.804-.78.372 0 .6.216.72.492l.072.123zm-6.116 3.075c-.073.266-.386.857-.944.857-.636 0-1.02-.432-1.02-.995 0-.504.324-.923.936-.923.42 0 .671.228.803.552l.125.31zm-2.683-3.147c-.605 0-1.015.492-1.015 1.061 0 .56.336 1.02.942 1.02h.42c.604 0 .96-.288.972-.768.012-.384-.204-.856-.918-.856h-.401zm7.208-5.43c0-1.128-.815-1.835-2.075-1.835h-7.137c-.792 0-1.32.288-1.583.973l-2.76 8.313c-.108.323-.06.551.144.551h2.446l.684-2.075h4.162l-.468 1.475c-.144.432-.024.672.384.672h1.738c.6 0 .984-.3.984-.856l2.447-7.078zm-7.629 2.859h3.814l.756-2.255h-4.281l-.29 2.255z"/></svg> },
  { name: "Google Pay", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.44 11.38C20.44 10.6 20.38 9.95 20.21 9.3H12.2V13.15H16.89C16.68 14.25 16.07 15.13 15.21 15.7L15.17 15.74L17.89 17.8C19.53 16.31 20.44 14.05 20.44 11.38Z" fill="#4285F4"/><path d="M12.2 20.5C14.48 20.5 16.43 19.74 17.89 17.8L15.21 15.7C14.45 16.18 13.45 16.55 12.2 16.55C10.02 16.55 8.17 15.1 7.54 13.1H7.47L4.63 15.24C6.09 18.31 8.91 20.5 12.2 20.5Z" fill="#34A853"/><path d="M7.54 13.1C7.32 12.5 7.17 11.85 7.17 11.2C7.17 10.55 7.32 9.9 7.53 9.3L7.53 9.26L4.63 7.12C3.79 8.69 3.25 10.41 3.25 11.2C3.25 12.68 3.79 14.11 4.63 15.24L7.54 13.1Z" fill="#FBBC05"/><path d="M12.2 5.85C13.61 5.85 14.77 6.32 15.57 7.08L18.01 4.64C16.43 3.18 14.48 2.25 12.2 2.25C8.91 2.25 6.09 4.44 4.63 7.12L7.53 9.3C8.17 7.35 10.02 5.85 12.2 5.85Z" fill="#EA4335"/></svg> },
  { name: "Apple Pay", icon: <svg className="w-6 h-6" viewBox="0 0 60 60" fill="currentColor"><path d="M28.43,14.4S29.53,11,32.73,11s4.8,3.3,4.8,3.3l.3-4.6s-1.4-2.2-4.8-2.2-6.2,2.4-6.2,2.4Zm11,29.7a7.81,7.81,0,0,1-6,2.9c-1.7,0-3.2-.6-4.5-1.9-1.3-1.2-2.3-3.1-2.3-5.2s.9-4.2,2.4-5.5a5.3,5.3,0,0,1,4.3-2.1c1.6,0,3.3.6,4.6,1.8l.2.2a.7.7,0,0,0,1-.1.7.7,0,0,0,.1-1L40,27.4s-.6-.8-2.1-.8-2.4.9-2.4.9-.9-1.5-2.9-1.5c-2,0-3.9,1.6-3.9,4.7s1.2,4.6,3.1,4.6c1.1,0,2.1-.6,2.1-.6l-.1,1.1s-.8,1.8-2.8,1.8a5.6,5.6,0,0,1-5.1-3.5,10.1,10.1,0,0,1-1.2-5.2,10,10,0,0,1,3.1-7.5,11.11,11.11,0,0,1,7.9-3.7,11.49,11.49,0,0,1,8.4,3.6,1.2,1.2,0,0,0,1.6.2l.9-.6a.9.9,0,0,0,.4-1.1,14.6,14.6,0,0,0-10.6-6.4c-4.2-.8-7.7,1.4-9.9,1.4s-4.4-1.6-7.7-1.2a14.35,14.35,0,0,0-9.6,8.3,21.46,21.46,0,0,0-1.8,12.1,16.6,16.6,0,0,0,6.9,10.4,13.52,13.52,0,0,0,9.2,3.6c3.2,0,4.7-.9,6.3-2.1a12.63,12.63,0,0,0,4.6-7.4,1.2,1.2,0,0,0-1.3-1.3Z"/></svg> },
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<string>("25");
  const [customAmount, setCustomAmount] = useState<string>("");
  const { toast } = useToast();

  const handleDonation = () => {
    const amountToDonate = selectedAmount === "custom" ? customAmount : selectedAmount;
    if (selectedAmount === "custom" && (!customAmount || parseFloat(customAmount) <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid custom donation amount.",
      });
      return;
    }
    
    // In a real app, this would trigger payment processing.
    toast({
      title: "Thank You!",
      description: `Your generous $${amountToDonate} donation is appreciated. (This is a placeholder action)`,
      action: <Button variant="outline" size="sm" onClick={() => console.log("Undo toast")}>OK</Button>,
    });
    // Optionally reset form
    // setSelectedAmount("25");
    // setCustomAmount("");
  };

  const donationAmounts = [
    { value: "5", label: "$5" },
    { value: "10", label: "$10" },
    { value: "25", label: "$25" },
    { value: "50", label: "$50" },
    { value: "100", label: "$100" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="items-center text-center bg-gradient-to-br from-primary to-primary/80 p-8">
          <Heart className="w-20 h-20 text-primary-foreground mb-4 drop-shadow-lg" />
          <CardTitle className="text-4xl font-bold text-primary-foreground drop-shadow-md">
            Support LinguaLeap
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-primary-foreground/90 max-w-md mx-auto">
            Your contribution empowers us to enhance LinguaLeap and help learners worldwide. Every donation makes a difference.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-8 bg-background">
          <Alert variant="default" className="bg-amber-50 border-amber-400 text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="font-semibold">Important Note</AlertTitle>
            <AlertDescription>
              This page is a UI demonstration for donation functionality. No actual payments are processed.
            </AlertDescription>
          </Alert>

          <div>
            <Label className="text-xl font-semibold text-foreground mb-4 block text-center">
              <DollarSign className="w-6 h-6 inline-block mr-2 text-accent" />
              Choose Your Donation Amount (USD)
            </Label>
            <RadioGroup
              value={selectedAmount}
              onValueChange={setSelectedAmount}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
            >
              {donationAmounts.map((amount) => (
                <Label
                  key={amount.value}
                  htmlFor={`amount-${amount.value}`}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all duration-150 ease-in-out
                                ${selectedAmount === amount.value 
                                  ? 'border-primary ring-2 ring-primary bg-primary/5 shadow-md scale-105' 
                                  : 'border-muted hover:border-primary/70 hover:bg-secondary/20'}`}
                >
                  <RadioGroupItem value={amount.value} id={`amount-${amount.value}`} className="sr-only" />
                  <span className="text-lg font-semibold text-foreground">{amount.label}</span>
                </Label>
              ))}
            </RadioGroup>

            {selectedAmount === "custom" && (
              <div className="mt-6">
                <Label htmlFor="custom-amount-input" className="text-base font-medium text-muted-foreground mb-1 block">Enter Custom Amount (USD):</Label>
                <Input
                  id="custom-amount-input"
                  type="number"
                  placeholder="e.g., 75"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="text-lg py-2.5"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-xl font-semibold text-foreground mb-3 block text-center">
                <CreditCard className="w-6 h-6 inline-block mr-2 text-accent" />
                Supported Payment Methods
            </Label>
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground text-center mb-4">
                We aim to support a wide range of secure payment gateways.
                (Icons below are for visual representation)
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
                {PaymentMethodPlaceholders.map(method => (
                  <div key={method.name} className="flex flex-col items-center gap-1 p-2 border rounded-md bg-background shadow-sm hover:shadow-md transition-shadow min-w-[120px] text-center">
                    {method.icon}
                    <span className="text-xs font-medium text-foreground">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleDonation}
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xl py-7 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            <Heart className="mr-2.5 h-6 w-6" /> Donate Securely
          </Button>

        </CardContent>
        <CardFooter className="flex flex-col items-center p-6 bg-muted/30 border-t">
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            Your support helps us continue developing LinguaLeap and providing valuable language learning tools to everyone. Thank you!
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" /> Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    