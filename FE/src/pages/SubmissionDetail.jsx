import React from "react";
import { Container, Typography, Box } from "@mui/material";

const SubmissionDetail = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submission Detail
      </Typography>
      <Typography variant="body1">
        This page will show submission details and allow users to like, vote,
        and share submissions.
      </Typography>
    </Container>
  );
};

export default SubmissionDetail;
