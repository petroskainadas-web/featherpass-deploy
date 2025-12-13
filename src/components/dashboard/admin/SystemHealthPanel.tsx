import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemHealth, HealthIssue } from "../hooks/useSystemHealth";
import { Loader2, AlertTriangle } from "lucide-react";

const statusColor = (status?: string) => {
  if (status === "healthy") return "bg-green-500";
  if (status === "warning") return "bg-yellow-500";
  return "bg-red-500";
};

const IssuesList = ({ issues }: { issues?: HealthIssue[] }) => {
  if (!issues || issues.length === 0) return null;
  
  return (
    <div className="mt-4 pt-4 border-t space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
        <AlertTriangle className="w-4 h-4" />
        Possible Issues:
      </div>
      {issues.map((issue, idx) => (
        <div key={idx} className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
          {issue.message}
        </div>
      ))}
    </div>
  );
};

const SystemHealthPanel = () => {
  const healthQuery = useSystemHealth();
  const systemHealth = healthQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-muted-foreground">System status and pre-diagnosis</p>
        </div>
        <Button onClick={() => healthQuery.refetch()} disabled={healthQuery.isFetching}>
          {healthQuery.isFetching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Run Health Check
        </Button>
      </div>

      {healthQuery.isFetching ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Running health check...</p>
        </div>
      ) : systemHealth ? (
        <>
          <Card className={`border-2 ${
            systemHealth.overallStatus === "healthy"
              ? "border-green-500"
              : systemHealth.overallStatus === "warning"
                ? "border-yellow-500"
                : "border-red-500"
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${statusColor(systemHealth.overallStatus)}`}></div>
                Overall System Status: {systemHealth.overallStatus ? systemHealth.overallStatus[0].toUpperCase() + systemHealth.overallStatus.slice(1) : "N/A"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Last checked: {systemHealth.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : "N/A"}
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor(systemHealth.database?.status)}`}></div>
                  Database Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{systemHealth.database?.totalRecords ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Table Breakdown:</div>
                  {Object.entries(systemHealth.database?.tableBreakdown || {}).map(([table, count]) => (
                    <div key={table} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{table}:</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Recent Activity (24h): </span>
                  <span className="font-medium">{systemHealth.database?.recentActivity24h ?? 0}</span>
                </div>
                <IssuesList issues={systemHealth.database?.issues} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor(systemHealth.storage?.status)}`}></div>
                  Storage Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{systemHealth.storage?.totalFiles ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Total Files</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Bucket Breakdown:</div>
                  {Object.entries(systemHealth.storage?.bucketBreakdown || {}).map(([bucket, count]) => (
                    <div key={bucket} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{bucket}:</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Total Storage: </span>
                  <span className="font-medium">{systemHealth.storage?.totalStorageMB ?? 0} MB</span>
                </div>
                <IssuesList issues={systemHealth.storage?.issues} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor(systemHealth.authentication?.status)}`}></div>
                  Authentication & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{systemHealth.authentication?.totalUsers ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Role Distribution:</div>
                  {Object.entries(systemHealth.authentication?.roleBreakdown || {}).map(([role, count]) => (
                    <div key={role} className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{role}:</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t text-sm">
                  <span className="text-muted-foreground">Active Users (7d): </span>
                  <span className="font-medium">{systemHealth.authentication?.activeUsers7d ?? 0}</span>
                </div>
                <IssuesList issues={systemHealth.authentication?.issues} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor(systemHealth.edgeFunctions?.status)}`}></div>
                  Edge Functions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{systemHealth.edgeFunctions?.totalFunctions ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Deployed Functions</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2 border-t pt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Probe Status:</span>
                    <span className="font-medium ml-1">
                      {systemHealth.edgeFunctions?.probeSuccess ? '✓ OK' : '✗ Failed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Response:</span>
                    <span className="font-medium ml-1">{systemHealth.edgeFunctions?.responseTimeMs ?? 0}ms</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Function List ({systemHealth.edgeFunctions?.availableFunctions?.length || 0}):
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-muted/30 p-2 rounded">
                    {(systemHealth.edgeFunctions?.availableFunctions || []).map((func: string) => (
                      <div key={func} className="text-xs text-muted-foreground">
                        • {func}
                      </div>
                    ))}
                  </div>
                </div>
                <IssuesList issues={systemHealth.edgeFunctions?.issues} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor(systemHealth.externalIntegrations?.status)}`}></div>
                  External Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{systemHealth.externalIntegrations?.totalIntegrations ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Configured Services</div>
                </div>
                {systemHealth.externalIntegrations?.totalIntegrations === 0 ? (
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    No external integrations configured
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Service Status:</div>
                    {Object.entries(systemHealth.externalIntegrations?.integrations || {}).map(([name, integration]) => {
                      const displayNames: Record<string, string> = {
                        resend: 'Resend',
                        kit: 'Kit',
                        googleAnalytics: 'Google Analytics'
                      };
                      const displayName = displayNames[name] || name.charAt(0).toUpperCase() + name.slice(1);
                      const isGA = name === 'googleAnalytics';
                      
                      return (
                        <div key={name} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                          <span className="font-medium">{displayName}</span>
                          <div className="flex items-center gap-2">
                            {integration.reachable ? (
                              <>
                                {integration.latencyMs > 0 && (
                                  <span className="text-xs text-muted-foreground">{integration.latencyMs}ms</span>
                                )}
                                <span className="text-xs text-green-600">
                                  ✓ {isGA ? 'Configured' : 'OK'}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-red-600">
                                ✗ {isGA ? 'Invalid' : 'Error'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <IssuesList issues={systemHealth.externalIntegrations?.issues} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Click "Run Health Check" to load system health data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthPanel;
