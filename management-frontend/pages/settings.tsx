import Head from "next/head";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import Image from 'next/image';
import { getApplicationName, getImage, updateCustomisation } from "@/config/tenantConfig";

export default function Settings() {
  const [appName, setAppName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // Dynamisch initialisieren
    setAppName(getApplicationName() || "");
    setImageUrl(getImage() || "");
  }, []);

  const handleUpdateCustomisation = () => {
    // Funktion zur Aktualisierung der Personalisierung
    updateCustomisation(appName, imageUrl);
  };

  return (
    <>
      <Head>
        <title>Einstellungen</title>
        <meta name="description" content="Einstellungen der Anwendung" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://fo9.de/flutter/favicon.ico" />
      </Head>
      <Container maxWidth="md">

        <Box textAlign="center" my={4}>
          {imageUrl ? (
            <Image src={imageUrl} alt="Logo" width={75} height={70} />
          ) : (
            <Image src="https://fo9.de/flutter/parkhaus.png" alt="Logo" width={75} height={70} />
          )}
          <Typography variant="h3" gutterBottom>
            {appName || "GM-GarageManager"}
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Personalisieren Sie Ihre Anwendung:
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Anwendungsname"
                fullWidth
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
              <TextField
                label="Logo-URL"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateCustomisation}
              >
                Änderungen speichern
              </Button>
            </Box>
          </CardContent>
        </Card>

        <footer style={{ textAlign: "center", margin: "20px 0" }}>
          <Typography variant="body2" color="textSecondary">
            © 2024 GM Parking-Solutions
          </Typography>
        </footer>
      </Container>
    </>
  );
}