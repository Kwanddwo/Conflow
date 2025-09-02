import { User } from "@prisma/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, X, Send, AlertCircle } from "lucide-react";
import { trpc } from "@/server/client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type ChosenUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "country" | "affiliation"
>;

type UserRole = "author" | "reviewer" | "chair";

export default function NewParticipant() {
  const [open, setOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<ChosenUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { conferenceId } = useParams<{ conferenceId: string }>();
  const { data: session } = useSession();

  // Only run query if searchedEmail is set
  const { data, isLoading, error } = trpc.user.getParticipantUsers.useQuery(
    { conferenceId, email: searchedEmail },
    {
      enabled: !!searchedEmail && !!conferenceId,
    }
  );

  const conference = data?.conference;
  const users = data?.users;

  const {
    mutateAsync: sendInviteNotificationMutation,
    isPending: isSendingNotification,
  } = trpc.notification.sendInviteNotification.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  const handleEmailSearch = () => {
    setSearchedEmail(emailInput.trim());
    setSelectedUser(null);
    setSelectedRole(null);
  };

  const handleUserSelect = (user: ChosenUser) => {
    setSelectedUser(user);
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
    setSelectedRole(null);
  };

  const handleInvite = async () => {
    if (selectedUser && selectedRole && conferenceId) {
      try {
        await sendInviteNotificationMutation({
          userId: selectedUser.id,
          title: `Conference Invitation - ${
            selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
          } Role`,
          message: `You have been invited to participate as a ${selectedRole} in ${conference?.title} (${conference?.acronym}). Please review the invitation and respond accordingly.`,
          conferenceId: conferenceId,
          role: selectedRole,
        });

        setSelectedUser(null);
        setSelectedRole(null);
        setEmailInput("");
        setSearchedEmail("");
        setOpen(false);
      } catch (error) {
        console.error("Failed to send invitation:", error);
      }
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "reviewer":
        return "bg-green-100 text-green-800 border-green-200";
      case "chair":
        return "bg-violet-100 text-violet-800 border-violet-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleRetrySearch = () => {
    if (emailInput.trim()) {
      setSearchedEmail(emailInput.trim());
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEmailInput("");
      setSearchedEmail("");
      setSelectedUser(null);
      setSelectedRole(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Add a New Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Enter an email to search for a user and assign them a role in this
            conference.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Search */}
          <div className="space-y-2">
            <Label>Enter Email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type user email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
              />
              <Button
                onClick={handleEmailSearch}
                disabled={!emailInput.trim()}
                variant="secondary"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && searchedEmail && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          )}

          {/* Error State */}
          {error && searchedEmail && !isLoading && (
            <div className="p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Search failed</span>
              </div>
              <p className="text-xs text-muted-foreground">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetrySearch}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* User Selection */}
          {users && users.length > 0 && !selectedUser && !error && (
            <div className="max-h-40 overflow-y-auto border border-border rounded-md bg-background">
              <div className="p-1">
                {users
                  .filter((user) => user.id !== session?.user.id)
                  .map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchedEmail && users?.length === 0 && !isLoading && !error && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No user found with that email.
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm bg-muted text-muted-foreground">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveUser}
                className="h-6 w-6 p-0 hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Assign Role</Label>
            <Select
              value={selectedRole || ""}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              disabled={!selectedUser}
            >
              <SelectTrigger className={!selectedUser ? "opacity-50" : ""}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Reviewer
                  </div>
                </SelectItem>
                <SelectItem value="chair">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                    Chair
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Role Badge */}
          {selectedRole && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Selected role:
              </span>
              <Badge className={getRoleBadgeColor(selectedRole)}>
                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={!selectedUser || !selectedRole || isSendingNotification}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSendingNotification
              ? "Sending Invitation..."
              : `Invite as ${selectedRole || "..."}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
