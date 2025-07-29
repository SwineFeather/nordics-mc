import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHistory from './PageHistory';

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  pageTitle: string;
  onRevisionRestored?: () => void;
}

const HistoryModal = ({ 
  open, 
  onOpenChange, 
  pageId, 
  pageTitle, 
  onRevisionRestored 
}: HistoryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Page History - {pageTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <PageHistory
          pageId={pageId}
          pageTitle={pageTitle}
          onRevisionRestored={onRevisionRestored}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal; 