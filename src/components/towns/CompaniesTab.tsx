
import React, { useState } from 'react';
import { useCompaniesData, Company } from '@/hooks/useCompaniesData';
import CompanyCard from './CompanyCard';
import CreateCompanyDialog from './CreateCompanyDialog'; // Assuming this path is correct and props align

// Define NewCompanyData interface locally if not imported, or ensure CreateCompanyDialog handles its own state.
// For this refactor, CreateCompanyDialog is self-contained regarding its form state.
// The submission callback needs to be defined here.
interface NewCompanyData {
  name: string;
  industry: string;
  services: string;
  plan: string;
}

interface CompaniesTabProps {
  searchTerm: string;
}

const CompaniesTab: React.FC<CompaniesTabProps> = ({ searchTerm }) => {
  const { companies } = useCompaniesData();
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [showCreateCompanyDialog, setShowCreateCompanyDialog] = useState(false);

  const handleCreateCompanySubmit = (companyData: NewCompanyData) => {
    // This is where the actual company creation logic would go.
    // For now, it just logs and closes the dialog.
    if (companyData.name && companyData.industry) {
      console.log('Creating company:', companyData);
      // Here you would typically call an API to save the company
      // and then potentially refresh a list of companies (if companies were dynamic).
      // Since current companies data is static from a hook, this won't update the list.
      setShowCreateCompanyDialog(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-medium">Business Directory</h2>
        {/* Ensure CreateCompanyDialog is correctly invoked.
            It uses its own DialogTrigger internally, so we pass isOpen, onOpenChange, and onSubmit. */}
        <CreateCompanyDialog
          isOpen={showCreateCompanyDialog}
          onOpenChange={setShowCreateCompanyDialog}
          onSubmit={handleCreateCompanySubmit}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            isExpanded={expandedCompany === company.id}
            onToggleExpand={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
          />
        ))}
      </div>
    </>
  );
};

export default CompaniesTab;
