import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Shop } from '@/hooks/useShopData'; 
import type { User } from '@/hooks/useAuth'; // Import User as a type

interface CreateShopDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User | null; 
  createShopHook: (shopData: Omit<Shop, 'id'>) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
  onShopCreated: () => void;
}

const CreateShopDialog: React.FC<CreateShopDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  createShopHook,
  onShopCreated,
}) => {
  const [newShop, setNewShop] = useState({
    name: '', // For the shop's display name in the form
    item: '',
    price: '',
    stock: '',
    location: '', // Base location
    description: '' // Optional description
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewShop(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = async () => {
    if (newShop.name && newShop.item && newShop.price && newShop.location) {
      try {
        const shopDataToCreate: Omit<Shop, 'id'> = {
          owner: user?.email || 'Anonymous',
          location: `${newShop.location} (Shop: ${newShop.name})`,
          item: newShop.item,
          price: parseFloat(newShop.price),
          stock: parseInt(newShop.stock, 10) || 0,
          type: 'sell', // Default to 'sell', can be made configurable later
        };

        const result = await createShopHook(shopDataToCreate);

        if (result.success) {
          console.log('Shop created successfully via dialog:', result.shop);
          setNewShop({ name: '', item: '', price: '', stock: '', location: '', description: '' });
          onShopCreated(); // This will typically close the dialog and trigger refresh
        } else {
          console.error('Failed to create shop via dialog:', result.error);
          // Handle error display if needed (e.g., toast)
        }
      } catch (error) {
        console.error('Error in CreateShopDialog handleSubmit:', error);
      }
    } else {
      console.warn('Please fill in all required shop fields (Name, Item, Price, Location).');
      // Handle validation feedback
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Shop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Shop Name</Label>
            <Input
              id="name"
              placeholder="e.g., Aytte's Armor Shop"
              value={newShop.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="item">Item/Service</Label>
            <Input
              id="item"
              placeholder="What are you selling?"
              value={newShop.item}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={newShop.price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="Amount available"
                value={newShop.stock}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Normannburg Market District"
              value={newShop.location}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your shop or service..."
              value={newShop.description}
              onChange={handleInputChange}
            />
          </div>
          <Button className="w-full rounded-xl" onClick={handleSubmit}>
            Create Shop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShopDialog;
