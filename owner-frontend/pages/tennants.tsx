import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { TenantsApi } from "@/api/apis/TenantsApi";
import { Tenant } from "@/api/models/Tenant";
import { TenantTierEnum } from "@/api/models/Tenant";
import { useEffect, useState, createRef } from "react";
import styles from "@/styles/owner.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import * as Api from '../api';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Box,
  IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText
} from "@mui/material";
import { firebase } from "@/config/firebaseConfig";
import { useRouter } from "next/router";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [newTenant, setNewTenant] = useState<Tenant>({
    name: "",
    tenantId: "",
    services: undefined,
    customisation: undefined,
    tier: "Entry",
    preferedRegion: ""
  });
  const [filter, setFilter] = useState({
    tier: "",
  });

  const [filterForm, setFilterForm] = useState({
    tier: "",
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const appName = process.env.NEXT_PUBLIC_APPLICATION_NAME || "GM-Parking Solutions-local";
  const router = useRouter();


  useEffect(() => {
    fetchTenants();
  }, [filter]);


  const getToken = () => {
    if (typeof window === "undefined") {
      console.log("Window was null getToken")
      return null;
    }
    // Production: Speichere im sessionStorage
    return sessionStorage.getItem("authToken");
  };

  const configParameters: Api.ConfigurationParameters = {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
    },
  };
  const config = new Api.Configuration(configParameters);

  const handleDeleteTenant = (tenantId: string) => {
    const tenantsApi = new TenantsApi(config);
    const requestParameters = { id: tenantId };

    tenantsApi
      .deleteTenant(requestParameters)
      .then(() => {
        console.log("Defekt erfolgreich gelöscht");
        fetchTenants();
      })
      .catch((error) => {
        console.error("Fehler beim Löschen des Defekts:", error);
      });
  };

  const fetchTenants = async () => {
    console.log("env:", process.env.NEXT_PUBLIC_BASE_PATH);
    const tenantsApi = new TenantsApi(config);
    try {
      const requestParameters = {
        tier: filter.tier as TenantTierEnum || undefined,
      };

      console.log("Fetching tenants with parameters:", requestParameters);
      const response = await tenantsApi.listTenants(requestParameters);
      setTenants(response);
    } catch (error: any) {
      console.error("Fehler beim Laden der Mängel:", error);
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilter(filterForm);
  };

  const getMimeType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'heic':
        return 'image/heic';
      case 'heif':
        return 'image/heif';
      default:
        return 'application/octet-stream'; // Fallback für unbekannte Formate
    }
  };


  const handleAddTenant = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    var fileBlob = undefined;
    if (acceptedFiles.length != 0) {
      const file = acceptedFiles[0];
      const mimeType = getMimeType(file.name);
      fileBlob = new Blob([file], { type: mimeType });
    }

    const tenantsApi = new TenantsApi(config);
    tenantsApi
      .addTenant({ tenant: newTenant })
      .then((response) => {
        console.log("Defekt erfolgreich hinzugefügt:", response);
        fetchTenants();
        setNewTenant({
          name: "",
          tenantId: "",
          services: undefined,
          customisation: undefined,
          tier: "Entry",
          preferedRegion: ""
        });
        setAcceptedFiles([]);
      })
      .catch((error) => {
        console.error("Fehler beim Hinzufügen des Defekts:", error);
      });
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : null); // Setzt expanded auf null, wenn das Panel geschlossen wird
  };

  const toggleCard = (index: number, id: string | undefined) => {
    if (!open) {
      setExpandedCard(expandedCard === index ? null : index);
    }
  };

  const handleUpdateTier = (e: React.ChangeEvent<{ value: unknown }>, tenant: Tenant, tier: TenantTierEnum) => {
    e.preventDefault();
    const tenantsApi = new TenantsApi(config);
    tenant.tier = tier;
    if (!tenant.id) {
      console.error("Defekt ID fehlt");
      return;
    }
    const requestParameters = { id: tenant.id, tenant: tenant };

    tenantsApi
      .updateTenant(requestParameters)
      .then(() => {
        console.log("Defekt erfolgreich aktualisiert");
        fetchTenants();
      })
      .catch((error) => {
        console.error("Fehler beim Aktualisieren des Defekts:", error);
      });
  };

  const handleOpen = () => {
    console.log('Dialog geöffnet');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReset = () => {
    setFilter({
      tier: '',
    });
    setFilterForm({
      tier: '',
    });
  };

  const dropzoneRef = createRef<DropzoneRef>();
  const openDialog = () => {
    // Note that the ref is set async,
    // so it might be null at some point 
    if (dropzoneRef.current) {
      dropzoneRef.current.open()
    }
  };


  return (
    <>
      <Head>
        <title>Tenants</title>
        <meta name="description" content="Anwendung zur Verwaltung von Mängeln" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container className={`${geistSans.variable} ${geistMono.variable}`} maxWidth="lg">
        <main>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <Image
              src="/parkhaus.png"
              alt="Parkhaus"
              width={75}
              height={70

              }
            />
            <Typography variant="h3" gutterBottom>
              {appName}
            </Typography>

          </div>

          <Typography variant="h4" gutterBottom>
            Tenant Management
          </Typography>

          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Neuen Tenant erstellen</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form onSubmit={handleAddTenant} style={{ marginBottom: "20px" }}>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between" gap={2}>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Name"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Region"
                      value={newTenant.preferedRegion}
                      onChange={(e) => setNewTenant({ ...newTenant, preferedRegion: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth required>
                      <InputLabel>Tier</InputLabel>
                      <Select
                        value={newTenant.tier}
                        onChange={(e) => setNewTenant({ ...newTenant, tier: e.target.value as TenantTierEnum })}
                        label="Tier"
                      >
                        <MenuItem value="Entry">Entry</MenuItem>
                        <MenuItem value="Enhanced">Enhanced</MenuItem>
                        <MenuItem value="Premium">Premium</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box flexBasis="100%">
                    <Button type="submit" variant="contained" color="primary">
                      Tenant hinzufügen
                    </Button>
                  </Box>
                </Box>
              </form>
            </AccordionDetails>
          </Accordion>
          <div style={{ marginTop: '20px' }}>

          </div>


          <form onSubmit={handleFilterSubmit} style={{ marginBottom: "20px", }}>
            <Accordion expanded={expanded === 'filterPanel'} onChange={handleChange('filterPanel')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth>
                      <InputLabel>Tier</InputLabel>
                      <Select
                        value={filterForm.tier}
                        onChange={(e) => setFilterForm({ ...filterForm, tier: e.target.value })}
                        label="Tier"
                      >
                        <MenuItem value="Entry">Entry</MenuItem>
                        <MenuItem value="Enhanced">Enhanced</MenuItem>
                        <MenuItem value="Premium">Premium</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box display="flex" flexBasis={{ xs: '100%', sm: '100%' }} alignItems="center">
                    <Button type="submit" variant="contained" color="primary"
                      style={{ height: 'fit-content', marginLeft: "20px" }}>
                      Anwenden
                    </Button>
                    <IconButton onClick={handleReset} color="primary" aria-label="reset filter"
                      style={{ marginLeft: "20px" }}>
                      <FilterListOffIcon />
                    </IconButton>
                  </Box>

                </Box>
              </AccordionDetails>
            </Accordion>
          </form>


          <Box display="flex" flexWrap="wrap" gap={2}>
            {tenants.map((tenant, index) => {
              const isExpanded = expandedCard === index;
              const imageUrl = blobUrls[index];
              return (
                <Box key={index} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} mb={2}>
                  <Card
                    style={{ height: isExpanded ? 'auto' : '100px' }}> {/* Festgelegte Höhe für eingeklappte Karten */}
                    <CardContent onClick={() => toggleCard(index, tenant.id)} style={{ cursor: 'pointer' }}>
                      <Typography variant="h5">{tenant.name}</Typography>
                      <Typography color="textSecondary">
                        <strong>{tenant.preferedRegion}</strong>
                      </Typography>

                      {isExpanded && (
                        <>
                          <Typography variant="h6">Standort:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {tenant.preferedRegion}
                          </Typography>
                          <Typography variant="h6">Tier:</Typography>

                          {/* Select außerhalb von Typography */}
                          <Select
                            value={tenant.tier}
                            onChange={(e) => tenant.id && handleUpdateTier(e as React.ChangeEvent<{
                              value: unknown
                            }>, tenant, e.target.value as TenantTierEnum)}
                            onOpen={handleOpen}
                            onClose={handleClose}
                            className={styles[tenant.tier?.toLowerCase() || "undefined"]}
                            variant="standard"
                            size="small"
                          >
                            <MenuItem value="Entry">Entry</MenuItem>
                            <MenuItem value="Enhanced">Enhanced</MenuItem>
                            <MenuItem value="Premium">Premium</MenuItem>
                          </Select>
                        </>
                      )}
                    </CardContent>

                    {isExpanded && (
                      <CardActions>
                        <Button size="small" color="error"
                          onClick={() => tenant.id && handleDeleteTenant(tenant.id)}>
                          Löschen
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Box>
              );
            })}
          </Box>


          <div style={{ marginTop: "40px" }}>
            <Typography variant="h4">Kontakt</Typography>
            <Typography>Mitglieder: Jannis Liebscher, Erik Manz</Typography>
          </div>
        </main>
        <footer style={{ textAlign: "center", margin: "20px 0" }}>
          <a href="https://github.com/Manz2/GM" target="_blank" rel="noopener noreferrer">
            <Image
              aria-hidden
              src="https://nextjs.org/icons/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Git Repo
          </a>
        </footer>
      </Container>
    </>
  );
}
