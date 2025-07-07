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
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function InboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  // ✅ Use tRPC query directly - it handles caching and re-renders efficiently
  const {
    data: notifications = [],
    isLoading,
    error,
  } = trpc.notification.getInbox.useQuery();

  // ✅ Add optimistic updates and cache invalidation
  const utils = trpc.useUtils();

  const updateNotificationMutation =
    trpc.notification.updateNotification.useMutation({
      // Optimistic update
      onMutate: async ({ id, ...updates }) => {
        // Cancel outgoing refetches
        await utils.notification.getInbox.cancel();

        // Snapshot previous value
        const previousData = utils.notification.getInbox.getData();

        // Optimistically update
        if (previousData) {
          utils.notification.getInbox.setData(
            undefined,
            previousData.map((n) => (n.id === id ? { ...n, ...updates } : n))
          );
        }

        return { previousData };
      },

      // On error, rollback
      onError: (err, variables, context) => {
        if (context?.previousData) {
          utils.notification.getInbox.setData(undefined, context.previousData);
        }
      },

      // Always refetch after success or error
      onSettled: () => {
        utils.notification.getInbox.invalidate();
      },
    });

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

  // Filter notifications based on active tab and search query
  const displayNotifications = filteredNotifications;

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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
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
              {displayNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {searchQuery.trim() ? (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No results found
                      </h3>
                      <p className="text-muted-foreground">
                        No notifications match "{searchQuery}". Try a different
                        search term.
                      </p>
                    </>
                  ) : (
                    <>
                      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No notifications
                      </h3>
                      <p className="text-muted-foreground">
                        {
                          "You're all caught up! Check back later for new updates."
                        }
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {displayNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 transition-colors ${
                          !notification.isRead
                            ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {notification.isRead ? (
                              <MailOpen className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                className={`font-medium text-sm leading-5 ${
                                  !notification.isRead
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(
                                    new Date(notification.createdAt)
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {notification.isRead ? (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          markAsUnread(notification.id)
                                        }
                                      >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Mark as unread
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                      >
                                        <MailOpen className="h-4 w-4 mr-2" />
                                        Mark as read
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() =>
                                        archiveNotification(notification.id)
                                      }
                                    >
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archive
                                    </DropdownMenuItem>
                                    <Separator className="my-1" />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
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
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="archived" className="mt-0">
            <CardContent className="p-0">
              {displayNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {searchQuery.trim() ? (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No results found
                      </h3>
                      <p className="text-muted-foreground">
                        No archived notifications match "{searchQuery}". Try a
                        different search term.
                      </p>
                    </>
                  ) : (
                    <>
                      <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No archived notifications
                      </h3>
                      <p className="text-muted-foreground">
                        Notifications you archive will appear here.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {displayNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-muted/50 transition-colors opacity-75"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium text-sm leading-5 text-muted-foreground">
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(
                                    new Date(notification.createdAt)
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        unarchiveNotification(notification.id)
                                      }
                                    >
                                      <ArchiveRestore className="h-4 w-4 mr-2" />
                                      Unarchive
                                    </DropdownMenuItem>
                                    <Separator className="my-1" />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
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
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
