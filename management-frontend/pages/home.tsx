import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupIcon from "@mui/icons-material/Group";
import AccountBalance from "@mui/icons-material/AccountBalance";
import SettingsIcon from "@mui/icons-material/Settings";
import { getApplicationName, getImage, getTier } from "@/config/tenantConfig";

export default function Home() {
  const [appName, setAppName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tier, setTier] = useState("");

  useEffect(() => {
    // Dynamisch initialisieren
    setAppName(getApplicationName() || "GM-GarageManager");
    setImageUrl(getImage() || "");
    setTier(getTier() || "ENTRY");
  }, []);

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Startseite der Anwendung" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://fo9.de/flutter/favicon.ico" />
      </Head>
      <Container maxWidth="lg">
        <Box textAlign="center" my={4}>
          <Box textAlign="center">
            {imageUrl ? (
              <Image src={imageUrl} alt="Logo" width={75} height={70} />
            ) : (
              <Image src="https://fo9.de/flutter/parkhaus.png" alt="Logo" width={75} height={70} />
            )}
            <Typography variant="h3" gutterBottom>
              {appName}
            </Typography>
          </Box>
        </Box>

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="center"
          gap={4}
          my={4}
        >
          <Card sx={{ maxWidth: 345, flex: 1 }}>
            <CardContent>
              <ApartmentIcon color="primary" sx={{ fontSize: 50, marginBottom: 2 }} />
              <Typography variant="h5" component="div">
                Properties
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Verwalten Sie Ihre Objekte und Standorte effizient.
              </Typography>
            </CardContent>
            <CardActions>
              <Link href="/properties" passHref>
                <Button variant="contained" color="primary" fullWidth>
                  Gehe zu Properties
                </Button>
              </Link>
            </CardActions>
          </Card>

          <Card sx={{ maxWidth: 345, flex: 1 }}>
            <CardContent>
              <BuildIcon color="secondary" sx={{ fontSize: 50, marginBottom: 2 }} />
              <Typography variant="h5" component="div">
                Defects123
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Erstellen und verwalten Sie Mängel in Ihren Objekten.
              </Typography>
            </CardContent>
            <CardActions>
              <Link href="/defects" passHref>
                <Button variant="contained" color="secondary" fullWidth>
                  Gehe zu Defects
                </Button>
              </Link>
            </CardActions>
          </Card>

          <Card sx={{ maxWidth: 345, flex: 1 }}>
            <CardContent>
              <GroupIcon color="success" sx={{ fontSize: 50, marginBottom: 2 }} />
              <Typography variant="h5" component="div">
                Benutzer
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Erstellen und verwalten Sie die Benutzer ihrer Anwendung.
              </Typography>
            </CardContent>
            <CardActions>
              <Link href="/users" passHref>
                <Button variant="contained" color="success" fullWidth>
                  Gehe zu Users
                </Button>
              </Link>
            </CardActions>
          </Card>
          {tier !== 'ENTRY' && (
            <Card sx={{ maxWidth: 345, flex: 1 }}>
              <CardContent>
                <AccountBalance color="warning" sx={{ fontSize: 50, marginBottom: 2 }} />
                <Typography variant="h5" component="div">
                  Finanzen
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Erstellen und exportieren Sie verschiedene Reports.
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/finance" passHref>
                  <Button variant="contained" color="warning" fullWidth>
                    Gehe zu Finanzen
                  </Button>
                </Link>
              </CardActions>
            </Card>
          )}
        </Box>

        <footer style={{ textAlign: "center", margin: "20px 0" }}>
          <Typography variant="body2" color="textSecondary">
            © 2024 GM Parking-Solutions
          </Typography>
          {tier !== 'ENTRY' && (
            <Link href="/settings" passHref>
              <IconButton color="primary" aria-label="Einstellungen">
                <SettingsIcon fontSize="large" />
              </IconButton>
            </Link>
          )}
        </footer>

      </Container>
    </>
  );
}
