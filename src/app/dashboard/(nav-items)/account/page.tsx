"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Building, Globe } from "lucide-react";

export default function AccountPage() {
  const userInfo = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@university.edu",
    affiliation: "Stanford University",
    country: "United States",
  };

  const handleEdit = () => {
    console.log("Edit account clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-[#e2e8f0] shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-[#0f172a]">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#334155]">
                    First Name
                  </p>
                  <p className="text-base text-[#0f172a]">
                    {userInfo.firstName}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#334155]">
                    Last Name
                  </p>
                  <p className="text-base text-[#0f172a]">
                    {userInfo.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#334155]">Email</p>
                  <p className="text-base text-[#0f172a]">{userInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Affiliation */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#334155]">
                    Affiliation
                  </p>
                  <p className="text-base text-[#0f172a]">
                    {userInfo.affiliation}
                  </p>
                </div>
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#334155]">Country</p>
                  <p className="text-base text-[#0f172a]">{userInfo.country}</p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="pt-4">
              <Button
                onClick={handleEdit}
                className="w-full bg-[#1e293b] hover:bg-[#334155] text-white py-3 text-base font-medium"
              >
                Edit Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
