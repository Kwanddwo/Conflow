import { User } from "@prisma/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Search, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/server/client";
import { useSession } from "next-auth/react";

type ChosenUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "country" | "affiliation"
>;

export default function UserChooser({
  onUserSelect,
  selectedUser,
}: {
  onUserSelect: (user: ChosenUser) => void;
  selectedUser?: ChosenUser;
}) {
  const [open, setOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState<string>("");
  const { data: session } = useSession();

  // Only run query if searchedEmail is set
  const {
    data: users,
    isLoading,
    error,
  } = trpc.user.getUsersByEmail.useQuery(
    { email: searchedEmail },
    {
      enabled: !!searchedEmail,
    }
  );

  const filteredUsers = users?.filter((user) => user.id !== session?.user.id);

  const handleEmailSearch = () => {
    setSearchedEmail(emailInput.trim());
  };

  const handleRetrySearch = () => {
    if (emailInput.trim()) {
      setSearchedEmail(emailInput.trim());
    }
  };

  const handleUserSelect = (user: ChosenUser) => {
    onUserSelect(user);
    setOpen(false);
    setEmailInput("");
    setSearchedEmail("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEmailInput("");
      setSearchedEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="justify-start">
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {selectedUser.firstName[0]}
                  {selectedUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span>
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
            </div>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Choose User
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add an author</DialogTitle>
          <DialogDescription>
            Enter an email to search for a user to add as an author
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Search */}
          <div className="space-y-2">
            <Label>Enter Email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type user email"
                type="email"
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

          {/* User Results */}
          {filteredUsers && filteredUsers.length > 0 && !error && (
            <div className="max-h-60 overflow-y-auto border border-border rounded-md bg-background">
              <div className="p-1">
                {filteredUsers.map((user) => (
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
                    {selectedUser?.id === user.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchedEmail &&
            filteredUsers?.length === 0 &&
            !isLoading &&
            !error && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No user found with that email.
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
