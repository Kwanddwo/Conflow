"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUpForm() {
  return (
    <div className="min-h-[65vh] bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[#0f172a] font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[#0f172a] font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#0f172a] font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0f172a] font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
            />
            <p className="text-[#94a3b8] text-sm">
              Make sure your password has atleast 8 characters, and is a mix of
              lowercase characters, uppercase characters and numbers.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-[#0f172a] font-medium">
              Country
            </Label>
            <Select>
              <SelectTrigger className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]">
                <SelectValue placeholder="Country/region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliation" className="text-[#0f172a] font-medium">
              Affiliation
            </Label>
            <Input
              id="affiliation"
              type="text"
              placeholder="Affiliation"
              className="w-full px-4 py-3 border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:border-[#64748b] focus:ring-1 focus:ring-[#64748b]"
            />
            <p className="text-[#94a3b8] text-sm">
              Enter the laboratory you are associated with.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0f172a] hover:bg-[#0f172a]/90 text-white py-3 rounded-lg font-medium"
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
}
