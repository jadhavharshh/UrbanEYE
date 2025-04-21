import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import UserTypeCard from "@/components/user-type-card";
import { useSignUp, useClerk } from "@clerk/clerk-react";
import MoonLoader from "react-spinners/MoonLoader";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SEND_SIGNUP_DATA } from "@/utils/constants";

// Add the additional onSwitchForm prop to the component props
interface SignUpFormProps {
  onSwitchForm?: () => void;
}

const SignUpForm = ({ onSwitchForm }: SignUpFormProps) => {
  // step 1: choose user type, step 2: fill details, step 3: OTP verification
  const [step, setStep] = useState<number>(1);
  // role now becomes either "citizen" for a regular user or "admin" for an admin account.
  const [role, setRole] = useState<"citizen" | "admin" | "">("");
  const [value, setValue] = useState<string>(""); // OTP value
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for citizen form (UserSchema)
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // State for admin form (AdminSchema)
  const [adminData, setAdminData] = useState({
    fullName: "",
    email: "",
    clerkUserId: "",
    password: "",
  });

  // Get Clerk signUp and clerk resources
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (role === "citizen") {
      setUserData({
        ...userData,
        [name]: value,
      });
    } else if (role === "admin") {
      setAdminData({
        ...adminData,
        [name]: value,
      });
    }
  };

  const handleRegistration = async () => {
    if (!signUp) {
      console.error("SignUp resource is not ready");
      return;
    }

    setIsLoading(true); // Start loading

    const emailToRegister =
      role === "citizen" ? userData.email : adminData.email;
    const passwordToRegister =
      role === "citizen" ? userData.password : adminData.password;

    try {
      await signUp.create({
        emailAddress: emailToRegister,
        password: passwordToRegister,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(3); // Only advance to step 3 if registration is successful
    } catch (error: any) {
      // Display meaningful error messages
      console.error("Sign up error", error);

      // Extract error message from Clerk error object
      let errorMessage = "An error occurred during sign up.";

      if (error.errors && error.errors.length > 0) {
        // Get the first error message
        errorMessage = error.errors[0].message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error using toast
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  // In step 3, verifies the OTP and sends the additional signup data to the backend.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signUp) {
      console.error("SignUp resource is not ready");
      return;
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: value,
      });
      if (completeSignUp.status === "complete") {
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        // Get the Clerk user id from the sign-up response
        const clerkUserId = completeSignUp.createdUserId;
        if (role === "admin") {
          const { password, ...adminPayload } = adminData;
          await apiClient.post(SEND_SIGNUP_DATA, {
            ...adminPayload,
            role,
            clerkUserId,
          });
        } else if (role === "citizen") {
          const { password, ...userPayload } = userData;
          await apiClient.post(SEND_SIGNUP_DATA, {
            ...userPayload,
            role,
            clerkUserId,
          });
        }
        console.log("User signed up:", completeSignUp);
        navigate("/dashboard");
        toast.success("Account created successfully!");
      } else {
        alert("OTP verification did not complete. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error", error);
    }
  };

  return (
    <form
      onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
      className={cn("flex flex-col gap-6")}
    >
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-start md:text-3xl font-bold">
              Create an account
            </h2>
            <p className="text-iridium md:text-sm">
              Tell us about yourself! What kind of account do you need?
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <UserTypeCard
              setUserType={setRole}
              title="User"
              text="I want a regular account."
              userType={role}
              value="citizen"
            />
            <UserTypeCard
              setUserType={setRole}
              title="Admin"
              text="I need an administrator account."
              userType={role}
              value="admin"
            />
          </div>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!role}
            className="w-full"
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && role === "citizen" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-start md:text-3xl font-bold">
              User Details
            </h2>
            <p className="text-iridium md:text-sm">
              Provide your details for a regular user account.
            </p>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="user-fullName">Full Name</Label>
            <Input
              id="user-fullName"
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={userData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              name="password"
              placeholder="Password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
          // For citizen form
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleRegistration}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <MoonLoader color="#000" size={20}  />
                  <span>Processing...</span>
                </span>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && role === "admin" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-start md:text-3xl font-bold">
              Admin Details
            </h2>
            <p className="text-iridium md:text-sm">
              Provide your details for an admin account.
            </p>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="admin-fullName">Full Name</Label>
            <Input
              id="admin-fullName"
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={adminData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={adminData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="admin-clerkUserId">Clerk User ID</Label>
            <Input
              id="admin-clerkUserId"
              type="text"
              name="clerkUserId"
              placeholder="Your Clerk User ID"
              value={adminData.clerkUserId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              name="password"
              placeholder="Password"
              value={adminData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleRegistration}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <MoonLoader color="#000" size={20} />
                </span>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-start">
            <h1 className="text-2xl font-bold">Verify Your Account</h1>
            <p className="text-sm text-muted-foreground">
              Enter the one-time password sent to your email to verify your account details.
            </p>
          </div>
          <div className="space-y-2 flex flex-col items-start gap-2">
            <InputOTP maxLength={6} value={value} onChange={(value: string) => setValue(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="text-start text-sm">
              {value === "" ? (
                <>Enter your one-time password.</>
              ) : (
                <>You entered: {value}</>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        {onSwitchForm && (
          <span
            onClick={onSwitchForm}
            className="text-blue-500 underline underline-offset-4 cursor-pointer hover:text-blue-600"
          >
            Login
          </span>
        )}
      </div>
    </form>
  );
};

export { SignUpForm };