
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Banknote, BookOpen, ChevronDown, ChevronRight, Eye, Users, MapPin, MessageCircle, Link2, ChevronUp, Upload, ExternalLink, Loader2 } from 'lucide-react';
import { SupabaseNationData, SupabaseTownData } from '@/services/supabaseTownService';
import TownRow from './TownRow';
import NationImageUploadDialog from './NationImageUploadDialog';
import { NationImageService } from '@/services/nationImageService';
import { useAuth } from '@/hooks/useAuth';
import { useNationImage } from '@/hooks/useDynamicImage';
import EditNationModal from './EditNationModal';

interface NationCardProps {
  nation: SupabaseNationData & { towns: SupabaseTownData[] };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewTown: (town: SupabaseTownData & { nation: string; nationColor: string }) => void;
  onNationUpdated?: (updatedNation: SupabaseNationData) => void;
  loading?: boolean;
}

const NationCard: React.FC<NationCardProps> = ({ nation, isExpanded, onToggleExpand, onViewTown, onNationUpdated, loading }) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [canUpdateImage, setCanUpdateImage] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const { profile } = useAuth();



  // Use dynamic image service with fallback logic
  const { imageUrl, isLoading, error } = useNationImage(nation.name, nation.image_url);

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border border-border overflow-hidden bg-card">
        <Skeleton className="h-32 w-full rounded-t-2xl mb-4" />
        <CardHeader className="pb-0 pt-8 pl-32 relative">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4 mb-2" />
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
        </CardContent>
      </Card>
    );
  }

  // Use nation color for border accent
  const borderColorClass = nation.color ? nation.color.replace('text-', 'border-') : 'border-primary';

  return (
    <Card className={`rounded-2xl shadow-lg border-2 ${borderColorClass} overflow-hidden group hover:shadow-xl transition-all duration-300 bg-card`}> 
      {/* Wide Banner/Flag */}
      <div 
        className="relative h-32 w-full flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: nation.color || '#1e40af',
          backgroundImage: nation.banner_image_url ? `url(${nation.banner_image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Banner Overlay for better text visibility */}
        {nation.banner_image_url && (
          <div 
            className="absolute inset-0 bg-black/20"
            style={{ backgroundColor: `${nation.color || '#1e40af'}80` }}
          />
        )}
        
        {/* Nation Flag/Image */}
        {isLoading ? (
          <div className="h-24 w-24 absolute left-8 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg p-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={nation.name + ' flag'}
            className="h-24 w-24 object-cover absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity rounded-lg p-1"
            onError={e => (e.currentTarget.style.display = 'none')}
            onClick={() => {
              if (imageUrl) {
                window.open(imageUrl, '_blank');
              }
            }}
            title={imageUrl ? "Click to open image in new tab" : "Nation flag"}
          />
        )}
        
        {/* Banner Text */}
        {nation.banner_text && (
          <div 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-center"
            style={{
              color: nation.banner_text_color || '#ffffff',
              fontSize: `${nation.banner_text_size || 16}px`,
              fontWeight: nation.banner_text_style === 'bold' ? 'bold' : 'normal',
              fontStyle: nation.banner_text_style === 'italic' ? 'italic' : 'normal',
              textDecoration: nation.banner_text_style === 'underline' ? 'underline' : 'none'
            }}
          >
            <div className="bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
              {nation.banner_text}
            </div>
          </div>
        )}
        
        {/* Image Upload Button - Only show for nation leaders */}
        {profile && (profile.role === 'admin' || profile.role === 'moderator' || profile.full_name === nation.leader_name) && (
          <Button
            size="icon"
            variant="outline"
            className="absolute left-8 top-1/2 -translate-y-1/2 translate-x-16 bg-background/90 hover:bg-background z-10"
            onClick={() => setShowImageUpload(true)}
            title="Upload nation image"
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
        
        {/* Edit Nation Button - Only show for nation leaders */}
        {profile && (profile.role === 'admin' || profile.role === 'moderator' || profile.full_name === nation.leader_name) && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 translate-x-32 z-10">
            <EditNationModal 
              nation={nation}
              onNationUpdated={(updatedNation) => {
                // Call the parent's onNationUpdated callback if provided
                if (onNationUpdated) {
                  onNationUpdated(updatedNation);
                }
              }}
            />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-0 pt-8 relative">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <Crown 
              className="w-6 h-6" 
              style={{ 
                color: nation.theme_color || '#eab308',
                fill: nation.theme_color || '#eab308'
              }}
            />
            {/* Vassal Icon */}
            {nation.vassal_of && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Link2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  Vassal of {nation.vassal_of}
                </span>
              </div>
            )}
            <CardTitle className={`text-2xl font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors`}>
              <Link to={`/nation/${encodeURIComponent(nation.name)}`}>
                {nation.name.replace(/_/g, ' ')}
              </Link>
            </CardTitle>
          </div>
          
          {/* Nation Description/Bio */}
          {nation.description && (
            <div className="mb-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{nation.description}</p>
            </div>
          )}
          
          <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground mb-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {nation.towns_count || nation.towns?.length || 0} towns
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {nation.ally_count || 0} allies
            </div>
            <span className="text-xs">Founded: {nation.founded}</span>
          </div>
          

          <div className="mt-2">
            {nation.motto && (
              <p className="text-xs font-medium text-primary">{nation.motto}</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 pb-2">
        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Crown 
                className="w-4 h-4" 
                style={{ 
                  color: nation.theme_color || '#eab308',
                  fill: nation.theme_color || '#eab308'
                }}
              />
              <span className="font-semibold text-foreground">Leader:</span>
              <button
                className="font-medium text-foreground hover:underline text-left"
                onClick={() => {
                  // Navigate to community page with leader parameter
                  window.location.href = `/community?player=${encodeURIComponent(nation.leader)}`;
                }}
              >
                {nation.leader}
              </button>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-foreground">Capital:</span>
              <span className="font-medium text-foreground">{nation.capital}</span>
            </div>
            {/* Vassal Status */}
            {nation.vassal_of && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Link2 className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-foreground">Vassal of:</span>
                <span className="font-medium text-foreground">{nation.vassal_of}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Banknote className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-foreground">Treasury:</span>
              <span className="font-medium text-foreground">{nation.bank}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Population:</span>
              <span className="font-medium text-foreground">{nation.population} citizens</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="font-semibold text-foreground">Ruling Entity:</span>
              <span className="font-medium text-foreground">{nation.ruling_entity || 'Monarch'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="font-semibold text-foreground">Government System:</span>
              <span className="font-medium text-foreground">{nation.government_system || 'Monarchy'}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="font-semibold text-foreground">Economic System:</span>
              <span className="font-medium text-foreground">{nation.economic_system || 'Capitalist'}</span>
            </div>
          </div>
        </div>
        <hr className="my-4 border-border/40" />
        {/* Lore Section */}
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            <BookOpen className="w-4 h-4" />
            Lore
            <ChevronRight className="w-3 h-3 ml-1 group-open:rotate-90 transition-transform duration-200" />
          </summary>
          <div className="mt-2 pl-2 border-l-2 border-muted">
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{nation.lore}</p>
          </div>
        </details>
        {/* Towns as Mini-Cards */}
        {isExpanded && nation.towns && nation.towns.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Towns in {nation.name}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nation.towns.map((town, index) => (
                <div key={town.name} className="rounded-xl bg-muted/30 p-6 flex flex-col items-start shadow group hover:bg-muted/50 transition">
                  <div className="mb-3 w-full">
                    <Link 
                      to={`/town/${encodeURIComponent(town.name)}`}
                      className="font-semibold text-base truncate hover:text-primary transition-colors cursor-pointer"
                    >
                      {town.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-4 w-full">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{town.population}</span>
                    <Badge variant="outline" className="text-sm flex-shrink-0 ml-auto">
                      {town.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto w-full">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-sm px-2 py-1 h-8 w-full"
                      onClick={() => onViewTown({ 
                        ...town, 
                        nation: nation.name, 
                        nationColor: nation.color || 'text-primary' 
                      } as SupabaseTownData & { nation: string; nationColor: string })}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Quick View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Expand/Collapse Button */}
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Towns
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Towns ({nation.towns?.length || 0})
              </>
            )}
          </Button>
        </div>
      </CardContent>
      
      {/* Nation Image Upload Dialog */}
      <NationImageUploadDialog
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        nationId={nation.id}
        nationName={nation.name}
        currentImageUrl={nation.image_url}
        onImageUpdated={(imageUrl) => {
          // Close the dialog
          setShowImageUpload(false);
          // Call the parent's onNationUpdated callback if provided
          if (onNationUpdated) {
            onNationUpdated({ ...nation, image_url: imageUrl });
          }
        }}
      />
    </Card>
  );
};

export default NationCard;
