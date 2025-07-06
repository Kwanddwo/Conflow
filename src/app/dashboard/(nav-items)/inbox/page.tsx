"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, AlertCircle, Users, User } from "lucide-react";

interface InboxItem {
  id: string;
  alert: string;
  conference: string;
  sender: string;
}

const sampleData: InboxItem[] = [
  {
    id: "1",
    alert: "Meeting reminder: Q4 Planning Session",
    conference: "Executive Board Meeting",
    sender: "Sarah Johnson",
  },
  {
    id: "2",
    alert: "New participant joined",
    conference: "Development Team Standup",
    sender: "Mike Chen",
  },
  {
    id: "3",
    alert: "Conference room changed",
    conference: "Marketing Review",
    sender: "Emily Davis",
  },
  {
    id: "4",
    alert: "Document shared: Project Timeline",
    conference: "Project Alpha Kickoff",
    sender: "David Wilson",
  },
  {
    id: "5",
    alert: "Recording available",
    conference: "All Hands Meeting",
    sender: "Lisa Anderson",
  },
  {
    id: "6",
    alert: "Action items assigned",
    conference: "Sprint Planning",
    sender: "Tom Rodriguez",
  },
];

export default function InboxPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = sampleData.filter(
    (item) =>
      item.alert.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.conference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-content-height bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">
            Manage your alerts and conference notifications
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by alert, conference, or sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}{" "}
          found
        </div>

        {/* Inbox Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Alert
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{item.alert}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Conference
                        </span>
                      </div>
                      <p className="text-gray-700">{item.conference}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Sender
                        </span>
                      </div>
                      <p className="text-gray-700">{item.sender}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
