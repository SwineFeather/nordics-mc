import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SupabaseNationData } from '@/services/supabaseTownService';

interface EditNationModalProps {
  nation: SupabaseNationData;
  onNationUpdated: (updatedNation: SupabaseNationData) => void;
}

const GOVERNMENT_TYPES = [
  'Monarchy',
  'Democracy',
  'Republic',
  'Dictatorship',
  'Oligarchy',
  'Theocracy',
  'Federation',
  'Confederation',
  'Empire',
  'Custom'
];

const EditNationModal: React.FC<EditNationModalProps> = ({ nation, onNationUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    government: nation.government || 'Monarchy',
    customGovernment: '',
    lore: nation.lore || '',
    description: nation.description || ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const governmentValue = formData.government === 'Custom' 
        ? formData.customGovernment 
        : formData.government;

      const { error } = await supabase
        .from('nations')
        .update({
          government: governmentValue,
          lore: formData.lore,
          description: formData.description,
          updated_at: new Date().toISOString()
        } as any)
        .eq('name', nation.name);

      if (error) {
        throw error;
      }

      // Update the local nation object
      const updatedNation = {
        ...nation,
        government: governmentValue,
        lore: formData.lore,
        description: formData.description
      };

      onNationUpdated(updatedNation);
      toast({
        title: "Success",
        description: "Nation information updated successfully!",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating nation:', error);
      toast({
        title: "Error",
        description: "Failed to update nation information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      setFormData({
        government: nation.government || 'Monarchy',
        customGovernment: '',
        lore: nation.lore || '',
        description: nation.description || ''
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Nation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit {nation.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Government Type */}
          <div className="space-y-2">
            <Label htmlFor="government">Government Type</Label>
            <Select 
              value={formData.government} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, government: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select government type" />
              </SelectTrigger>
              <SelectContent>
                {GOVERNMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Government Input */}
          {formData.government === 'Custom' && (
            <div className="space-y-2">
              <Label htmlFor="customGovernment">Custom Government Type</Label>
              <Input
                id="customGovernment"
                value={formData.customGovernment}
                onChange={(e) => setFormData(prev => ({ ...prev, customGovernment: e.target.value }))}
                placeholder="Enter your custom government type..."
                required={formData.government === 'Custom'}
              />
            </div>
          )}

          {/* Nation Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your nation..."
              rows={3}
            />
          </div>

          {/* Nation Lore */}
          <div className="space-y-2">
            <Label htmlFor="lore">Lore</Label>
            <Textarea
              id="lore"
              value={formData.lore}
              onChange={(e) => setFormData(prev => ({ ...prev, lore: e.target.value }))}
              placeholder="The story and history of your nation..."
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Share the rich history, traditions, and stories that make your nation unique.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNationModal;
