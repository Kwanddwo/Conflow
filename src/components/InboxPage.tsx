"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/server/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  MoreVertical,
  Inbox,
  Clock,
  Search,
  ArchiveRestore,
  CheckCircle,
  XCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

// Types for invitation data
interface InvitationData {
  type: string;
  originalMessage: string;
  conferenceId?: string;
  role?: string;
  status: "PENDING" | "ACCEPTED" | "REFUSED";
  acceptUrl?: string;
  refuseUrl?: string;
}

// Helper function to parse notification message
const parseNotificationMessage = (
  message: string
): { isInvitation: boolean; data?: InvitationData; plainMessage?: string } => {
  try {
    const parsed = JSON.parse(message);
    if (parsed.type === "INVITATION") {
      return { isInvitation: true, data: parsed };
    }
    return { isInvitation: false, plainMessage: message };
  } catch {
    return { isInvitation: false, plainMessage: message };
  }
};

// ✅ Extracted notification item component
const NotificationItem = ({
  notification,
  isArchived = false,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onUnarchive,
  onDelete,
  onRespondToInvitation,
  respondingTo,
}: {
  notification: any;
  isArchived?: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRespondToInvitation?: (
    notificationId: string,
    response: "ACCEPTED" | "REFUSED"
  ) => void;
  respondingTo?: string | null;
}) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  // Parse notification message to check if it's an invitation
  const {
    isInvitation,
    data: invitationData,
    plainMessage,
  } = parseNotificationMessage(notification.message);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs">
            Accepted
          </Badge>
        );
      case "REFUSED":
        return (
          <Badge className="bg-red-100 text-red-800 text-xs">Refused</Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;

    const roleColors = {
      author: "bg-blue-100 text-blue-800",
      reviewer: "bg-green-100 text-green-800",
      chair: "bg-purple-100 text-purple-800",
    };

    const colorClass =
      roleColors[role.toLowerCase() as keyof typeof roleColors] ||
      "bg-gray-100 text-gray-800";

    return (
      <Badge className={`${colorClass} text-xs`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <div
      className={`p-4 hover:bg-muted/50 transition-colors ${
        isArchived
          ? "opacity-75"
          : !notification.isRead
          ? "bg-primary/5 border-l-4 border-l-primary"
          : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {isArchived ? (
            <Archive className="h-4 w-4 text-muted-foreground" />
          ) : notification.isRead ? (
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Mail className="h-4 w-4 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium text-sm leading-5 ${
                isArchived || notification.isRead
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Show invitation badges */}
              {isInvitation && invitationData && (
                <div className="flex items-center gap-1">
                  {getRoleBadge(invitationData.role)}
                  {getStatusBadge(invitationData.status)}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(new Date(notification.createdAt))}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isArchived ? (
                    <DropdownMenuItem
                      onClick={() => onUnarchive(notification.id)}
                    >
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {notification.isRead ? (
                        <DropdownMenuItem
                          onClick={() => onMarkAsUnread(notification.id)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Mark as unread
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <MailOpen className="h-4 w-4 mr-2" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onArchive(notification.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </>
                  )}
                  <Separator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => onDelete(notification.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-1 leading-5">
            {isInvitation && invitationData
              ? invitationData.originalMessage
              : plainMessage || notification.message}
          </p>

          {/* Invitation action buttons */}
          {isInvitation &&
            invitationData &&
            invitationData.status === "PENDING" &&
            onRespondToInvitation && (
              <div className="flex items-center gap-3 mt-3">
                <Button
                  onClick={() =>
                    onRespondToInvitation(notification.id, "ACCEPTED")
                  }
                  disabled={respondingTo === notification.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {respondingTo === notification.id ? "Accepting..." : "Accept"}
                </Button>

                <Button
                  onClick={() =>
                    onRespondToInvitation(notification.id, "REFUSED")
                  }
                  disabled={respondingTo === notification.id}
                  variant="destructive"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {respondingTo === notification.id ? "Refusing..." : "Refuse"}
                </Button>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Awaiting your response
                </div>
              </div>
            )}

          {/* Show status message for responded invitations */}
          {isInvitation &&
            invitationData &&
            invitationData.status !== "PENDING" && (
              <div className="text-sm text-muted-foreground mt-2">
                You have {invitationData.status.toLowerCase()} this invitation.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ✅ Extracted notification list component
const NotificationList = ({
  notifications,
  isArchived = false,
  searchQuery,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onUnarchive,
  onDelete,
  onRespondToInvitation,
  respondingTo,
}: {
  notifications: any[];
  isArchived?: boolean;
  searchQuery: string;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRespondToInvitation?: (
    notificationId: string,
    response: "ACCEPTED" | "REFUSED"
  ) => void;
  respondingTo?: string | null;
}) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {searchQuery.trim() ? (
          <>
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              No {isArchived ? "archived " : ""}notifications match &quot;
              {searchQuery}&quot;. Try a different search term.
            </p>
          </>
        ) : (
          <>
            {isArchived ? (
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
            ) : (
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            )}
            <h3 className="text-lg font-medium mb-2">
              No {isArchived ? "archived " : ""}notifications
            </h3>
            <p className="text-muted-foreground">
              {isArchived
                ? "Notifications you archive will appear here."
                : "You're all caught up! Check back later for new updates."}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isArchived={isArchived}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
            onRespondToInvitation={onRespondToInvitation}
            respondingTo={respondingTo}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default function InboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // ✅ Use tRPC query directly - it handles caching and re-renders efficiently
  const {
    data: notifications = [],
    isLoading,
    error,
  } = trpc.notification.getInbox.useQuery();

  // ✅ Add optimistic updates and cache invalidation
  const utils = trpc.useUtils();

  // ✅ Add invitation response mutation
  const { mutateAsync: respondToInvitation } =
    trpc.notification.respondToInvitation.useMutation({
      onSuccess: (data) => {
        toast.success(
          `Invitation ${data.response.toLowerCase()} successfully!`
        );
        utils.notification.getInbox.invalidate();
        setRespondingTo(null);
      },
      onError: (error) => {
        toast.error(`Failed to respond: ${error.message}`);
        setRespondingTo(null);
      },
    });

  // ✅ Add update notification mutation
  const updateNotificationMutation =
    trpc.notification.updateNotification.useMutation({
      onMutate: async ({ id, ...updates }) => {
        await utils.notification.getInbox.cancel();
        const previousData = utils.notification.getInbox.getData();
        if (previousData) {
          utils.notification.getInbox.setData(
            undefined,
            previousData.map((n) => (n.id === id ? { ...n, ...updates } : n))
          );
        }
        return { previousData };
      },
      onError: (err, variables, context) => {
        if (context?.previousData) {
          utils.notification.getInbox.setData(undefined, context.previousData);
        }
      },
      onSettled: () => {
        utils.notification.getInbox.invalidate();
      },
    });

  // ✅ Handle invitation response
  const handleInvitationResponse = async (
    notificationId: string,
    response: "ACCEPTED" | "REFUSED"
  ) => {
    setRespondingTo(notificationId);
    try {
      await respondToInvitation({
        notificationId,
        response,
      });
    } catch (error) {
      console.error("Failed to respond to invitation:", error);
    }
  };

  // ✅ Simplified action functions
  const markAsRead = (id: string) => {
    updateNotificationMutation.mutate({ id, isRead: true });
  };

  const markAsUnread = (id: string) => {
    updateNotificationMutation.mutate({ id, isRead: false });
  };

  const archiveNotification = (id: string) => {
    updateNotificationMutation.mutate({ id, isArchived: true });
  };

  const deleteNotification = (id: string) => {
    updateNotificationMutation.mutate({ id, isDeleted: true });
  };

  const unarchiveNotification = (id: string) => {
    updateNotificationMutation.mutate({ id, isArchived: false });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead && !n.isArchived && !n.isDeleted)
      .map((n) => n.id);

    // Batch update multiple notifications
    unreadIds.forEach((id) => {
      updateNotificationMutation.mutate({ id, isRead: true });
    });
  };

  // ✅ Memoized filtering (runs only when dependencies change)
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (activeTab === "inbox") {
          return !n.isArchived && !n.isDeleted;
        } else {
          return n.isArchived && !n.isDeleted;
        }
      })
      .filter((n) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
        );
      });
  }, [notifications, activeTab, searchQuery]);

  // ✅ Memoized counts
  const { unreadCount, archivedCount } = useMemo(
    () => ({
      unreadCount: notifications.filter(
        (n) => !n.isRead && !n.isArchived && !n.isDeleted
      ).length,
      archivedCount: notifications.filter((n) => n.isArchived && !n.isDeleted)
        .length,
    }),
    [notifications]
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-6 w-4xl">
      <Card className="px-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Inbox className="h-6 w-6" />
              <CardTitle className="text-2xl">Notifications</CardTitle>
            </div>
            {unreadCount > 0 && activeTab === "inbox" && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archived
              {archivedCount > 0 && (
                <Badge variant="outline" className="ml-1">
                  {archivedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${
                activeTab === "inbox" ? "inbox" : "archived"
              } notifications...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          <TabsContent value="inbox" className="mt-0">
            <CardContent className="p-0">
              <NotificationList
                notifications={filteredNotifications}
                isArchived={false}
                searchQuery={searchQuery}
                onMarkAsRead={markAsRead}
                onMarkAsUnread={markAsUnread}
                onArchive={archiveNotification}
                onUnarchive={unarchiveNotification}
                onDelete={deleteNotification}
                onRespondToInvitation={handleInvitationResponse}
                respondingTo={respondingTo}
              />
            </CardContent>
          </TabsContent>

          <TabsContent value="archived" className="mt-0">
            <CardContent className="p-0">
              <NotificationList
                notifications={filteredNotifications}
                isArchived={true}
                searchQuery={searchQuery}
                onMarkAsRead={markAsRead}
                onMarkAsUnread={markAsUnread}
                onArchive={archiveNotification}
                onUnarchive={unarchiveNotification}
                onDelete={deleteNotification}
                onRespondToInvitation={handleInvitationResponse}
                respondingTo={respondingTo}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
