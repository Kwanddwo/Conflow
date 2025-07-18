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
import { Search, Check } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users } = trpc.user.getAll.useQuery();
  const { data: session } = useSession();

  const filteredUsers = users?.filter((user) => {
    const isCurrentUser = user.id !== session?.user.id;
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return isCurrentUser && matchesSearch;
  });

  const handleUserSelect = (user: ChosenUser) => {
    onUserSelect(user);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle>Assign to someone</DialogTitle>
          <DialogDescription>
            Search for a user to assign this to.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type a username, full name, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          <div className="space-y-1">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
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
            {filteredUsers?.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No users found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
