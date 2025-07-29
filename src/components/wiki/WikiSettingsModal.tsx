
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, FileText, Users, Database, Globe, Building, Loader2 } from 'lucide-react';
import { WikiSummary, UserRole, getRolePermissions } from '@/types/wiki';
import SummaryEditor from './SummaryEditor';
import { AutoWikiService } from '../../services/autoWikiService';

const autoWikiService = new AutoWikiService();

interface WikiSettingsModalProps {
  wikiData: WikiSummary;
  userRole?: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStructureUpdate?: (newCategories: any[]) => void;
  onRefreshData?: () => void;
}

const WikiSettingsModal = ({ 
  wikiData, 
  userRole = 'member', 
  open, 
  onOpenChange, 
  onStructureUpdate,
  onRefreshData
}: WikiSettingsModalProps) => {
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{ nations: number; towns: number; error?: string } | null>(null);
  const permissions = getRolePermissions(userRole);

  if (!permissions.canManageStructure) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Wiki Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              SUMMARY.md
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wiki Structure Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{wikiData.categories.length}</div>
                      <div className="text-sm text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {wikiData.categories.reduce((total, cat) => total + cat.pages.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Pages</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Categories:</h4>
                    {wikiData.categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{category.title}</span>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                        <Badge variant="outline">{category.pages.length} pages</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <SummaryEditor 
              wikiData={wikiData} 
              onStructureUpdate={onStructureUpdate}
              onRefreshData={onRefreshData}
            />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Your current role: <Badge className="ml-2 capitalize">{userRole}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Permissions:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm capitalize">{key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant={value ? 'default' : 'secondary'}>
                            {value ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {wikiData.lastUpdated}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Stats:</h4>
                    <div className="space-y-1 text-sm">
                      <div>• Total categories: {wikiData.categories.length}</div>
                      <div>• Total pages: {wikiData.categories.reduce((total, cat) => total + cat.pages.length, 0)}</div>
                      <div>• Published pages: {wikiData.categories.reduce((total, cat) => total + cat.pages.filter(p => p.status === 'published').length, 0)}</div>
                      <div>• Draft pages: {wikiData.categories.reduce((total, cat) => total + cat.pages.filter(p => p.status === 'draft').length, 0)}</div>
                    </div>
                    
                    {onRefreshData && (
                      <Button
                        variant="outline"
                        onClick={onRefreshData}
                        className="w-full mt-4"
                      >
                        🔄 Reload Wiki Data
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Auto-Sync Nations & Towns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automatically create wiki pages for all nations and towns from the server database. 
                    This will create a hierarchical structure with "The World" as the main category, 
                    containing "Nations" and "Towns" as subcategories, and update the SUMMARY.md accordingly.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">What this does:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>Creates nation pages with overview, lore, and town lists</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>Creates town pages with basic information</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>Creates "The World" category with "Nations" and "Towns" subcategories</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>Updates SUMMARY.md with the hierarchical structure</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>Skips pages that already exist</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Test Database Connection */}
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setIsTesting(true);
                        try {
                          const results = await autoWikiService.testDatabaseConnection();
                          setTestResults(results);
                        } catch (error) {
                          console.error('Test failed:', error);
                          setTestResults({ nations: 0, towns: 0, error: 'Test failed' });
                        } finally {
                          setIsTesting(false);
                        }
                      }}
                      disabled={isTesting}
                      className="w-full"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing Database...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4 mr-2" />
                          Test Database Connection
                        </>
                      )}
                    </Button>

                    {/* Show test results */}
                    {testResults && (
                      <div className={`p-3 rounded-md text-sm ${
                        testResults.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                      }`}>
                        {testResults.error ? (
                          <div className="text-red-700">
                            <strong>Error:</strong> {testResults.error}
                          </div>
                        ) : (
                          <div className="text-green-700">
                            <strong>✅ Database connected successfully!</strong><br />
                            Found {testResults.nations} nations and {testResults.towns} towns
                          </div>
                        )}
                      </div>
                    )}

                    {/* Auto-Sync Button */}
                    <Button
                      onClick={async () => {
                        setIsAutoSyncing(true);
                        try {
                          await autoWikiService.syncNationsAndTowns();
                          // Update SUMMARY.md with hierarchical structure
                          await autoWikiService.updateSummaryWithHierarchy();
                          // Refresh the wiki data after sync
                          if (onStructureUpdate) {
                            // This would need to be implemented to refresh the current wiki data
                            window.location.reload(); // Simple refresh for now
                          }
                        } catch (error) {
                          console.error('Auto-sync failed:', error);
                        } finally {
                          setIsAutoSyncing(false);
                        }
                      }}
                      disabled={isAutoSyncing}
                      className="w-full"
                    >
                      {isAutoSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing Nations & Towns...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Sync Nations & Towns
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WikiSettingsModal;
