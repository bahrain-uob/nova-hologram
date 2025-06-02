"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StarIcon, EditIcon, TrashIcon } from "lucide-react";

interface Review {
  reviews_id: string;
  user_email: string;
  user_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

interface ReviewSectionProps {
  bookId: string;
  currentUserEmail?: string;
  currentUserName?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  bookId,
  currentUserEmail,
  currentUserName,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingPercentages, setRatingPercentages] = useState<{
    [key: string]: number;
  }>({});
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");

  // Add state for user session data
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_REVIEWS_API_URL ||
    "https://2nb21liwx4.execute-api.us-east-1.amazonaws.com";

  // Get user data from session
  useEffect(() => {
    try {
      const userSessionStr = localStorage.getItem("userSession");
      if (userSessionStr) {
        const userSession = JSON.parse(userSessionStr);

        if (userSession.email) {
          setUserEmail(userSession.email);
        }

        if (userSession.attributes && userSession.attributes.name) {
          setUserName(userSession.attributes.name);
        } else if (userSession.email) {
          const name = userSession.email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    } catch (error) {
      console.error("Error getting user session:", error);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/reviews?bookId=${bookId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
      setRatingPercentages(data.ratingPercentages || {});
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!userRating || !reviewText.trim()) {
      alert("Please provide both a rating and review text.");
      return;
    }

    if (!userEmail) {
      alert("Please log in to submit a review.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          userId: userEmail,
          userName: userName || currentUserName,
          rating: userRating,
          reviewText: reviewText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      alert("Your review has been submitted successfully!");

      // Reset form
      setUserRating(0);
      setReviewText("");

      // Refresh reviews
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateReview = async (reviewId: string) => {
    if (!editRating || !editText.trim()) {
      alert("Please provide both a rating and review text.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          userId: userEmail,
          rating: editRating,
          reviewText: editText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update review");
      }

      alert("Your review has been updated successfully!");

      setEditingReview(null);
      setEditRating(0);
      setEditText("");

      await fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update review. Please try again."
      );
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete review");
      }

      alert("Your review has been deleted successfully!");

      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete review. Please try again."
      );
    }
  };

  const startEditing = (review: Review) => {
    setEditingReview(review.reviews_id);
    setEditRating(review.rating);
    setEditText(review.review_text);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditText("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Reviews</h2>

      {/* Rating Summary */}
      <div className="flex items-center mb-2">
        <span className="text-2xl text-yellow-400">{averageRating}</span>
        <div className="flex ml-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon
              key={i}
              className={`w-5 h-5 ${
                i <= Math.round(averageRating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
      </p>

      {/* Rating Breakdown */}
      {totalReviews > 0 && (
        <div className="mb-6 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8">{star}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${ratingPercentages[star] || 0}%` }}
                />
              </div>
              <span className="w-10 text-right">
                {ratingPercentages[star] || 0}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Write a Review Section */}
      {userEmail ? (
        <div className="mb-8">
          <h3 className="text-base font-medium mb-3">Write a Review</h3>

          {/* Star Rating */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon
                key={i}
                onClick={() => setUserRating(i)}
                className={`w-6 h-6 cursor-pointer transition-colors duration-150 ${
                  i <= userRating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
              />
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md text-sm placeholder:text-[#adaebc] focus:outline-none focus:ring focus:ring-indigo-200"
            placeholder="Share your thoughts..."
            disabled={isSubmitting}
          />

          {/* Submit Button */}
          <Button
            onClick={submitReview}
            disabled={isSubmitting || !userRating || !reviewText.trim()}
            className="w-full mt-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
          <p className="text-gray-600">Please log in to write a review.</p>
        </div>
      )}

      {/* Reviews List */}
      <ScrollArea className="flex-1 pr-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No reviews yet. Be the first to review this book!
          </p>
        ) : (
          reviews.map((review, index) => (
            <div key={review.reviews_id} className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user_name}`}
                    />
                    <AvatarFallback>
                      {review.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800">
                      {review.user_name}
                    </p>
                    <div className="flex items-center mt-1">
                      {editingReview === review.reviews_id ? (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon
                              key={i}
                              onClick={() => setEditRating(i)}
                              className={`w-4 h-4 cursor-pointer ${
                                i <= editRating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(review.created_at)}
                      {review.updated_at !== review.created_at && " (edited)"}
                    </p>
                  </div>
                </div>

                {/* Edit/Delete buttons for user's own reviews */}
                {review.user_email === userEmail && (
                  <div className="flex gap-2">
                    {editingReview === review.reviews_id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateReview(review.reviews_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(review)}
                        >
                          <EditIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReview(review.reviews_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingReview === review.reviews_id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                />
              ) : (
                <p className="text-sm text-zinc-700">{review.review_text}</p>
              )}

              {index < reviews.length - 1 && (
                <Separator className="my-4 border-t border-[#E5E7EB]" />
              )}
            </div>
          ))
        )}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default ReviewSection;
