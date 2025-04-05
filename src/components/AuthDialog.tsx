import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { Context } from '../main';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

// Email validation schema with detailed error messages
const emailSchema = z.string()
  .min(1, "Email is required")
  .email({ message: "Please enter a valid email address (example@domain.com)" })
  .refine(email => {
    const parts = email.split('@');
    return parts.length === 2 && parts[1].includes('.');
  }, { message: "Email must contain a domain with a period (example@domain.com)" });

// Password validation schema
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine(password => /[a-z]/.test(password), { message: "Password must contain at least one lowercase letter" })
  .refine(password => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter" })
  .refine(password => /[!@#$%^&*(),.?":{}|<>]/.test(password), { message: "Password must contain at least one special character" });

// Registration form schema
const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, { message: "Please enter your full name" }),
  phoneNumber: z.string().min(6, { message: "Please enter a valid phone number" }),
  purpose: z.enum(['buy', 'sell', 'rent', 'collaborate', 'curious']),
  acceptTerms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions" })
});

// Login form schema
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Please enter your password" }),
});

export default function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { toast } = useToast();
  const { userStore, docsStore } = useContext(Context)!;

  // Состояния для модального окна документов
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const handleDocOpen = async (docType: 'terms' | 'privacy' | 'cookie', title: string) => {
    try {
      await docsStore.fetchDocument(docType);
      const docRecord = docsStore.docs[docType];
      if (docRecord && docRecord.path) {
        const url = `${import.meta.env.VITE_SERVER_URL}${docRecord.path}`;
        const response = await fetch(url);
        const text = await response.text();
        setModalText(text);
        setModalTitle(title);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  // Обновляем активную вкладку при изменении defaultTab
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Форма логина
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  // Форма регистрации
  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: "", password: "", fullName: "", phoneNumber: "", purpose: "buy", acceptTerms: false },
    mode: "onBlur",
  });

  // Валидация пароля
  const passwordValue = registrationForm.watch("password") || "";
  const showPasswordValidation = passwordValue.length > 0;
  const lowercaseValid = /[a-z]/.test(passwordValue);
  const uppercaseValid = /[A-Z]/.test(passwordValue);
  const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);
  const lengthValid = passwordValue.length >= 8;

  // Обработка логина
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    await userStore.loginUser(values.email, values.password)
      .then(() => {
        toast({
          title: "Logged in",
          description: "Welcome back to Business Unit Club.",
        });
      })
      .catch((error: any) => {
        let message = "Invalid credentials or server error.";
        if (error.response && error.response.data && error.response.data.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        });
      }).finally(() => {
        setTimeout(() => onOpenChange(false), 2000);
      });
  };

  // Обработка регистрации
  const onRegisterSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {
      await userStore.registerUser(
        values.email,
        values.password,
        values.fullName,
        values.phoneNumber,
        values.purpose
      );
      toast({
        title: "Account created",
        description: "Welcome to Business Unit Club. Your request will be reviewed by our team.",
      });
      setTimeout(() => onOpenChange(false), 1500);
    } catch (error: any) {
      let message = "Invalid credentials or server error.";
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Обработка переключения вкладок
  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "register");
    if (value === "login") {
      registrationForm.reset();
    } else {
      loginForm.reset();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-lg bg-background/95 max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-display text-2xl">Member Access</DialogTitle>
            <DialogDescription>
              Login or register to access exclusive property listings and services.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <ScrollArea className="pr-4 overflow-y-auto" style={{ maxHeight: "calc(70vh - 160px)" }}>
              <TabsContent value="login" className="mt-0 space-y-4 pb-2">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input placeholder="your@email.com" error={!!loginForm.formState.errors.email} {...field} />
                            </FormControl>
                            {loginForm.formState.errors.email && (
                              <Mail className="h-5 w-5 absolute right-3 top-2.5 text-destructive" />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Password</FormLabel>
                            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                      {loginForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="mt-0 pb-2">
                <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registrationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input placeholder="your@email.com" error={!!registrationForm.formState.errors.email} {...field} />
                            </FormControl>
                            {registrationForm.formState.errors.email && (
                              <Mail className="h-5 w-5 absolute right-3 top-2.5 text-destructive" />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          {showPasswordValidation && (
                            <div className="mt-2 space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                {lengthValid ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-gray-400" />
                                )}
                                <span className={lengthValid ? "text-green-500" : "text-gray-500"}>
                                  At least 8 characters
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {lowercaseValid ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-gray-400" />
                                )}
                                <span className={lowercaseValid ? "text-green-500" : "text-gray-500"}>
                                  One lowercase letter
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {uppercaseValid ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-gray-400" />
                                )}
                                <span className={uppercaseValid ? "text-green-500" : "text-gray-500"}>
                                  One uppercase letter
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {specialCharValid ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-gray-400" />
                                )}
                                <span className={specialCharValid ? "text-green-500" : "text-gray-500"}>
                                  One special character
                                </span>
                              </div>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+34 600 123 456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How will we help you?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="buy">I want to buy</SelectItem>
                              <SelectItem value="sell">I want to sell</SelectItem>
                              <SelectItem value="rent">I want to rent</SelectItem>
                              <SelectItem value="collaborate">I want to collaborate</SelectItem>
                              <SelectItem value="curious">I am just curious</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I accept the{' '}
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDocOpen('terms', 'Terms & Conditions');
                                }}
                                className="text-primary hover:underline"
                              >
                                Terms & Conditions
                              </a>{' '}
                              including the{' '}
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDocOpen('privacy', 'Privacy Policy');
                                }}
                                className="text-primary hover:underline"
                              >
                                Privacy Policy
                              </a>.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={registrationForm.formState.isSubmitting}>
                      {registrationForm.formState.isSubmitting ? "Creating account..." : "Create account"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-2">
                      All registrations are subject to approval.
                    </p>
                  </form>
                </Form>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription style={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>
            {modalText}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setModalOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
