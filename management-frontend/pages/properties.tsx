import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { PropertyApi } from "@/api/apis/PropertyApi";
import { Property, PropertyStatusEnum } from "@/api/models/Property";
import { Pricing } from "@/api/models/Pricing";
import { useEffect, useState, createRef } from "react";
import styles from "@/styles/Defects.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import EditIcon from '@mui/icons-material/Edit';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { getServiceUrl } from "../config/tenantConfig";
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

  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const appName = process.env.NEXT_PUBLIC_APPLICATION_NAME || "GM-Parking Solutions-local";
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

  const propertyBackendUrl = getServiceUrl("propertyBackend") || undefined;
  if (!propertyBackendUrl) {
    console.error("Property Backend URL nicht gefunden");
  }
  const configParameters: Api.ConfigurationParameters = {
    basePath: process.env.NEXT_PUBLIC_PROPERTY_BACKEND || "http://localhost:8081",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
  };
  const config = new Api.Configuration(configParameters);

  const handleDeleteProperty = (propertyId: string) => {
    const propertyApi = new PropertyApi(config);
    const requestParameters = { id: propertyId };

    propertyApi
      .deleteProperty(requestParameters)
      .then(() => {
        console.log("Property erfolgreich gelöscht");
        fetchProperties();
      })
      .catch((error) => {
        console.error("Fehler beim Löschen der Property:", error);
      });
  };

  const fetchProperties = async () => {
    console.log("env:", process.env.NEXT_PUBLIC_BASE_PATH);
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


  const handleAddProperty = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    var fileBlob = undefined;
    if (acceptedFiles.length != 0) {
      const file = acceptedFiles[0];
      const mimeType = getMimeType(file.name);
      fileBlob = new Blob([file], { type: mimeType });
    }

    const propertyApi = new PropertyApi(config);
    propertyApi
      .addProperty({ property: newProperty, file: fileBlob })
      .then((response) => {
        console.log("Defekt erfolgreich hinzugefügt:", response);
        fetchProperties();
        setNewProperty({
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

  const handleUpdateStatus = (e: React.ChangeEvent<{ value: unknown }>, property: Property, status: PropertyStatusEnum) => {
    e.preventDefault();
    const propertyApi = new PropertyApi(config);
    property.status = status;
    if (!property.id) {
      console.error("Property ID fehlt");
      return;
    }
    const requestParameters = { id: property.id, property: property };

    propertyApi
      .updateProperty(requestParameters)
      .then(() => {
        console.log("Property erfolgreich aktualisiert");
        fetchProperties();
      })
      .catch((error) => {
        console.error("Fehler beim Aktualisieren der Property:", error);
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
      city: '',
      capacity: 0,
    });
    setFilterForm({
      city: '',
      capacity: 0,
    });
  };

  const handleEditProperty = (property: Property) => {
    setEditProperty(property);
    setOpen(true);  // Dialog öffnen
  };

  const handleUpdateProperty = () => {
    if (!editProperty) return;

    const propertyApi = new PropertyApi(config);
    propertyApi.updateProperty({ id: editProperty.id!, property: editProperty })
      .then(() => {
        console.log("Property erfolgreich aktualisiert");
        fetchProperties();
        setOpen(false);
        setEditProperty(null); // Dialog schließen und das bearbeitete Property zurücksetzen
      })
      .catch((error) => {
        console.error("Fehler beim Aktualisieren der Property:", error);
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
        <title>Properties</title>
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
            Property Management
          </Typography>

          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Neue Property erstellen</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form onSubmit={handleAddProperty} style={{ marginBottom: "20px" }}>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between" gap={2}>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Name"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Stadt"
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Adresse"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Anzahl Parkflächen"
                      type="number"
                      value={newProperty.capacity}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, capacity: Number(e.target.value) })
                      }
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Baujahr"
                      type="date"
                      value={newProperty.constructionDate ? new Date(newProperty.constructionDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => setNewProperty({
                        ...newProperty,
                        constructionDate: new Date(e.target.value).getTime()
                      })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newProperty.status}
                        onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value as PropertyStatusEnum })}
                        label="Status"
                      >
                        <MenuItem value="Offen">Offen</MenuItem>
                        <MenuItem value="Geschlossen">Geschlossen</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Dropzone
                    ref={dropzoneRef}
                    noClick
                    noKeyboard
                    accept={{ 'image/*': [] }}
                    onDrop={(files) => {
                      setAcceptedFiles(files); // Dateien im Zustand speichern
                    }}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <Box
                        {...getRootProps()}
                        sx={{
                          border: '2px dashed #90caf9',
                          borderRadius: 2,
                          padding: 1,
                          width: "100%",
                          textAlign: 'center',
                          bgcolor: 'background',
                          color: 'text.primary',
                          '&:hover': {
                            bgcolor: '#37474f'
                          }
                        }}
                      >
                        <input {...getInputProps()} />
                        <Typography variant="body1" color="textSecondary">
                          Drag-and-drop
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={openDialog}
                          sx={{ marginTop: 2 }}
                        >
                          Dateien ansehen
                        </Button>
                        <Box display="flex" justifyContent="center">
                          <List>
                            {acceptedFiles.length > 0 && acceptedFiles.map((file) => (
                              <ListItem key={file.name}>
                                <ListItemAvatar>
                                  {file.type.startsWith('image/') ? (
                                    <Avatar
                                      variant="square"
                                      src={URL.createObjectURL(file)}
                                      alt={file.name}
                                      sx={{ width: 60, height: 60 }}
                                    />
                                  ) : (
                                    <Avatar>
                                      <Typography variant="caption">DOC</Typography>
                                    </Avatar>
                                  )}
                                </ListItemAvatar>
                                <ListItemText
                                  primary={file.name}
                                  sx={{ ml: 2 }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Box>
                    )}
                  </Dropzone>

                  <Box flexBasis="100%">
                    <Button type="submit" variant="contained" color="primary">
                      Property hinzufügen
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
            {properties.map((property, index) => {
              const isExpanded = expandedCard === index;
              const imageUrl = blobUrls[index];
              return (
                <Box key={index} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} mb={2}>
                  <Card
                    style={{ height: isExpanded ? 'auto' : '100px' }}> {/* Festgelegte Höhe für eingeklappte Karten */}
                    <CardContent onClick={() => toggleCard(index, property.image)} style={{ cursor: 'pointer' }}>
                      <Typography variant="h5">{property.name}</Typography>
                      <Typography color="textSecondary">
                        <strong>{property.city}</strong>
                      </Typography>

                      {isExpanded && (
                        <>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`Bild der Property ${property.name}`}
                              style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
                            />
                          ) : null}
                          <Typography variant="h6">Adresse:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {property.address}
                          </Typography>
                          <Typography variant="h6">Anzahl Parkflächen:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {property.capacity}
                          </Typography>
                          <Typography variant="h6">Baujahr:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {property.constructionDate ? new Date(property.constructionDate).toLocaleDateString('de-DE') : 'Kein Datum'}
                          </Typography>
                          <Typography variant="h6">Status:</Typography>

                          {/* Select außerhalb von Typography */}
                          <Select
                            value={property.status}
                            onChange={(e) => property.id && handleUpdateStatus(e as React.ChangeEvent<{
                              value: unknown
                            }>, property, e.target.value as PropertyStatusEnum)}
                            onOpen={handleOpen}
                            onClose={handleClose}
                            className={styles[property.status?.toLowerCase() || "undefined"]}
                            variant="standard"
                            size="small"
                          >
                            <MenuItem value="Offen" className={styles['offen']}>Offen</MenuItem>
                            <MenuItem value="Geschlossen" className={styles['geschlossen']}>Geschlossen</MenuItem>
                          </Select>
                        </>
                      )}
                    </CardContent>

                    {isExpanded && (
                      <CardActions>
                        <Button size="small" color="error"
                          onClick={() => property.id && handleDeleteProperty(property.id)}>
                          Löschen
                        </Button>
                        <IconButton onClick={() => handleEditProperty(property)}>
                          <EditIcon />
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
                {editProperty && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Name"
                      value={editProperty.name}
                      onChange={(e) => setEditProperty({ ...editProperty, name: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Stadt"
                      value={editProperty.city}
                      onChange={(e) => setEditProperty({ ...editProperty, city: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Adresse"
                      value={editProperty.address}
                      onChange={(e) => setEditProperty({ ...editProperty, address: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Anzahl Parkflächen"
                      type="number"
                      value={editProperty.capacity}
                      onChange={(e) => setEditProperty({ ...editProperty, capacity: Number(e.target.value) })}
                      fullWidth
                    />
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editProperty.status}
                        onChange={(e) => setEditProperty({ ...editProperty, status: e.target.value as PropertyStatusEnum })}
                        label="Status"
                      >
                        <MenuItem value="Offen">Offen</MenuItem>
                        <MenuItem value="Geschlossen">Geschlossen</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                  Abbrechen
                </Button>
                <Button onClick={handleUpdateProperty} color="primary">
                  Speichern
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
