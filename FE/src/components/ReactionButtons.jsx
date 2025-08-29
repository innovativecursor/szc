import React, { useState, useEffect } from "react";
import { IconButton, Typography, Box, Tooltip, Badge } from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  HowToVote as VoteIcon,
  HowToVoteOutlined as VoteOutlinedIcon,
} from "@mui/icons-material";
import { reactionsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const ReactionButtons = ({ submission, onReactionChange }) => {
  const { user } = useAuth();
  const [userReactions, setUserReactions] = useState({
    like: false,
    vote: false,
  });
  const [counts, setCounts] = useState({
    likes: submission.likes || 0,
    votes: submission.votes || 0,
  });
  const [loading, setLoading] = useState(false);

  // Check if user has already reacted to this submission
  useEffect(() => {
    if (submission.reactions && user) {
      const userReactions = submission.reactions.filter(
        (reaction) => reaction.userId === user.id
      );

      const userReactionTypes = userReactions.map((r) => r.reaction);
      setUserReactions({
        like: userReactionTypes.includes("like"),
        vote: userReactionTypes.includes("vote"),
      });
    }
  }, [submission.reactions, user]);

  const handleReaction = async (reactionType) => {
    if (!user) return;

    setLoading(true);
    try {
      // Always call addReaction - the backend will handle toggling
      await addReaction(reactionType);
    } catch (error) {
      console.error(`Error handling ${reactionType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (reactionType) => {
    try {
      const response = await reactionsAPI.create({
        submission_id: submission.id,
        reaction: reactionType,
      });

      if (response.data) {
        if (response.data.removed) {
          // Reaction was removed (toggled off)
          setUserReactions((prev) => ({ ...prev, [reactionType]: false }));
          setCounts((prev) => ({
            ...prev,
            [reactionType === "like" ? "likes" : "votes"]: Math.max(
              0,
              prev[reactionType === "like" ? "likes" : "votes"] - 1
            ),
          }));
        } else {
          // Reaction was added or updated
          setUserReactions((prev) => ({ ...prev, [reactionType]: true }));
          // If it was a different reaction type, we need to handle the count properly
          // For now, we'll refresh the data from the parent
        }

        // Notify parent component to refresh data
        if (onReactionChange) {
          onReactionChange();
        }
      }
    } catch (error) {
      console.error(`Error adding ${reactionType}:`, error);
      throw error;
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Like Button */}
      <Tooltip title={userReactions.like ? "Unlike" : "Like"}>
        <IconButton
          onClick={() => handleReaction("like")}
          disabled={loading}
          color={userReactions.like ? "primary" : "default"}
          size="small"
        >
          <Badge badgeContent={counts.likes} color="primary">
            {userReactions.like ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Vote Button */}
      <Tooltip title={userReactions.vote ? "Remove Vote" : "Vote"}>
        <IconButton
          onClick={() => handleReaction("vote")}
          disabled={loading}
          color={userReactions.vote ? "secondary" : "default"}
          size="small"
        >
          <Badge badgeContent={counts.votes} color="secondary">
            {userReactions.vote ? <VoteIcon /> : <VoteOutlinedIcon />}
          </Badge>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ReactionButtons;
