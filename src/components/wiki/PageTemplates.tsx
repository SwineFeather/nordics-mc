import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  MapPin, 
  Crown, 
  Building, 
  BookOpen,
  HelpCircle,
  Lightbulb,
  Calendar,
  Star
} from 'lucide-react';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  content: string;
  category: string;
}

const pageTemplates: PageTemplate[] = [
  {
    id: 'guide',
    name: 'Player Guide',
    description: 'A comprehensive guide for players',
    icon: BookOpen,
    content: `# Player Guide

## Overview
Brief description of what this guide covers.

## Getting Started
1. First step
2. Second step
3. Third step

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Tips & Tricks
- Tip 1
- Tip 2
- Tip 3

## FAQ
### Question 1?
Answer 1

### Question 2?
Answer 2

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'guides'
  },
  {
    id: 'nation',
    name: 'Nation Page',
    description: 'Information about a nation',
    icon: Crown,
    content: `# [Nation Name]

## Basic Information
- **Leader:** [Leader Name]
- **Capital:** [Capital City]
- **Founded:** [Date]
- **Population:** [Number]
- **Government Type:** [Type]

## Description
Brief description of the nation and its characteristics.

## History
The history and founding of this nation.

## Geography
Description of the nation's territory and notable locations.

## Economy
Information about the nation's economy and trade.

## Culture
Cultural aspects, traditions, and customs.

## Notable Members
- [Member 1] - [Role]
- [Member 2] - [Role]
- [Member 3] - [Role]

## Towns
- [Town 1] - [Mayor]
- [Town 2] - [Mayor]
- [Town 3] - [Mayor]

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'nations'
  },
  {
    id: 'town',
    name: 'Town Page',
    description: 'Information about a town',
    icon: Building,
    content: `# [Town Name]

## Basic Information
- **Mayor:** [Mayor Name]
- **Nation:** [Nation Name] (if applicable)
- **Founded:** [Date]
- **Population:** [Number]
- **Type:** [Town Type]

## Description
Brief description of the town and its characteristics.

## Location
Description of where the town is located and its surroundings.

## Economy
Information about the town's economy and main industries.

## Attractions
Notable buildings, landmarks, and attractions in the town.

## Government
Information about the town's government structure.

## Notable Residents
- [Resident 1] - [Role/Contribution]
- [Resident 2] - [Role/Contribution]
- [Resident 3] - [Role/Contribution]

## Events
- [Event 1] - [Date]
- [Event 2] - [Date]
- [Event 3] - [Date]

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'towns'
  },
  {
    id: 'event',
    name: 'Event Page',
    description: 'Information about an event',
    icon: Calendar,
    content: `# [Event Name]

## Event Details
- **Date:** [Date and Time]
- **Location:** [Location]
- **Organizer:** [Organizer Name]
- **Type:** [Event Type]

## Description
Detailed description of the event and what to expect.

## Schedule
- **Start Time:** [Time]
- **Main Activities:** [List of activities]
- **End Time:** [Time]

## How to Participate
Instructions on how to join or participate in the event.

## Rewards
What participants can expect to receive or achieve.

## Rules
Important rules and guidelines for the event.

## Registration
How to register or sign up for the event.

## Contact
How to get more information or ask questions.

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'events'
  },
  {
    id: 'help',
    name: 'Help Page',
    description: 'A help or FAQ page',
    icon: HelpCircle,
    content: `# Help: [Topic]

## Overview
Brief explanation of what this help page covers.

## Common Questions

### Question 1?
**Answer:** Detailed answer to the first question.

### Question 2?
**Answer:** Detailed answer to the second question.

### Question 3?
**Answer:** Detailed answer to the third question.

## Step-by-Step Instructions

### Step 1: [Action]
1. First action
2. Second action
3. Third action

### Step 2: [Action]
1. First action
2. Second action
3. Third action

## Troubleshooting

### Problem 1
**Solution:** How to fix this problem.

### Problem 2
**Solution:** How to fix this problem.

## Additional Resources
- [Link 1] - [Description]
- [Link 2] - [Description]
- [Link 3] - [Description]

## Need More Help?
If you need additional assistance, please contact [Contact Information].

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'help'
  },
  {
    id: 'idea',
    name: 'Idea/Proposal',
    description: 'A suggestion or proposal page',
    icon: Lightbulb,
    content: `# [Idea/Proposal Title]

## Summary
Brief summary of the idea or proposal.

## Problem Statement
What problem does this idea solve or address?

## Proposed Solution
Detailed description of the proposed solution.

## Benefits
- Benefit 1
- Benefit 2
- Benefit 3

## Implementation
How this could be implemented.

## Timeline
Proposed timeline for implementation.

## Resources Needed
What resources would be required.

## Risks & Challenges
Potential risks and how to mitigate them.

## Alternatives
Other possible solutions to consider.

## Feedback
How to provide feedback on this proposal.

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'ideas'
  },
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start with a clean slate',
    icon: FileText,
    content: `# [Page Title]

Write your content here...

## Section 1

Content for section 1.

## Section 2

Content for section 2.

## Section 3

Content for section 3.

---
*Last updated: [Date]*
*Author: [Your Name]*`,
    category: 'general'
  }
];

interface PageTemplatesProps {
  onSelectTemplate: (template: PageTemplate) => void;
  onClose: () => void;
}

const PageTemplates: React.FC<PageTemplatesProps> = ({ onSelectTemplate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Choose a Template</h2>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content.split('\n').slice(0, 3).join('\n')}...
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageTemplates;
export { pageTemplates }; 