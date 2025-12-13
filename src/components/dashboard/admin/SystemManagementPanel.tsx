import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Mail, Search, Shield } from "lucide-react";
import { useSystemManagement } from "../hooks/useSystemManagement";

const SystemManagementPanel = () => {
  const {
    systemQuery,
    manageRole,
    confirmSubscriber,
    unsubscribeSubscriber,
    deleteSubscriber,
    exportSubscribers,
    syncConvertKit,
  } = useSystemManagement();

  const [roleFilter, setRoleFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState("all");
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const users = systemQuery.data?.users || [];
    return users.filter((user: any) => {
      const matchesSearch =
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase());

      const roles = user.roles || [];
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "no-role" && roles.length === 0) ||
        roles.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, systemQuery.data, userSearchQuery]);

  const filteredSubscribers = useMemo(() => {
    const subscribers = systemQuery.data?.subscribers || [];
    return subscribers.filter((subscriber: any) => {
      const matchesSearch = subscriber.email?.toLowerCase().includes(subscriberSearchQuery.toLowerCase());
      const matchesStatus =
        subscriberStatusFilter === "all" ||
        (subscriberStatusFilter === "confirmed" && subscriber.confirmed && !subscriber.unsubscribed) ||
        (subscriberStatusFilter === "pending" && !subscriber.confirmed && !subscriber.unsubscribed) ||
        (subscriberStatusFilter === "unsubscribed" && subscriber.unsubscribed);
      return matchesSearch && matchesStatus;
    });
  }, [subscriberSearchQuery, subscriberStatusFilter, systemQuery.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          System Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {systemQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading system data...</p>
          </div>
        ) : (
          <Tabs defaultValue="user-roles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user-roles">User Role Management</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter Management</TabsTrigger>
            </TabsList>

            <TabsContent value="user-roles" className="space-y-4 mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant={roleFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setRoleFilter("all")}>
                    All Users
                  </Button>
                  <Button variant={roleFilter === "editor" ? "default" : "outline"} size="sm" onClick={() => setRoleFilter("editor")}>
                    Editors
                  </Button>
                  <Button variant={roleFilter === "admin" ? "default" : "outline"} size="sm" onClick={() => setRoleFilter("admin")}>
                    Admins
                  </Button>
                  <Button
                    variant={roleFilter === "no-role" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter("no-role")}
                  >
                    No Role
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="grid gap-4 p-4 border-b font-semibold bg-muted" style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 2fr" }}>
                  <div>Email</div>
                  <div>Full Name</div>
                  <div>Roles</div>
                  <div>Created</div>
                  <div>Actions</div>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No users found</div>
                ) : (
                  filteredUsers.map((user: any) => (
                    <div key={user.id} className="grid gap-4 p-4 border-b items-center" style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 2fr" }}>
                      <div className="text-sm">{user.email || "No email"}</div>
                      <div className="text-sm">{user.full_name || "No name"}</div>
                      <div className="flex gap-1 flex-wrap">
                        {(user.roles || []).length === 0 ? (
                          <Badge variant="secondary">No Role</Badge>
                        ) : (
                          (user.roles || []).map((role: string) => (
                            <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>
                              {role}
                            </Badge>
                          ))
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => manageRole.mutate({ userId: user.id, role: "editor", action: (user.roles || []).includes("editor") ? "remove" : "add" })}
                        >
                          {(user.roles || []).includes("editor") ? "Remove Editor" : "Add Editor"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => manageRole.mutate({ userId: user.id, role: "admin", action: (user.roles || []).includes("admin") ? "remove" : "add" })}
                        >
                          {(user.roles || []).includes("admin") ? "Remove Admin" : "Add Admin"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Total Users:</strong> {systemQuery.data?.users?.length || 0} |
                  <strong className="ml-2">Editors:</strong> {systemQuery.data?.users?.filter((u: any) => u.roles?.includes("editor")).length || 0} |
                  <strong className="ml-2">Admins:</strong> {systemQuery.data?.users?.filter((u: any) => u.roles?.includes("admin")).length || 0}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="newsletter" className="space-y-4 mt-4">
              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email..."
                    value={subscriberSearchQuery}
                    onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={subscriberStatusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSubscriberStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={subscriberStatusFilter === "confirmed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSubscriberStatusFilter("confirmed")}
                  >
                    Confirmed
                  </Button>
                  <Button
                    variant={subscriberStatusFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSubscriberStatusFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={subscriberStatusFilter === "unsubscribed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSubscriberStatusFilter("unsubscribed")}
                  >
                    Unsubscribed
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={exportSubscribers}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => syncConvertKit.mutate()}
                  disabled={syncConvertKit.isPending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Sync ConvertKit
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-6 gap-4 p-4 border-b font-semibold bg-muted">
                  <div>Email</div>
                  <div>Status</div>
                  <div>Source</div>
                  <div>Subscribed</div>
                  <div>ConvertKit</div>
                  <div>Actions</div>
                </div>
                {filteredSubscribers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No subscribers found</div>
                ) : (
                  filteredSubscribers.map((subscriber: any) => (
                    <div key={subscriber.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
                      <div className="text-sm">{subscriber.email}</div>
                      <div>
                        {subscriber.unsubscribed ? (
                          <Badge variant="destructive">Unsubscribed</Badge>
                        ) : subscriber.confirmed ? (
                          <Badge variant="default">Confirmed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                      <div className="text-sm">{subscriber.source || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">
                        {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : ""}
                      </div>
                      <div>
                        {subscriber.convertkit_synced ? (
                          <Badge variant="outline">Synced</Badge>
                        ) : (
                          <Badge variant="secondary">Not Synced</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unsubscribeSubscriber.mutate(subscriber.id)}
                          disabled={!subscriber.confirmed || subscriber.unsubscribed}
                          className="px-2 py-1 h-7 text-xs"
                        >
                          Unsub
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSubscriber.mutate(subscriber.id)}
                          disabled={!subscriber.unsubscribed}
                          className="px-2 py-1 h-7 text-xs"
                        >
                          Del
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Total:</strong> {systemQuery.data?.subscribers?.length || 0} |
                  <strong className="ml-2">Confirmed:</strong> {(systemQuery.data?.subscribers || []).filter((s: any) => s.confirmed && !s.unsubscribed).length} |
                  <strong className="ml-2">Pending:</strong> {(systemQuery.data?.subscribers || []).filter((s: any) => !s.confirmed && !s.unsubscribed).length} |
                  <strong className="ml-2">Unsubscribed:</strong> {(systemQuery.data?.subscribers || []).filter((s: any) => s.unsubscribed).length}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemManagementPanel;
