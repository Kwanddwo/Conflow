"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, ShieldX } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="main-content-height flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg dark:border-red-800">
        <CardContent className="p-8 text-center space-y-6">
          {/* 403 Illustration */}
          <div className="relative">
            <div className="text-8xl font-bold text-red-200 dark:text-red-800 select-none">
              403
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldX className="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-red-900 dark:text-red-100">
              Access Forbidden
            </h1>
            <p className="text-red-700 dark:text-red-300 leading-relaxed">
              Sorry, you don&apos;t have permission to access this resource.
              Please contact an administrator if you believe this is an error.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
