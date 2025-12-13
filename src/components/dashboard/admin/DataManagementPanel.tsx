import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Archive, Download, Upload, Trash2, FileDown, FileUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const DataManagementPanel = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<Array<{ name: string; count: number }>>([]);
  const [orphanedData, setOrphanedData] = useState<any>(null);
  const [deleteAllArchived, setDeleteAllArchived] = useState(false);
  
  // Bulk operations state
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableRecords, setTableRecords] = useState<any[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const RECORDS_PER_PAGE = 20;
  
  const availableTables = [
    { value: "article_content", label: "Articles" },
    { value: "library_content", label: "Library Content" },
    { value: "gallery_images", label: "Gallery Images" },
    { value: "images", label: "Images" },
    { value: "gallery_image_files", label: "Gallery Image Files" },
    { value: "content_pdfs", label: "PDFs" },
    { value: "newsletter_subscribers", label: "Newsletter Subscribers" },
    { value: "profiles", label: "Profiles" },
    { value: "user_roles", label: "User Roles" },
    { value: "article_likes", label: "Article Likes" },
    { value: "password_reset_tokens", label: "Password Reset Tokens" },
  ];

  // === DATABASE MAINTENANCE ===
  
  const handleListTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-maintenance', {
        body: { action: 'list-tables' }
      });

      if (error) throw error;
      setTables(data.tables);
      toast.success('Database tables loaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleFindOrphaned = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-maintenance', {
        body: { action: 'find-orphaned' }
      });

      if (error) throw error;
      setOrphanedData(data);
      toast.success(`Found orphaned data: Images: ${data.orphanedImages}, PDFs: ${data.orphanedPdfs}, Gallery Files: ${data.orphanedGalleryFiles}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to find orphaned data');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupArchived = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-maintenance', {
        body: { action: 'cleanup-archived', deleteAll: deleteAllArchived }
      });

      if (error) throw error;
      toast.success(data.message || 'Archived items cleaned');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cleanup');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupOrphaned = async () => {
    if (!orphanedData?.details) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-maintenance', {
        body: {
          action: 'cleanup-orphaned',
          imageIds: orphanedData.details.images,
          pdfIds: orphanedData.details.pdfs,
          galleryFileIds: orphanedData.details.galleryFiles
        }
      });

      if (error) throw error;
      toast.success(data.message || 'Orphaned data deleted');
      setOrphanedData(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cleanup');
    } finally {
      setLoading(false);
    }
  };

  const handleRecountStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-maintenance', {
        body: { action: 'recount-statistics' }
      });

      if (error) throw error;
      toast.success(data.message || 'Statistics recounted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to recount statistics');
    } finally {
      setLoading(false);
    }
  };

  // === BULK OPERATIONS ===
  
  const loadTableRecords = async (page = 0) => {
    if (!selectedTable) return;
    
    setLoadingRecords(true);
    try {
      let query = supabase.from(selectedTable as any).select('*');
      
      // Add ordering and pagination
      if (selectedTable === 'article_content') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: true });
      }
      
      query = query.range(page * RECORDS_PER_PAGE, (page + 1) * RECORDS_PER_PAGE - 1);
      
      const { data, error } = await query;
      if (error) throw error;

      let enrichedData = data || [];

      // Enrich file tables with parent content names using batch queries (fixes N+1 query problem)
      if (selectedTable === 'images') {
        const imageIds = (data || []).map((img: any) => img.id);
        const { data: contentMatches } = await supabase
          .from('library_content')
          .select('image_id, title')
          .in('image_id', imageIds);
        
        const titleMap = new Map(contentMatches?.map(c => [c.image_id, c.title]) || []);
        enrichedData = (data || []).map((img: any) => ({
          ...img,
          parentTitle: titleMap.get(img.id) || '(orphaned)'
        }));
      } else if (selectedTable === 'gallery_image_files') {
        const fileIds = (data || []).map((file: any) => file.id);
        const { data: galleryMatches } = await supabase
          .from('gallery_images')
          .select('image_file_id, title')
          .in('image_file_id', fileIds);
        
        const titleMap = new Map(galleryMatches?.map(g => [g.image_file_id, g.title]) || []);
        enrichedData = (data || []).map((file: any) => ({
          ...file,
          parentTitle: titleMap.get(file.id) || '(orphaned)'
        }));
      } else if (selectedTable === 'content_pdfs') {
        const pdfIds = (data || []).map((pdf: any) => pdf.id);
        const { data: contentMatches } = await supabase
          .from('library_content')
          .select('pdf_id, title')
          .in('pdf_id', pdfIds);
        
        const titleMap = new Map(contentMatches?.map(c => [c.pdf_id, c.title]) || []);
        enrichedData = (data || []).map((pdf: any) => ({
          ...pdf,
          parentTitle: titleMap.get(pdf.id) || '(orphaned)'
        }));
      }

      setTableRecords(enrichedData);
      setHasMore(enrichedData.length === RECORDS_PER_PAGE);
      setCurrentPage(page);
      setSelectedRecords([]);
      toast.success(`Loaded page ${page + 1} of ${selectedTable}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load records');
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedRecords.length === 0) {
      toast.error('Please select records to archive');
      return;
    }

    setBulkLoading(true);
    try {
      const { error } = await supabase.functions.invoke('bulk-operations', {
        body: {
          action: 'bulk-archive',
          table: selectedTable,
          ids: selectedRecords
        }
      });

      if (error) throw error;
      toast.success(`Archived ${selectedRecords.length} records`);
      loadTableRecords(currentPage);
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive records');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) {
      toast.error('Please select records to delete');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete ${selectedRecords.length} records? This will also delete associated files.`)) {
      return;
    }

    setBulkLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: {
          action: 'bulk-delete',
          table: selectedTable,
          ids: selectedRecords
        }
      });

      if (error) throw error;
      toast.success(`Deleted ${data.deleted} records and ${data.filesDeleted || 0} files`);
      loadTableRecords(currentPage);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete records');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = async () => {
    setBulkLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: {
          action: 'bulk-export',
          table: selectedTable,
          ids: selectedRecords.length > 0 ? selectedRecords : undefined
        }
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${selectedRecords.length > 0 ? selectedRecords.length : 'all'} records`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export records');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkLoading(true);
    try {
      const text = await file.text();
      const records = JSON.parse(text);

      const { error } = await supabase.functions.invoke('bulk-operations', {
        body: {
          action: 'bulk-import',
          table: selectedTable,
          data: records
        }
      });

      if (error) throw error;
      toast.success(`Imported ${records.length} records`);
      loadTableRecords(currentPage);
    } catch (error: any) {
      toast.error(error.message || 'Failed to import records');
    } finally {
      setBulkLoading(false);
      event.target.value = '';
    }
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecords.length === tableRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(tableRecords.map(r => String(r.id)));
    }
  };

  const isRecordArchived = (record: any) => {
    return record.archived === true;
  };

  const getRecordDisplayName = (record: any) => {
    if (selectedTable === 'images' || selectedTable === 'gallery_image_files' || selectedTable === 'content_pdfs') {
      const shortId = String(record.id).substring(0, 8);
      return `${shortId}... - ${record.parentTitle}`;
    }
    return record.title || record.email || record.name || String(record.id).substring(0, 20);
  };

  // === BACKUP & RESTORE ===
  
  const handleExportTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: { action: 'export' }
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('All tables exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export tables');
    } finally {
      setLoading(false);
    }
  };

  const handleExportStorage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: { action: 'export-storage' }
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data.manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storage-manifest-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Storage manifest exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export storage');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTables = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('This will overwrite existing data. Are you sure?')) {
      event.target.value = '';
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: { action: 'restore', backupData }
      });

      if (error) throw error;
      toast.success(data.message || 'Tables restored successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to restore tables');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maintenance">Database Maintenance</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>

          {/* DATABASE MAINTENANCE TAB */}
          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleListTables} disabled={loading}>
                  Load Tables
                </Button>
                <Button onClick={handleFindOrphaned} disabled={loading}>
                  Find Orphaned Data
                </Button>
                <Button onClick={handleRecountStats} disabled={loading}>
                  Recount Statistics
                </Button>
              </div>

              {tables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Table Counts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tables.map((table) => (
                        <div key={table.name} className="flex justify-between p-2 border rounded">
                          <span className="text-sm">{table.name}</span>
                          <Badge variant="secondary">{table.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {orphanedData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Orphaned Data Found</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="p-2 border rounded">
                        <div className="font-medium">Images</div>
                        <div className="text-2xl font-bold">{orphanedData.orphanedImages}</div>
                      </div>
                      <div className="p-2 border rounded">
                        <div className="font-medium">PDFs</div>
                        <div className="text-2xl font-bold">{orphanedData.orphanedPdfs}</div>
                      </div>
                      <div className="p-2 border rounded">
                        <div className="font-medium">Gallery Files</div>
                        <div className="text-2xl font-bold">{orphanedData.orphanedGalleryFiles}</div>
                      </div>
                    </div>
                    <Button onClick={handleCleanupOrphaned} variant="destructive" size="sm" disabled={loading}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All Orphaned Data
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cleanup Archived Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="deleteAll"
                      checked={deleteAllArchived}
                      onCheckedChange={(checked) => setDeleteAllArchived(checked as boolean)}
                    />
                    <Label htmlFor="deleteAll" className="text-sm">
                      Delete all archived items (not just 7+ days old)
                    </Label>
                  </div>
                  <Button onClick={handleCleanupArchived} variant="destructive" disabled={loading}>
                    <Archive className="mr-2 h-4 w-4" />
                    Cleanup Archived Items
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will permanently delete archived items and their associated storage files.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BULK OPERATIONS TAB */}
          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Table</Label>
                <Select value={selectedTable} onValueChange={(value) => {
                  setSelectedTable(value);
                  setTableRecords([]);
                  setSelectedRecords([]);
                  setCurrentPage(0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.value} value={table.value}>
                        {table.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTable && (
                <>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => loadTableRecords(0)} disabled={loadingRecords}>
                      Load Records
                    </Button>
                    <Button onClick={handleBulkArchive} disabled={bulkLoading || selectedRecords.length === 0}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Selected
                    </Button>
                    <Button onClick={handleBulkDelete} variant="destructive" disabled={bulkLoading || selectedRecords.length === 0}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleBulkExport} variant="outline" disabled={bulkLoading}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Export {selectedRecords.length > 0 ? 'Selected' : 'All'}
                    </Button>
                    <Button variant="outline" disabled={bulkLoading} asChild>
                      <label className="cursor-pointer">
                        <FileUp className="mr-2 h-4 w-4" />
                        Import JSON
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleBulkImport}
                        />
                      </label>
                    </Button>
                  </div>

                  {tableRecords.length > 0 && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            Records (Page {currentPage + 1})
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedRecords.length === tableRecords.length}
                              onCheckedChange={toggleSelectAll}
                            />
                            <Label className="text-sm">Select All</Label>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {tableRecords.map((record) => (
                            <div
                              key={record.id}
                              className={`flex items-center gap-3 p-3 border rounded transition-colors ${
                                isRecordArchived(record) 
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <Checkbox
                                checked={selectedRecords.includes(String(record.id))}
                                onCheckedChange={() => toggleRecordSelection(String(record.id))}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {getRecordDisplayName(record)}
                                </div>
                                {record.created_at && (
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(record.created_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              {isRecordArchived(record) && (
                                <Badge variant="destructive" className="shrink-0">Archived</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTableRecords(currentPage - 1)}
                            disabled={currentPage === 0 || loadingRecords}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {selectedRecords.length} of {tableRecords.length} selected
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTableRecords(currentPage + 1)}
                            disabled={!hasMore || loadingRecords}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* BACKUP & RESTORE TAB */}
          <TabsContent value="backup" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleExportTables} disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    Export All Tables
                  </Button>
                  <Button onClick={handleExportStorage} disabled={loading} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Storage Manifest
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export all database tables and storage file manifests to JSON files.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Restore Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" disabled={loading} asChild>
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Select Table Backup
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleRestoreTables}
                      />
                    </label>
                  </Button>
                </div>
                <div className="p-3 border border-destructive bg-destructive/10 rounded">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Warning: Restoring will overwrite existing data!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataManagementPanel;
