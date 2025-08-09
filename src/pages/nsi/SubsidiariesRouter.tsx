import React from 'react';
import { useParams } from 'react-router-dom';
import { Factory, Pickaxe, Banknote, Disc3, Trees, Wand2, Sofa } from 'lucide-react';
import SubsidiaryTemplate from './SubsidiaryTemplate';
import CompanyStorefront from '../CompanyStorefront';

const SubsidiariesRouter: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return null;

  switch (slug) {
    case 'nsi-sales':
      return (
        <SubsidiaryTemplate
          name="Northstar Industries - Sales Division"
          slug="nsi-sales"
          tagline="Driving commerce across Nordics with excellence and reach."
          heroIcon={<Factory className="w-10 h-10 text-primary" />}
          description={[
            'The Sales Division of Northstar Industries focuses on market presence, brand partnerships, and streamlined distribution across key trade hubs.',
            'Leveraging Northstar’s strategic location, the division coordinates trade fairs, retail experiences, and wholesale contracts to empower partners and customers.'
          ]}
          highlights={[
            'Trade fair coordination',
            'Retail channel management',
            'Wholesale procurement',
            'Featured marketplace events',
          ]}
          offeringsTitle="Sales Programs"
          offerings={[
            'Seasonal promotions and bundles',
            'Marketplace pop-up stands',
            'Logistics coordination for partners',
            'Preferred vendor onboarding',
          ]}
        />
      );
    case 'nsi-mining':
      return (
        <SubsidiaryTemplate
          name="Northstar Industries - Mining Division"
          slug="nsi-mining"
          tagline="Resource extraction with safety, scale, and sustainability."
          heroIcon={<Pickaxe className="w-10 h-10 text-primary" />}
          description={[
            'The Mining Division provides reliable access to raw materials with strict safety protocols and optimized extraction routes.',
            'From coordinated digs to supplier contracts, the division ensures continuous supply for builders and manufacturers.'
          ]}
          highlights={[
            'Bulk resource contracts',
            'Safety-first operations',
            'Expedition planning',
            'Ore processing partners',
          ]}
          offeringsTitle="Mining Services"
          offerings={[
            'Contract mining (by volume)',
            'Exploration and surveying',
            'Secure transport and storage',
            'On-demand delivery',
          ]}
        />
      );
    case 'nsi-banking':
      return (
        <SubsidiaryTemplate
          name="Northstar Industries - Banking Division"
          slug="nsi-banking"
          tagline="Finance that fuels growth across the Northstar ecosystem."
          heroIcon={<Banknote className="w-10 h-10 text-primary" />}
          description={[
            'The Banking Division enables trade scaling through secure deposits, microloans, and investment facilitation for merchants and enterprises.',
            'It focuses on transparency, fair terms, and sustained growth for partners.'
          ]}
          highlights={[
            'Microloans for merchants',
            'Escrow and settlement',
            'Vault storage solutions',
            'Transaction analytics',
          ]}
          offeringsTitle="Financial Products"
          offerings={[
            'Merchant accounts and ledgers',
            'Escrow-backed trades',
            'Short-term financing',
            'Revenue share programs',
          ]}
        />
      );
    case 'kabbe-disk-shop':
      return (
        <SubsidiaryTemplate
          name="Kabbe2121’s Disk shop"
          slug="kabbe-disk-shop"
          tagline="Your destination for music disks and rare audio finds."
          heroIcon={<Disc3 className="w-10 h-10 text-primary" />}
          description={[
            'A boutique store specializing in music disks, curated collections, and collector-grade items.',
            'Known for fair prices and consistent stock of sought-after tracks.'
          ]}
          highlights={[
            'Curated disk catalog',
            'Collector editions',
            'Buyback program',
          ]}
          offeringsTitle="Store Features"
          offerings={[
            'Weekly featured disks',
            'Limited-time bundles',
            'Trade-ins and appraisals',
          ]}
        />
      );
    case 'mora-tra':
      return (
        <SubsidiaryTemplate
          name="Mora Trä"
          slug="mora-tra"
          tagline="Premium lumber and crafted wood goods."
          heroIcon={<Trees className="w-10 h-10 text-primary" />}
          description={[
            'Mora Trä delivers sustainable lumber, refined planks, and bespoke woodwork for builds large and small.',
            'From bulk orders to unique commissions, quality and reliability are the core values.'
          ]}
          highlights={[
            'Sustainably sourced',
            'Bulk order discounts',
            'Custom carpentry',
          ]}
          offeringsTitle="Wood Products"
          offerings={[
            'Logs, planks, and slabs',
            'Decorative wood variants',
            'Custom furniture orders',
          ]}
        />
      );
    case 'magical-tower-of-friendship':
      return (
        <SubsidiaryTemplate
          name="Magical Tower of friendship"
          slug="magical-tower-of-friendship"
          tagline="Arcane services, enchanting solutions, and knowledge."
          heroIcon={<Wand2 className="w-10 h-10 text-primary" />}
          description={[
            'A center of arcane excellence offering enchanting, alchemy, and rare magical goods.',
            'Research-backed services and reliable results for adventurers and artisans.'
          ]}
          highlights={[
            'High-tier enchants',
            'Potion services',
            'Rare components',
          ]}
          offeringsTitle="Arcane Services"
          offerings={[
            'Custom enchant packages',
            'Potion brewing on demand',
            'Consultation and sourcing',
          ]}
        />
      );
    case 'medieval-ikea':
      return (
        <SubsidiaryTemplate
          name="Medieval IKEA"
          slug="medieval-ikea"
          tagline="Flat-pack medieval furnishings and decor, delivered."
          heroIcon={<Sofa className="w-10 h-10 text-primary" />}
          description={[
            'A playful take on furniture retail—with practical, stylish pieces for castles, keeps, and cozy towns.',
            'Affordable, modular, and always in fashion for medieval builds.'
          ]}
          highlights={[
            'Flat-pack furniture sets',
            'Color and material variants',
            'Express delivery options',
          ]}
          offeringsTitle="Collections"
          offerings={[
            'Castle Essentials Set',
            'Village Starter Pack',
            'Royal Suite Collection',
          ]}
        />
      );
    default:
      // Fallback to generic storefront using DB content if available
      return <CompanyStorefront />;
  }
};

export default SubsidiariesRouter;


