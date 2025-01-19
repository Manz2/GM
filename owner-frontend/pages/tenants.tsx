import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { TenantsApi } from "@/api/apis/TenantsApi";
import { GmTenant } from "@/api/models/GmTenant";
import { GmTenantTierEnum } from "@/api/models/GmTenant";
import { useEffect, useState, createRef } from "react";
import styles from "@/styles/owner.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';


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
  CircularProgress,
  Box,
  IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [tenants, setTenants] = useState<GmTenant[]>([]);
  const [newTenant, setNewTenant] = useState<GmTenant>({
    name: "",
    id: "",
    adminMail: "",
    services: {
      financeBackend: {
        name: "Finance Backend",
        url: "",
        region: "",
        version: "",
      },
      propertyBackend: {
        name: "Property Backend",
        url: "",
        region: "",
        version: "",
      },
      parkingBackend: {
        name: "Parking Backend",
        url: "",
        region: "",
        version: "",
      },
      managementFrontend: {
        name: "Management Frontend",
        url: "",
        region: "",
        version: "",
      },
    },
    customisation: {
      applicationName: "",
      backgroundImage: "",
      colorScheme: "",
    },
    tier: "ENTRY",
    preferedRegion: "",
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
  const [loading, setLoading] = useState(false);
  const [editTenant, setEditTenant] = useState<GmTenant | null>(null);


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
        tier: filter.tier as GmTenantTierEnum || undefined,
      };

      console.log("Fetching tenants with parameters:", requestParameters);
      const response = await tenantsApi.listTenants(requestParameters);
      setTenants(response);
    } catch (error: any) {
      console.error("Fehler beim Laden der Tenants:", error);
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilter(filterForm);
  };


  const handleAddTenant = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    newTenant.customisation = {
      applicationName: newTenant.name,
      backgroundImage: "https://fo9.de/flutter/parkhaus.png",
    };
    const tenantsApi = new TenantsApi(config);
    tenantsApi
      .addTenant({ gmTenant: newTenant })
      .then((response) => {
        console.log("Defekt erfolgreich hinzugefügt:", response);
        fetchTenants();
        setNewTenant({
          name: "",
          id: "",
          adminMail: "",
          services: {
            financeBackend: {
              name: "Finance Backend",
              url: "",
              region: "",
              version: "",
            },
            propertyBackend: {
              name: "Property Backend",
              url: "",
              region: "",
              version: "",
            },
            parkingBackend: {
              name: "Parking Backend",
              url: "",
              region: "",
              version: "",
            },
            managementFrontend: {
              name: "Management Frontend",
              url: "",
              region: "",
              version: "",
            },
          },
          customisation: {
            applicationName: "",
            backgroundImage: "",
            colorScheme: "",
          },
          tier: "ENTRY",
          preferedRegion: "",
        });
        setAcceptedFiles([]);
      })
      .catch((error) => {
        console.error("Fehler beim Hinzufügen des Defekts:", error);
      }).finally(() => {
        setLoading(false); // Ladeanimation stoppen
      });;
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : null); // Setzt expanded auf null, wenn das Panel geschlossen wird
  };

  const toggleCard = (index: number, id: string | undefined) => {
    if (expandedCard !== index && id) {
      setExpandedCard(expandedCard === index ? null : index);
    }
  };

  const handleEmptyClick = () => {
    setExpandedCard(null);
  };

  const handleUpdateTier = (e: React.ChangeEvent<{ value: unknown }>, tenant: GmTenant, tier: GmTenantTierEnum) => {
    e.preventDefault();
    const tenantsApi = new TenantsApi(config);
    tenant.tier = tier;
    if (!tenant.id) {
      console.error("Defekt ID fehlt");
      return;
    }
    const requestParameters = { id: tenant.id, gmTenant: tenant };

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

  const getOverallStatus = (services: Api.Services) =>
    services.managementFrontend?.up && services.propertyBackend?.up && services.financeBackend?.up && services.parkingBackend?.up;

  const getStatusColor = (status: boolean) => (status ? "green" : "red");

  const dropzoneRef = createRef<DropzoneRef>();
  const openDialog = () => {
    // Note that the ref is set async,
    // so it might be null at some point 
    if (dropzoneRef.current) {
      dropzoneRef.current.open()
    }
  };

  const handleEditTenant = (tenant: GmTenant) => {
    setEditTenant(tenant);
    setOpen(true);  // Dialog öffnen
  };

  const handleRestartTenant = (tenant: GmTenant, e: { preventDefault: () => void }) => {
    if (!tenant.id) {
      console.error("Tenant ID fehlt");
      return;
    }
    const tenantsApi = new TenantsApi(config);
    tenantsApi
      .restartTenant({
        gmTenant: tenant,
        id: tenant.id,
      });
  };

  const handleUpdateTenant = () => {
    setLoading(true); // Ladeanimation starten
    const tenantsApi = new TenantsApi(config);
    if (editTenant && editTenant.id) {
      tenantsApi.updateTenant({ id: editTenant.id, gmTenant: editTenant })
        .then(() => {
          console.log("Tenant erfolgreich aktualisiert");
          fetchTenants();
          setOpen(false);
          setEditTenant(null);
        })
        .catch((error) => {
          console.error("Fehler beim Aktualisieren des Tenant:", error);
        }).finally(() => {
          setLoading(false); // Ladeanimation stoppen
        });;;
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
                      label="Admin Mail"
                      value={newTenant.adminMail}
                      onChange={(e) => setNewTenant({ ...newTenant, adminMail: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth required>
                      <InputLabel>Tier</InputLabel>
                      <Select
                        value={newTenant.tier}
                        onChange={(e) => setNewTenant({ ...newTenant, tier: e.target.value as GmTenantTierEnum })}
                        label="Tier"
                      >
                        <MenuItem value="ENTRY">Entry</MenuItem>
                        <MenuItem value="ENHANCED">Enhanced</MenuItem>
                        <MenuItem value="PREMIUM">Premium</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  {(newTenant.tier === 'PREMIUM' || newTenant.tier === 'ENHANCED') && (
                    <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                      <TextField
                        label="Region"
                        value={newTenant.preferedRegion}
                        onChange={(e) => setNewTenant({ ...newTenant, preferedRegion: e.target.value })}
                        required
                        fullWidth
                      />
                    </Box>
                  )}
                  {newTenant.tier === 'PREMIUM' && (
                    <>
                      <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                        <TextField
                          label="Property Backend Version"
                          value={newTenant.services?.propertyBackend?.version || ""}
                          onChange={(e) =>
                            setNewTenant((prevTenant) => ({
                              ...prevTenant,
                              services: {
                                ...prevTenant?.services,
                                propertyBackend: {
                                  ...prevTenant.services?.propertyBackend,
                                  version: e.target.value,
                                },
                              },
                            }))
                          }
                          required
                          fullWidth
                        />
                      </Box>
                      <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                        <TextField
                          label="Finance Bckend Version"
                          value={newTenant.services?.financeBackend?.version || ""}
                          onChange={(e) =>
                            setNewTenant((prevTenant) => ({
                              ...prevTenant,
                              services: {
                                ...prevTenant.services,
                                financeBackend: {
                                  ...prevTenant.services?.financeBackend,
                                  version: e.target.value,
                                },
                              },
                            }))
                          }
                          required
                          fullWidth
                        />
                      </Box>
                      <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                        <TextField
                          label="Parking Backend Version"
                          value={newTenant.services?.parkingBackend?.version || ""}
                          onChange={(e) =>
                            setNewTenant((prevTenant) => ({
                              ...prevTenant,
                              services: {
                                ...prevTenant.services,
                                parkingBackend: {
                                  ...prevTenant.services?.parkingBackend,
                                  version: e.target.value,
                                },
                              },
                            }))
                          }
                          required
                          fullWidth
                        />
                      </Box>
                      <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                        <TextField
                          label="Management Frontend Version"
                          value={newTenant.services?.managementFrontend?.version || ""}
                          onChange={(e) =>
                            setNewTenant((prevTenant) => ({
                              ...prevTenant,
                              services: {
                                ...prevTenant.services,
                                managementFrontend: {
                                  ...prevTenant.services?.managementFrontend,
                                  version: e.target.value,
                                },
                              },
                            }))
                          }
                          required
                          fullWidth
                        />
                      </Box>
                    </>
                  )}
                  <Box flexBasis="100%">
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                      {loading ? (
                        <CircularProgress size={24} style={{ color: "white" }} />
                      ) : (
                        "Tenant hinzufügen"
                      )}
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
                        <MenuItem value="ENTRY">Entry</MenuItem>
                        <MenuItem value="ENHANCED">Enhanced</MenuItem>
                        <MenuItem value="PREMIUM">Premium</MenuItem>
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
              const overallStatus = tenant.services ? !!getOverallStatus(tenant.services) : false;
              return (
                <Box key={index} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} mb={2}>
                  <Card
                    style={{ height: isExpanded ? 'auto' : '100px' }}> {/* Festgelegte Höhe für eingeklappte Karten */}
                    <CardContent onClick={() => toggleCard(index, tenant.id)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5">{tenant.name}</Typography>
                        {(tenant.tier === 'PREMIUM') && (
                          <Avatar
                            style={{
                              backgroundColor: getStatusColor(!!overallStatus),
                              width: 24,
                              height: 24,
                              marginLeft: 'auto',
                            }}
                          >
                            {" "}
                          </Avatar>)}
                      </div>
                      <Typography color="textSecondary">
                        <strong>{tenant.id}</strong>
                      </Typography>


                      {isExpanded && (
                        <>
                          {(tenant.tier === 'PREMIUM' || tenant.tier === 'ENHANCED') && (
                            <>
                              <Typography variant="h6">Standort:</Typography>
                              <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                {tenant.preferedRegion}
                              </Typography>
                            </>)}
                          {(tenant.tier === 'PREMIUM') && (
                            <>
                              <Typography variant="h6">url:</Typography>
                              <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                <a href={`http://${tenant.services?.propertyBackend?.url}/management-frontend`} target="_blank" rel="noopener noreferrer">
                                  http://{tenant.services?.propertyBackend?.url}/management-frontend
                                </a>
                              </Typography>
                            </>)}
                          <Typography variant="h6">Admin Mail:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {tenant.adminMail}
                          </Typography>
                          <Typography variant="h6">ID:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {tenant.id}
                          </Typography>
                          <Typography variant="h6">Tier:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {tenant.tier}
                          </Typography>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Anzahl Defects:</Typography>
                            <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                              {tenant.numberOfDefects}
                            </Typography>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Anzahl Properties:</Typography>
                            <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                              {tenant.numberOfProperties}
                            </Typography>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">Anzahl Users:</Typography>
                            <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                              {tenant.numberOfUsers}
                            </Typography>
                          </div>

                          {(tenant.tier === 'PREMIUM') && (
                            <>
                              <Typography variant="h6">Management-Frontend:</Typography>
                              <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                {tenant.services?.managementFrontend?.version}
                              </Typography>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  style={{
                                    backgroundColor: getStatusColor(!!tenant.services?.managementFrontend?.up),
                                    width: 15,
                                    height: 15,
                                    marginLeft: '10px',
                                  }}
                                >
                                  {" "}
                                </Avatar>
                                <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                  {tenant.services?.managementFrontend?.lastUp
                                    ? `Zuletzt: ${new Date(tenant.services?.managementFrontend?.lastUp).toLocaleString()}`
                                    : "Nie"}
                                </Typography>
                              </div>

                              <Typography variant="h6">Property Backend:</Typography>
                              <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                {tenant.services?.propertyBackend?.version}
                              </Typography>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  style={{
                                    backgroundColor: getStatusColor(!!tenant.services?.propertyBackend?.up),
                                    width: 15,
                                    height: 15,
                                    marginLeft: '10px',
                                  }}
                                >
                                  {" "}
                                </Avatar>
                                <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                  {tenant.services?.propertyBackend?.lastUp
                                    ? `Zuletzt: ${new Date(tenant.services?.propertyBackend?.lastUp).toLocaleString()}`
                                    : "Nie"}
                                </Typography>
                              </div>

                              <Typography variant="h6">Finance Backend:</Typography>
                              <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                {tenant.services?.financeBackend?.version}
                              </Typography>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  style={{
                                    backgroundColor: getStatusColor(!!tenant.services?.financeBackend?.up),
                                    width: 15,
                                    height: 15,
                                    marginLeft: '10px',
                                  }}
                                >
                                  {" "}
                                </Avatar>
                                <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                  {tenant.services?.financeBackend?.lastUp
                                    ? `Zuletzt: ${new Date(tenant.services?.financeBackend?.lastUp).toLocaleString()}`
                                    : "Nie"}
                                </Typography>
                              </div>

                              <Typography variant="h6">Parking Backend:</Typography>
                              <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                {tenant.services?.parkingBackend?.version}
                              </Typography>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  style={{
                                    backgroundColor: getStatusColor(!!tenant.services?.parkingBackend?.up),
                                    width: 15,
                                    height: 15,
                                    marginLeft: '10px',
                                  }}
                                >
                                  {" "}
                                </Avatar>
                                <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                                  {tenant.services?.parkingBackend?.lastUp
                                    ? `Zuletzt: ${new Date(tenant.services?.parkingBackend?.lastUp).toLocaleString()}`
                                    : "Nie"}
                                </Typography>
                              </div>
                            </>)}
                        </>
                      )}
                    </CardContent>

                    {isExpanded && (
                      <CardActions>
                        <Button size="small" color="error"
                          onClick={() => tenant.id && handleDeleteTenant(tenant.id)}>
                          Löschen
                        </Button>
                        <IconButton onClick={() => handleEditTenant(tenant)}>
                          <EditIcon />
                        </IconButton>
                        {(tenant.tier === 'PREMIUM') && (
                          <IconButton onClick={(e) => handleRestartTenant(tenant, e)}>
                            <RefreshIcon />
                          </IconButton>)}
                        <IconButton onClick={handleEmptyClick} style={{ marginLeft: 'auto' }}>
                          <CloseFullscreenIcon />
                        </IconButton>
                      </CardActions>
                    )}
                  </Card>
                </Box>
              );
            })}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Property bearbeiten</DialogTitle>
              <DialogContent>
                {editTenant && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Name"
                      value={editTenant.name}
                      fullWidth
                      contentEditable={false}
                    />
                    <TextField
                      label="Region"
                      value={editTenant.preferedRegion}
                      fullWidth
                      onChange={(e) => setEditTenant({ ...editTenant, preferedRegion: e.target.value })}
                    />
                    <TextField
                      label="Admin Mail"
                      value={editTenant.adminMail}
                      fullWidth
                      contentEditable={false}
                    />
                    <TextField
                      label="Property Backend Version"
                      value={editTenant.services?.propertyBackend?.version || ""}
                      onChange={(e) => setEditTenant((prevTenant) => ({
                        ...prevTenant,
                        services: {
                          ...prevTenant?.services,
                          propertyBackend: {
                            ...prevTenant?.services?.propertyBackend,
                            version: e.target.value,
                          },
                        },
                      }))}
                      fullWidth
                    />
                    <TextField
                      label="Management Frontend Version"
                      value={editTenant.services?.managementFrontend?.version || ""}
                      onChange={(e) => setEditTenant((prevTenant) => ({
                        ...prevTenant,
                        services: {
                          ...prevTenant?.services,
                          managementFrontend: {
                            ...prevTenant?.services?.managementFrontend,
                            version: e.target.value,
                          },
                        },
                      }))}
                      fullWidth
                    />
                    <TextField
                      label="Finance Backend Version"
                      value={editTenant.services?.financeBackend?.version || ""}
                      onChange={(e) => setEditTenant((prevTenant) => ({
                        ...prevTenant,
                        services: {
                          ...prevTenant?.services,
                          financeBackend: {
                            ...prevTenant?.services?.financeBackend,
                            version: e.target.value,
                          },
                        },
                      }))}
                      fullWidth
                    />
                    <TextField
                      label="Parking Backend Version"
                      value={editTenant.services?.parkingBackend?.version || ""}
                      onChange={(e) => setEditTenant((prevTenant) => ({
                        ...prevTenant,
                        services: {
                          ...prevTenant?.services,
                          parkingBackend: {
                            ...prevTenant?.services?.parkingBackend,
                            version: e.target.value,
                          },
                        },
                      }))}
                      fullWidth
                    />
                    <FormControl fullWidth required>
                      <InputLabel>Tier</InputLabel>
                      <Select
                        value={editTenant.tier}
                        onChange={(e) => setEditTenant({ ...editTenant, tier: e.target.value as GmTenantTierEnum })}
                        label="Tier"
                      >
                        <MenuItem value="ENTRY">Entry</MenuItem>
                        <MenuItem value="ENHANCED">Enhanced</MenuItem>
                        <MenuItem value="PREMIUM">Premium</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                  Abbrechen
                </Button>
                <Button onClick={handleUpdateTenant} color="primary" disabled={loading}>
                  {loading ? (
                    <CircularProgress size={24} style={{ color: "white" }} />
                  ) : (
                    "Speichern"
                  )}

                </Button>
              </DialogActions>
            </Dialog>
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
