import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flag, AlertTriangle } from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';

interface ReportContentProps {
  contentType: 'post' | 'reply' | 'user';
  contentId: string;
  contentTitle?: string;
  trigger?: React.ReactNode;
}

const REPORT_TYPES = {
  spam: { label: 'Spam', description: 'Unwanted commercial content or repetitive posts' },
  inappropriate: { label: 'Inappropriate', description: 'Content that violates community guidelines' },
  harassment: { label: 'Harassment', description: 'Targeted abuse or bullying behavior' },
  hate_speech: { label: 'Hate Speech', description: 'Discriminatory or offensive language' },
  violence: { label: 'Violence', description: 'Threats or promotion of violence' },
  copyright: { label: 'Copyright', description: 'Unauthorized use of copyrighted material' },
  misinformation: { label: 'Misinformation', description: 'False or misleading information' },
  other: { label: 'Other', description: 'Other violations not listed above' }
};

export const ReportContent: React.FC<ReportContentProps> = ({
  contentType,
  contentId,
  contentTitle,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { reportContent } = useModeration();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType || !reason.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a report type and provide a reason.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      await reportContent(contentType, contentId, reportType, reason, evidence);
      
      toast({
        title: 'Report Submitted',
        description: 'Thank you for your report. Our moderators will review it shortly.'
      });
      
      setOpen(false);
      setReportType('');
      setReason('');
      setEvidence('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'post': return 'Post';
      case 'reply': return 'Reply';
      case 'user': return 'User';
      default: return 'Content';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="w-4 h-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report {getContentTypeLabel()}
          </DialogTitle>
          <DialogDescription>
            {contentTitle && (
              <div className="mb-2 p-2 bg-muted rounded text-sm">
                <strong>Content:</strong> {contentTitle}
              </div>
            )}
            Help us understand what's wrong with this {contentType}. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{value.label}</div>
                      <div className="text-xs text-muted-foreground">{value.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Please explain why you're reporting this content..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Evidence (Optional)</label>
            <Textarea
              placeholder="Any additional context, links, or evidence that might help moderators..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !reportType || !reason.trim()}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 