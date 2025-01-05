import Head from "next/head";
import Grid from '@mui/material/Grid';
import Image from "next/image";
import localFont from "next/font/local";
import { PropertyApi } from "@/api/property/apis/PropertyApi";
import { FinanceApi } from '@/api/finance/apis/FinanceApi';
import { Property, PropertyStatusEnum } from "@/api/property/models/Property";
import { useEffect, useState, createRef } from "react";
import styles from "@/styles/Defects.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import EditIcon from '@mui/icons-material/Edit';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { getApplicationName, getImage, getServiceUrl } from "../config/tenantConfig";
import * as PApi from "@/api/property";
import * as FApi from "@/api/finance";
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
  IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newProperty, setNewProperty] = useState<Property>({
    name: "",
    city: "",
    address: "",
    capacity: 0,
    constructionDate: new Date().getTime(),
    image: "Offen",
    floors: [],
    status: "Offen",
    pricing: {},
    expenses: [],
  });
  const [filter, setFilter] = useState({
    city: "",
    capacity: 0,
  });

  const [filterForm, setFilterForm] = useState({
    city: "",
    capacity: 0,
  });
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null); // Add state for selected property
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const appName = getApplicationName() || "GM-GarageManager"
  const router = useRouter();
  const [editProperty, setEditProperty] = useState<Property | null>(null);



  useEffect(() => {
    fetchProperties();
  }, [filter]);


  const getToken = () => {
    if (typeof window === "undefined") {
      console.log("Window was null getToken")
      return null;
    }
    // Production: Speichere im sessionStorage
    return sessionStorage.getItem("authToken");
  };

  const getBasePath = (serviceName: string): string => {
    switch (serviceName) {
      case "propertyBackend":
        return process.env.NEXT_PUBLIC_PROPERTY_BACKEND || "http://localhost:8081";
      case "financeBackend":
        return process.env.NEXT_PUBLIC_FINANCE_BACKEND || "http://localhost:8083";
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  };

  const financeBackendUrl = getBasePath("financeBackend");

  const financeConfigParameters: FApi.ConfigurationParameters = {
    basePath: financeBackendUrl, // Set dynamically based on service
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  const propertyBackendUrl = getBasePath("propertyBackend");
  const configParameters: PApi.ConfigurationParameters = {
    basePath: propertyBackendUrl, // Set dynamically based on service
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  const config = new PApi.Configuration(configParameters);

  const fetchProperties = async () => {
    console.log("env:", process.env.NEXT_PUBLIC_PROPERTY_BACKEND);
    const propertyApi = new PropertyApi(config);
    try {
      const requestParameters = {
        city: filter.city || undefined,
        capacity: filter.capacity || undefined,
      };

      console.log("Fetching properties with parameters:", requestParameters);
      const response = await propertyApi.listProperties(requestParameters);
      setProperties(response);
    } catch (error: any) {
      console.error("Fehler beim Laden der Properties:", error);
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilter(filterForm);
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : null); // Setzt expanded auf null, wenn das Panel geschlossen wird
  };

  const toggleCard = (index: number, id: string | undefined) => {
    if (!open) {
      setExpandedCard(expandedCard === index ? null : index);
    }
    if (expandedCard !== index && id) {
      loadImageAsBlob(index, id);
    }

  };
  const loadImageAsBlob = async (index: number, propertyId: string) => {
    try {
      const propertyApi = new PropertyApi(config);
      const response = await propertyApi.getPropertyImageById({ id: propertyId });
      const url = URL.createObjectURL(response);

      setBlobUrls((prev) => ({ ...prev, [index]: url }));
    } catch (error) {
      console.error('Fehler beim Laden des Bildes:', error);
    }
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
      city: '',
      capacity: 0,
    });
    setFilterForm({
      city: '',
      capacity: 0,
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

  const financeConfig = new FApi.Configuration(financeConfigParameters);

  const DefectReportButton = ({ property }: { property: string }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const financeApi = new FinanceApi(financeConfig);

    const generateDefectReport = async (property: string) => {
      const requestParameters = {
        property: property,
        status: "Offen",
        startDate: "2024-01-01", // Example start date
        endDate: "2024-12-31" // Example end date
      };
      try {
        setLoading(true);
        const data = await financeApi.generateDefectReport(requestParameters);
        console.log("Defect Report Data:", data);
        setReport(data);
      } catch (error) {
        console.error("Error generating defect report:", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Button variant="contained" color="primary" onClick={() => generateDefectReport(property)}>
        {loading ? "Generating Report..." : "Generate Defect Report"}
      </Button>
    );
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  return (
    <>
      <Head>
        <title>Finance</title>
        <meta name="description" content="Anwendung zur Verwaltung von Mängeln" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://fo9.de/flutter/favicon.ico" />
      </Head>
      <Container className={`${geistSans.variable} ${geistMono.variable}`} maxWidth="lg">
        <main>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <Image src={getImage() || ""} alt="Parkhaus" width={75} height={70} />
            <Typography variant="h3" gutterBottom>
              {appName}
            </Typography>
          </div>

          <Typography variant="h4" gutterBottom>
            Property Management
          </Typography>

          <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Neuen Report erstellen</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Defect Report</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <List>
                          {properties.map((property, index) => (
                            <ListItem
                              component="button" // Erlaubt die Verwendung als Button
                              key={index}
                              onClick={() => handlePropertySelect(property)}
                              sx={{
                                backgroundColor: selectedProperty?.name === property.name ? "orange" : "transparent",
                                "&:hover": {
                                  backgroundColor: selectedProperty?.name === property.name ? "orange" : "transparent",
                                },
                              }}
                            >
                              <ListItemText primary={property.name} />
                            </ListItem>

                          ))}
                        </List>

                        {(
                          <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                              label="Startdatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                            <TextField
                              label="Enddatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                            {/* Render DefectReportButton only if a property is selected */}
                            {(selectedProperty &&
                              <DefectReportButton property={selectedProperty.name} />)}
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Revenue Report */}
                <Grid item xs={12} sm={6}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Revenue Report</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <List>
                          {properties.map((property, index) => (
                            <ListItem
                              component="button" // Definiert das Element als Button
                              key={index}
                              onClick={() => handlePropertySelect(property)}
                              sx={{
                                textAlign: "left", // Optional: Stellt sicher, dass der Text links ausgerichtet ist
                              }}
                            >
                              <ListItemText primary={property.name} />
                            </ListItem>
                          ))}
                        </List>

                        {selectedProperty && (
                          <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                              label="Startdatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                            <TextField
                              label="Enddatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                            <Button
                              variant="contained"
                              color="primary"

                            >
                              Revenue Report generieren
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Export Raw Data */}
                <Grid item xs={12} sm={6}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Export Raw Data</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <List>
                          {properties.map((property, index) => (
                            <ListItem
                              key={index}
                              component="button" // Render als HTML-Button
                              onClick={() => handlePropertySelect(property)}
                              sx={{
                                textAlign: "left", // Optional: Stellt sicher, dass der Text links ausgerichtet ist
                                backgroundColor: "transparent", // Standardhintergrund
                                "&:hover": {
                                  backgroundColor: "lightgray", // Hover-Effekt
                                },
                              }}
                            >
                              <ListItemText primary={property.name} />
                            </ListItem>
                          ))}
                        </List>
                        {selectedProperty && (
                          <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                              label="Startdatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                            <TextField
                              label="Enddatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                            <Button
                              variant="contained"
                              color="primary"

                            >
                              Export Raw Data generieren
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Profit Report */}
                <Grid item xs={12} sm={6}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Profit Report</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <List>
                          {properties.map((property, index) => (
                            <ListItem
                              key={index}
                              component="button" // Rendert das ListItem als HTML-Button
                              onClick={() => handlePropertySelect(property)}
                              sx={{
                                textAlign: "left", // Optional: Stellt sicher, dass der Text links ausgerichtet ist
                                backgroundColor: "transparent", // Standardhintergrund
                                "&:hover": {
                                  backgroundColor: "lightgray", // Hover-Effekt
                                },
                              }}
                            >
                              <ListItemText primary={property.name} />
                            </ListItem>
                          ))}
                        </List>

                        {selectedProperty && (
                          <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                              label="Startdatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                            <TextField
                              label="Enddatum"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                            <Button
                              variant="contained"
                              color="primary"

                            >
                              Profit Report generieren
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <div style={{ marginTop: '20px' }} />
          <form onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
            <Accordion expanded={expanded === 'filterPanel'} onChange={handleChange('filterPanel')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Name"
                      variant="outlined"
                      fullWidth
                      value={filterForm.city}
                      onChange={(e) => setFilterForm({ ...filterForm, city: e.target.value })}
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Anzahl Parkflächen"
                      type="number"
                      value={newProperty.capacity}
                      onChange={(e) => setFilterForm({ ...filterForm, capacity: Number(e.target.value) })}
                      fullWidth
                    />
                  </Box>
                  <Box display="flex" flexBasis={{ xs: '100%', sm: '100%' }} alignItems="center">
                    <Button type="submit" variant="contained" color="primary" style={{ height: 'fit-content', marginLeft: "20px" }}>
                      Anwenden
                    </Button>
                    <IconButton onClick={handleReset} color="primary" aria-label="reset filter" style={{ marginLeft: "20px" }}>
                      <FilterListOffIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </form>

          <Box display="flex" flexWrap="wrap" gap={2}>
            {/* Render properties here */}
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
