import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseWikiService } from '@/services/supabaseWikiService';

export const TownWikiClearButton: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    clearedCount: number;
    error?: string;
  } | null>(null);

  const handleClearTownWikiPages = async () => {
    if (!confirm('⚠️ Are you sure you want to clear ALL town wiki pages? This action cannot be undone and will remove all content from town pages.')) {
      return;
    }

    if (!confirm('🚨 This will permanently clear the content of all town wiki pages. Are you absolutely certain?')) {
      return;
    }

    setIsClearing(true);
    setLastResult(null);

    try {
      const result = await SupabaseWikiService.clearTownWikiPages();
      setLastResult(result);

      if (result.success) {
        toast.success(`✅ Successfully cleared ${result.clearedCount} town wiki pages`);
      } else {
        toast.error(`❌ Failed to clear town wiki pages: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastResult({
        success: false,
        clearedCount: 0,
        error: errorMessage
      });
      toast.error(`❌ Error clearing town wiki pages: ${errorMessage}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Clear Town Wiki Pages
        </CardTitle>
        <CardDescription>
          Remove all content from town wiki pages. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Warning</p>
            <p>This will permanently clear the content of all town wiki pages. The pages will remain but will have no content.</p>
          </div>
        </div>

        <Button
          onClick={handleClearTownWikiPages}
          disabled={isClearing}
          variant="destructive"
          className="w-full"
        >
          {isClearing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Town Wiki Pages
            </>
          )}
        </Button>

        {lastResult && (
          <div className={`p-3 rounded-lg border ${
            lastResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div className="text-sm">
                {lastResult.success ? (
                  <p className="text-green-800">
                    Successfully cleared {lastResult.clearedCount} town wiki pages
                  </p>
                ) : (
                  <p className="text-red-800">
                    Failed to clear town wiki pages: {lastResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


