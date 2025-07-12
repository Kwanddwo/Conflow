"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/server/client";
import { User, Mail, Building, Globe } from "lucide-react";
import { getName } from "country-list";

export default function AccountPage() {
  const { data: user, isPending, error } = trpc.user.getProfile.useQuery();
  if (isPending) {
    return (
      <div className="main-content-height flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="main-content-height flex items-center justify-center">
        <p className="text-destructive text-lg font-semibold">
          Error: {error.message}
        </p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="main-content-height flex items-center justify-center">
        <p className="text-muted-foreground text-lg font-semibold">
          No user data found.
        </p>
      </div>
    );
  }
  const handleEdit = () => {
    console.log("Edit account clicked");
  };

  return (
    <div className="main-content-height bg-muted/50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    First Name
                  </p>
                  <p className="text-base text-foreground">{user.firstName}</p>
                </div>
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </p>
                  <p className="text-base text-foreground">{user.lastName}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base text-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Affiliation */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Affiliation
                  </p>
                  <p className="text-base text-foreground">{user.affiliation}</p>
                </div>
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Country</p>
                  <p className="text-base text-foreground">
                    {getName(user.country)}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="pt-4">
              <Button
                onClick={handleEdit}
                className="w-full py-3 text-base font-medium"
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
