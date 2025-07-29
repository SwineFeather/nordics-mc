import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Cloud, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  FolderOpen,
  Bug
} from 'lucide-react';
import { useSupabaseWikiData } from '@/hooks/useSupabaseWikiData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


const SupabaseWikiTest = () => {
  const { 
    categories, 
    fileStructure,
    loading, 
    error, 
    lastUpdated, 
    refreshData,
    getPageByPath,
    searchPages,
    getFileContent
  } = useSupabaseWikiData();

  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [testPath, setTestPath] = useState('Nordics/towns/garvia/README.md');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebugStorage = async () => {
    setIsDebugging(true);
    try {
      console.log('🔍 Starting storage debug...');
      
      // Test 1: Directory listing approach (likely to fail due to RLS)
      console.log('📁 Testing directory listing approach...');
      
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('wiki')
        .list('', { limit: 100 });
      
      const { data: nordicsFiles, error: nordicsError } = await supabase.storage
        .from('wiki')
        .list('Nordics', { limit: 100 });
      
      const { data: allFiles, error: allError } = await supabase.storage
        .from('wiki')
        .list('', { limit: 1000 });

      console.log('📁 Directory listing results:');
      console.log('  Root files:', rootFiles?.length || 0, 'Error:', rootError);
      console.log('  Nordics files:', nordicsFiles?.length || 0, 'Error:', nordicsError);
      console.log('  All files:', allFiles?.length || 0, 'Error:', allError);
      
      // Test 3: New path discovery approach
      console.log('🔍 Testing new path discovery approach...');
      
      const knownPaths = [
        'Nordics/nations/constellation.md',
        'Nordics/towns/garvia/README.md',
        'Nordics/towns/garvia/',
        'Nordics/towns/',
        'Nordics/nations/',
        'Nordics/'
      ];
      
      const discoveryResults = {};
      
      for (const path of knownPaths) {
        try {
          console.log(`🔍 Testing path: ${path}`);
          
          if (path.endsWith('.md')) {
            // Try to download the file
            const { data, error } = await supabase.storage
              .from('wiki')
              .download(path);
            
            discoveryResults[path] = {
              type: 'file',
              found: !error && data,
              error: error,
              size: data ? data.size : null
            };
          } else {
            // Try to list the directory
            const { data, error } = await supabase.storage
              .from('wiki')
              .list(path, { limit: 100 });
            
            discoveryResults[path] = {
              type: 'directory',
              found: !error && data && data.length > 0,
              error: error,
              itemCount: data ? data.length : 0,
              items: data ? data.map(item => ({ name: item.name, type: item.metadata ? 'file' : 'folder' })) : []
            };
          }
        } catch (error) {
          discoveryResults[path] = {
            type: 'error',
            found: false,
            error: error.message
          };
        }
      }

      // Test 3: Direct file access
      console.log('🔍 Testing direct file access...');
      const { data: testFile, error: testError } = await supabase.storage
        .from('wiki')
        .download('Nordics/nations/constellation.md');

      // Test 4: Public URL access
      const { data: publicUrlData } = supabase.storage
        .from('wiki')
        .getPublicUrl('Nordics/nations/constellation.md');
      
      let httpResponse = null;
      try {
        const response = await fetch(publicUrlData.publicUrl);
        httpResponse = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
      } catch (httpError) {
        httpResponse = { error: httpError.message };
      }

      // Test 5: Path variations
      const pathTests = [
        'Nordics',
        'nordics', 
        'Nordics/',
        'nordics/',
        'the-world',
        'The-World'
      ];

      const pathResults = {};
      for (const testPath of pathTests) {
        const { data: pathData, error: pathError } = await supabase.storage
          .from('wiki')
          .list(testPath, { limit: 10 });
        pathResults[testPath] = { data: pathData, error: pathError };
      }

      // Test 6: HTTP discovery
      console.log('🔍 Testing HTTP discovery...');
      const httpDiscoveryResults = {};
      const baseUrl = 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/wiki';
      
      const httpFilesToTest = [
        'Nordics/towns/sogndalsfjorden.md',
        'Nordics/towns/kingdom_of_albion/england/lundenwic.md',
        'Nordics/towns/northstar/README.md',
        'Nordics/server-events/terrain-incidents/northstar-forest-fire.md',
        'Nordics/server-events/terrain-incidents/the-sapmi-forest-fire.md',
        'Nordics/towns/README.md',
        'Nordics/nations/README.md',
        'Nordics/README.md',
        // Test some variations
        'Nordics/towns/garvia/history.md',
        'Nordics/towns/garvia/economy.md',
        'Nordics/towns/garvia/culture.md',
        'Nordics/towns/garvia/government.md'
      ];
      
      for (const filePath of httpFilesToTest) {
        try {
          const url = `${baseUrl}/${filePath}`;
          console.log(`🌐 Testing HTTP: ${url}`);
          
          const response = await fetch(url);
          httpDiscoveryResults[filePath] = {
            status: response.status,
            ok: response.ok,
            found: response.ok,
            url: url
          };
          
          if (response.ok) {
            console.log(`✅ Found via HTTP: ${filePath}`);
          }
        } catch (error) {
          httpDiscoveryResults[filePath] = {
            error: error.message,
            found: false
          };
        }
      }

      // Test 7: Get wiki structure
      console.log('🔍 Testing wiki structure...');
      try {
        await refreshData();
        console.log('✅ Wiki structure refreshed successfully');
      } catch (error) {
        console.log('❌ Wiki structure refresh failed:', error);
      }

      setDebugInfo({
        // Directory listing results
        rootFiles,
        nordicsFiles,
        allFiles,
        testFile: testFile ? 'File found' : 'File not found',
        testError,
        publicUrl: publicUrlData,
        httpResponse,
        pathTests: pathResults,
        errors: {
          root: rootError,
          nordics: nordicsError,
          all: allError
        },
        // Path discovery results
        discoveryResults,
        // HTTP discovery results
        httpDiscoveryResults
      });

      toast.success('Storage debug completed');
    } catch (error) {
      console.error('Debug failed:', error);
      setDebugInfo({ error: 'Debug failed', details: error });
      toast.error('Debug failed');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleTestSearch = async () => {
    setIsTestingSearch(true);
    try {
      const results = await searchPages('garvia');
      setSearchResults(results);
      toast.success(`Found ${results.length} pages matching 'garvia'`);
    } catch (error) {
      console.error('Search test failed:', error);
      toast.error('Search test failed');
    } finally {
      setIsTestingSearch(false);
    }
  };

  const handleTestPageLoad = async () => {
    try {
      const page = await getPageByPath(testPath);
      if (page) {
        toast.success(`Successfully loaded page: ${page.title}`);
        console.log('Loaded page:', page);
      } else {
        toast.error('Page not found');
      }
    } catch (error) {
      console.error('Page load test failed:', error);
      toast.error('Page load test failed');
    }
  };

  const handleTestFileContent = async () => {
    try {
      const content = await getFileContent(testPath);
      toast.success(`Successfully loaded file content (${content.length} characters)`);
      console.log('File content preview:', content.substring(0, 200) + '...');
    } catch (error) {
      console.error('File content test failed:', error);
      toast.error('File content test failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Supabase Storage Wiki Test</h1>
      </div>

      {/* Debug Button */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug Storage Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDebugStorage} disabled={isDebugging}>
            {isDebugging ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bug className="h-4 w-4 mr-2" />
            )}
            Debug Storage
          </Button>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Total categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              File Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStructure.length}</div>
            <p className="text-xs text-muted-foreground">Root items</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {lastUpdated.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            
            <Button onClick={handleTestSearch} disabled={isTestingSearch}>
              {isTestingSearch ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Test Search
            </Button>
            
            <Button onClick={handleTestPageLoad} variant="outline">
              Load Page
            </Button>
            
            <Button onClick={handleTestFileContent} variant="outline">
              Load Content
            </Button>
            
            <Button 
              onClick={() => {
                console.log('🔍 Testing wiki service directly...');
                console.log('Categories:', categories);
                console.log('File structure:', fileStructure);
              }} 
              variant="outline"
            >
              Log Service Data
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Path:</label>
            <input
              type="text"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              placeholder="Enter file path to test..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <h4 className="font-medium">{category.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category.pages?.length || 0} pages
                  </p>
                </div>
                <Badge variant="secondary">{category.slug}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchResults.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <h4 className="font-medium">{page.title}</h4>
                    <p className="text-sm text-muted-foreground">{page.category}</p>
                  </div>
                  <Badge variant="outline">{page.slug}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Structure Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">File Structure Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(fileStructure, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseWikiTest; 