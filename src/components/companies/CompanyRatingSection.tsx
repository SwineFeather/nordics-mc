import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, User } from 'lucide-react';
import { CompanyRatingService, CompanyRating, CompanyRatingStats } from '@/services/companyRatingService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CompanyRatingSectionProps {
  companyId: string;
  companyName: string;
}

const CompanyRatingSection: React.FC<CompanyRatingSectionProps> = ({ companyId, companyName }) => {
  const { user, profile } = useAuth();
  const [ratings, setRatings] = useState<CompanyRating[]>([]);
  const [stats, setStats] = useState<CompanyRatingStats>({
    average_rating: 0,
    total_ratings: 0,
    rating_distribution: {}
  });
  const [userRating, setUserRating] = useState<CompanyRating | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [companyId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const [ratingsData, statsData] = await Promise.all([
        CompanyRatingService.getCompanyRatings(companyId),
        CompanyRatingService.getCompanyRatingStats(companyId)
      ]);
      
      setRatings(ratingsData);
      setStats(statsData);

      if (user) {
        const userRatingData = await CompanyRatingService.getUserRating(companyId, user.id);
        setUserRating(userRatingData);
        if (userRatingData) {
          setRating(userRatingData.rating);
          setComment(userRatingData.comment);
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user || !profile) {
      toast.error('You must be logged in to submit a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please provide a comment with your rating');
      return;
    }

    setSubmitting(true);
    try {
      const success = await CompanyRatingService.submitRating(
        companyId,
        rating,
        comment.trim(),
        user.id,
        profile.minecraft_username || 'Unknown User'
      );

      if (success) {
        setShowRatingForm(false);
        await fetchRatings(); // Refresh ratings
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRating = () => {
    setShowRatingForm(true);
  };

  const handleCancelEdit = () => {
    setShowRatingForm(false);
    if (userRating) {
      setRating(userRating.rating);
      setComment(userRating.comment);
    } else {
      setRating(5);
      setComment('');
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Ratings & Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : 'No ratings yet'}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.average_rating > 0 ? 'out of 5' : ''}
              </div>
              {stats.average_rating > 0 ? renderStars(stats.average_rating) : (
                <div className="flex items-center gap-1 justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-gray-300" />
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {stats.total_ratings > 0 ? `${stats.total_ratings} ${stats.total_ratings === 1 ? 'rating' : 'ratings'}` : 'No ratings yet'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${stats.total_ratings > 0 ? (stats.rating_distribution[star] || 0) / stats.total_ratings * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {stats.rating_distribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rating Form */}
          {user ? (
            <div>
              {!showRatingForm && !userRating ? (
                <Button onClick={() => setShowRatingForm(true)} className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  Rate this Company
                </Button>
              ) : !showRatingForm && userRating ? (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Your Rating:</span>
                      {renderStars(userRating.rating)}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEditRating}>
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{userRating.comment}</p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    {renderStars(rating, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this company..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitRating} 
                      disabled={submitting || !comment.trim()}
                      className="flex-1"
                    >
                      {submitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Please log in to rate this company
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Ratings */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              All Reviews ({ratings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{rating.username}</span>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    {renderStars(rating.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground">{rating.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyRatingSection;
