"use client";
import React, { useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function SignupFormDemo() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    City: "",
    Country: "",
    Email: "",
    Ethnicity: "",
    Fullname: "",
    Gender: "",
    Password: "",
    Age: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      Age: parseInt(formData.Age), // Convert age to number
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/user/register/", payload);
      
      if (response.data.access_token) {
        Cookies.set("access_token", response.data.access_token, { 
          expires: 7, 
          secure: true 
        });
        router.push("/Dashboard");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Sign Up
      </h2>
      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="Fullname">Full Name</Label>
          <Input
            id="Fullname"
            placeholder="John Doe"
            type="text"
            value={formData.Fullname}
            onChange={handleChange}
          />
        <LabelInputContainer className="mb-4">
          <Label htmlFor="Age">Age</Label>
          <Input
            id="Age"
            placeholder="Age"
            type="number"
            value={formData.Age}
            onChange={handleChange}
          />
        </LabelInputContainer>
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="Email">Email Address</Label>
          <Input
            id="Email"
            placeholder="example@example.com"
            type="Email"
            value={formData.Email}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="Password">Password</Label>
          <Input
            id="Password"
            placeholder="••••••••"
            type="Password"
            value={formData.Password}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="City">City</Label>
          <Input
            id="City"
            placeholder="City"
            type="text"
            value={formData.City}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="Country">Country</Label>
          <Input
            id="Country"
            placeholder="Country"
            type="text"
            value={formData.Country}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="Ethnicity">Ethnicity</Label>
          <Input
            id="Ethnicity"
            placeholder="Ethnicity"
            type="text"
            value={formData.Ethnicity}
            onChange={handleChange}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="Gender">Gender</Label>
          <select
            id="Gender"
            value={formData.Gender}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] relative overflow-hidden"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">Signing Up...</span>
          ) : (
            <>
              Sign up &rarr;
              <BottomGradient />
            </>
          )}
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};
