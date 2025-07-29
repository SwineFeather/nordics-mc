
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface NewCompanyData {
  name: string;
  industry: string;
  services: string;
  plan: string;
}

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (companyData: NewCompanyData) => void;
}

const CreateCompanyDialog: React.FC<CreateCompanyDialogProps> = ({ isOpen, onOpenChange, onSubmit }) => {
  const [newCompany, setNewCompany] = useState<NewCompanyData>({
    name: '',
    industry: '',
    services: '',
    plan: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewCompany(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof NewCompanyData, value: string) => {
    setNewCompany(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (newCompany.name && newCompany.industry) {
      onSubmit(newCompany);
      setNewCompany({ name: '', industry: '', services: '', plan: '' }); // Reset form
      // onOpenChange(false); // Dialog closing is handled by onSubmit in parent
    } else {
      // Basic validation feedback, consider using a toast or form validation library
      console.warn('Please fill in Company Name and Industry.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl">
          <Plus className="w-4 h-4 mr-2" />
          Register Company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Company</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Companies require moderator approval and can offer services like harvesting, landscaping, construction, etc.
            </p>
          </div>
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="e.g., Aytte Enterprises"
              value={newCompany.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select value={newCompany.industry} onValueChange={(value) => handleSelectChange('industry', value)}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="mining">Mining</SelectItem>
                <SelectItem value="trade">Trade & Commerce</SelectItem>
                <SelectItem value="services">Professional Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="services">Services Offered</Label>
            <Textarea
              id="services"
              placeholder="Describe what services your company will provide..."
              value={newCompany.services}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="plan">Business Plan</Label>
            <Textarea
              id="plan"
              placeholder="Brief description of your business model and goals..."
              value={newCompany.plan}
              onChange={handleInputChange}
            />
          </div>
          <Button className="w-full rounded-xl" onClick={handleSubmit}>
            Submit for Approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;

