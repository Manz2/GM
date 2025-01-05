import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { DefectsApi } from "@/api/property/apis/DefectsApi";
import { Defect } from "@/api/property/models/Defect";
import { DefectStatusEnum } from "@/api/property/models/Defect";
import { useEffect, useState, createRef } from "react";
import styles from "@/styles/Defects.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import * as Api from '../api/property/';
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
import { getServiceUrl } from "@/config/tenantConfig";

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

export default function Defects() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefect, setNewDefect] = useState<Defect>({
    property: "",
    location: "",
    descriptionShort: "",
    descriptionDetailed: "",
    reportingDate: new Date().getTime(),
    status: "Offen",
    image: "",
  });
  const [filter, setFilter] = useState({
    property: "",
    status: "",
  });

  const [filterForm, setFilterForm] = useState({
    property: "",
    status: "",
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const appName = process.env.NEXT_PUBLIC_APPLICATION_NAME || "GM-Parking Solutions-local";
  const router = useRouter();


  useEffect(() => {
    fetchDefects();
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
    basePath: process.env.NEXT_PUBLIC_PROPERTY_BACKEND || "http://localhost:8081",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
  };
  const config = new Api.Configuration(configParameters);

  const handleDeleteDefect = (defectId: string) => {
    const defectsApi = new DefectsApi(config);
    const requestParameters = { id: defectId };

    defectsApi
      .deleteDefect(requestParameters)
      .then(() => {
        console.log("Defekt erfolgreich gelöscht");
        fetchDefects();
      })
      .catch((error) => {
        console.error("Fehler beim Löschen des Defekts:", error);
      });
  };

  const fetchDefects = async () => {
    console.log("env:", process.env.NEXT_PUBLIC_PROPERTY_BACKEND);
    const defectsApi = new DefectsApi(config);
    try {
      const requestParameters = {
        property: filter.property || undefined,
        status: filter.status as DefectStatusEnum || undefined,
      };

      console.log("Fetching defects with parameters:", requestParameters);
      const response = await defectsApi.listDefects(requestParameters);
      setDefects(response);
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


  const handleAddDefect = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    var fileBlob = undefined;
    if (acceptedFiles.length != 0) {
      const file = acceptedFiles[0];
      const mimeType = getMimeType(file.name);
      fileBlob = new Blob([file], { type: mimeType });
    }

    const defectsApi = new DefectsApi(config);
    defectsApi
      .addDefect({ defect: newDefect, file: fileBlob })
      .then((response) => {
        console.log("Defekt erfolgreich hinzugefügt:", response);
        fetchDefects();
        setNewDefect({
          property: "",
          location: "",
          descriptionShort: "",
          descriptionDetailed: "",
          reportingDate: new Date().getTime(),
          status: "Offen",
          image: "",
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
  const loadImageAsBlob = async (index: number, defectId: string) => {
    try {
      const defectsApi = new DefectsApi(config);
      const response = await defectsApi.getDefectImageById({ id: defectId });
      const url = URL.createObjectURL(response);

      setBlobUrls((prev) => ({ ...prev, [index]: url }));
    } catch (error) {
      console.error('Fehler beim Laden des Bildes:', error);
    }
  };

  const handleUpdateStatus = (e: React.ChangeEvent<{ value: unknown }>, defect: Defect, status: DefectStatusEnum) => {
    e.preventDefault();
    const defectsApi = new DefectsApi(config);
    defect.status = status;
    if (!defect.id) {
      console.error("Defekt ID fehlt");
      return;
    }
    const requestParameters = { id: defect.id, defect: defect };

    defectsApi
      .updateDefect(requestParameters)
      .then(() => {
        console.log("Defekt erfolgreich aktualisiert");
        fetchDefects();
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
      property: '',
      status: '',
    });
    setFilterForm({
      property: '',
      status: '',
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
        <title>Defects</title>
        <meta name="description" content="Anwendung zur Verwaltung von Mängeln" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container className={`${geistSans.variable} ${geistMono.variable}`} maxWidth="lg">
        <main>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <Image
              src={`/management-frontend/parkhaus.png`}
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
            Defect Management
          </Typography>

          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Neuen Defect erstellen</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <form onSubmit={handleAddDefect} style={{ marginBottom: "20px" }}>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between" gap={2}>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Objekt"
                      value={newDefect.property}
                      onChange={(e) => setNewDefect({ ...newDefect, property: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Standort"
                      value={newDefect.location}
                      onChange={(e) => setNewDefect({ ...newDefect, location: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Kurzbeschreibung"
                      value={newDefect.descriptionShort}
                      onChange={(e) => setNewDefect({ ...newDefect, descriptionShort: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Detailbeschreibung"
                      value={newDefect.descriptionDetailed}
                      onChange={(e) => setNewDefect({ ...newDefect, descriptionDetailed: e.target.value })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <TextField
                      label="Melddatum"
                      type="date"
                      value={newDefect.reportingDate ? new Date(newDefect.reportingDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => setNewDefect({
                        ...newDefect,
                        reportingDate: new Date(e.target.value).getTime()
                      })}
                      required
                      fullWidth
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newDefect.status}
                        onChange={(e) => setNewDefect({ ...newDefect, status: e.target.value as DefectStatusEnum })}

                        label="Status"
                      >
                        <MenuItem value="Offen">Offen</MenuItem>
                        <MenuItem value="In-Bearbeitung">In Bearbeitung</MenuItem>
                        <MenuItem value="Geschlossen">Geschlossen</MenuItem>
                        <MenuItem value="Abgelehnt">Abgelehnt</MenuItem>
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
                      Defect hinzufügen
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
                      label="Objekt"
                      variant="outlined"
                      fullWidth
                      value={filterForm.property}
                      onChange={(e) => setFilterForm({ ...filterForm, property: e.target.value })}
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterForm.status}
                        onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                        label="Status"
                      >
                        <MenuItem value="">Alle</MenuItem>
                        <MenuItem value="Offen">Offen</MenuItem>
                        <MenuItem value="In-Bearbeitung">In Bearbeitung</MenuItem>
                        <MenuItem value="Geschlossen">Geschlossen</MenuItem>
                        <MenuItem value="Abgelehnt">Abgelehnt</MenuItem>
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
            {defects.map((defect, index) => {
              const isExpanded = expandedCard === index;
              const imageUrl = blobUrls[index];
              return (
                <Box key={index} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} mb={2}>
                  <Card
                    style={{ height: isExpanded ? 'auto' : '100px' }}> {/* Festgelegte Höhe für eingeklappte Karten */}
                    <CardContent onClick={() => toggleCard(index, defect.image)} style={{ cursor: 'pointer' }}>
                      <Typography variant="h5">{defect.property}</Typography>
                      <Typography color="textSecondary">
                        <strong>{defect.descriptionShort}</strong>
                      </Typography>

                      {isExpanded && (
                        <>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`Bild des Defekts in ${defect.property}`}
                              style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
                            />
                          ) : null}
                          <Typography variant="h6">Standort:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {defect.location}
                          </Typography>
                          <Typography variant="h6">Detailbeschreibung:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {defect.descriptionDetailed}
                          </Typography>
                          <Typography variant="h6">Meldedatum:</Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {defect.reportingDate ? new Date(defect.reportingDate).toLocaleDateString('de-DE') : 'Kein Datum'}
                          </Typography>
                          <Typography variant="h6">Status:</Typography>

                          {/* Select außerhalb von Typography */}
                          <Select
                            value={defect.status}
                            onChange={(e) => defect.id && handleUpdateStatus(e as React.ChangeEvent<{
                              value: unknown
                            }>, defect, e.target.value as DefectStatusEnum)}
                            onOpen={handleOpen}
                            onClose={handleClose}
                            className={styles[defect.status?.toLowerCase() || "undefined"]}
                            variant="standard"
                            size="small"
                          >
                            <MenuItem value="Offen" className={styles['offen']}>Offen</MenuItem>
                            <MenuItem value="In-Bearbeitung" className={styles['in-bearbeitung']}>In
                              Bearbeitung</MenuItem>
                            <MenuItem value="Geschlossen" className={styles['geschlossen']}>Geschlossen</MenuItem>
                            <MenuItem value="Abgelehnt" className={styles['abgelehnt']}>Abgelehnt</MenuItem>
                          </Select>
                        </>
                      )}
                    </CardContent>

                    {isExpanded && (
                      <CardActions>
                        <Button size="small" color="error"
                          onClick={() => defect.id && handleDeleteDefect(defect.id)}>
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
