import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface TestItem {
  id: string;
  content: string;
}

const DragDropTest: React.FC = () => {
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
    { id: '4', content: 'Item 4' },
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Drag & Drop Test</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="test-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 p-4 border-2 border-dashed rounded-lg ${
                  snapshot.isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm ${
                          snapshot.isDragging ? 'opacity-50 shadow-lg' : ''
                        }`}
                        style={provided.draggableProps.style}
                      >
                        <span className="flex-1">{item.content}</span>
                        <div
                          {...provided.dragHandleProps}
                          className="p-1 cursor-grab active:cursor-grabbing"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>✅ Drag items to reorder them</p>
          <p>✅ Drag handles should work properly</p>
          <p>✅ No console errors should appear</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DragDropTest; 