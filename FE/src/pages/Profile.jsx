import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Profile = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="body1">
        This page will allow users to view and edit their profile information.
      </Typography>
    </Container>
  );
};

export default Profile;
