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
import { Search, Plus, X, Send } from "lucide-react";
import { trpc } from "@/server/client";
import { useSession } from "next-auth/react";

type ChosenUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "country" | "affiliation"
>;

type UserRole = "author" | "reviewer" | "chair";


export default function NewParticipant() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChosenUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
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
    setSelectedUser(user);
    setSearchQuery("");
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
    setSelectedRole(null);
  };

  const handleInvite = () => {
    if (selectedUser && selectedRole) {
      setSelectedUser(null);
      setSelectedRole(null);
      setOpen(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "author":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "reviewer":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "chair":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Add a New Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Search for a user and assign them a role in this conference.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Select User</Label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {selectedUser.firstName[0]}
                      {selectedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveUser}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
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

                <div className="max-h-40 overflow-y-auto border rounded-md">
                  <div className="p-1">
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
                      </div>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        {searchQuery
                          ? "No users found"
                          : "Start typing to search users"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

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
                <SelectItem value="author">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Author
                  </div>
                </SelectItem>
                <SelectItem value="reviewer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Reviewer
                  </div>
                </SelectItem>
                <SelectItem value="chair">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Chair
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Role Badge */}
          {selectedRole && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Selected role:</span>
              <Badge className={getRoleBadgeColor(selectedRole)}>
                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={!selectedUser || !selectedRole}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            Invite as {selectedRole || "..."}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
