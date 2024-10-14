import React from 'react';
import Head from "next/head";
import { Typography } from "@mui/material";

export default function Home() {
  return (
    <>
      <Head>
        <title>Typography and Color Overview</title>
        <meta name="description" content="Typography and Color Overview" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Typography Variants & Material Colors
        </Typography>

        {/* Typography Variants */}
        <div style={{ marginBottom: "20px" }}>
          <Typography variant="h1" gutterBottom>
            h1 - Heading 1
          </Typography>
          <Typography variant="h2" gutterBottom>
            h2 - Heading 2
          </Typography>
          <Typography variant="h3" gutterBottom>
            h3 - Heading 3
          </Typography>
          <Typography variant="h4" gutterBottom>
            h4 - Heading 4
          </Typography>
          <Typography variant="h5" gutterBottom>
            h5 - Heading 5
          </Typography>
          <Typography variant="h6" gutterBottom>
            h6 - Heading 6
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            subtitle1 - Subtitle 1
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            subtitle2 - Subtitle 2
          </Typography>
          <Typography variant="body1" gutterBottom>
            body1 - Body 1 text
          </Typography>
          <Typography variant="body2" gutterBottom>
            body2 - Body 2 text
          </Typography>
          <Typography variant="caption" gutterBottom>
            caption - Caption text
          </Typography>
          <Typography variant="overline" gutterBottom>
            overline - Overline text
          </Typography>
          <Typography variant="button" gutterBottom>
            button - Button text
          </Typography>
        </div>

        {/* Material UI Colors */}
        <div style={{ marginBottom: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Material UI Colors
          </Typography>
          <Typography color="primary" gutterBottom>
            Primary Color
          </Typography>
          <Typography color="secondary" gutterBottom>
            Secondary Color
          </Typography>
          <Typography color="textPrimary" gutterBottom>
            Text Primary Color
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Text Secondary Color
          </Typography>
          <Typography color="error" gutterBottom>
            Error Color
          </Typography>
          <Typography color="info" gutterBottom>
            Info Color
          </Typography>
          <Typography color="success" gutterBottom>
            Success Color
          </Typography>
          <Typography color="warning" gutterBottom>
            Warning Color
          </Typography>
        </div>
      </main>
    </>
  );
}
