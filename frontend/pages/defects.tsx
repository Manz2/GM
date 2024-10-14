import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { DefectsApi, DeleteDefectRequest } from "@/api/apis/DefectsApi";
import { Defect } from "@/api/models/Defect";
import { DefectStatusEnum } from "@/api/models/Defect";
import { useEffect, useState } from "react";
import styles from "@/styles/Defects.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
} from "@mui/material";

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
  const [defects, setDefects] = useState<Defect[]>([
    {
      property: "Wohngebäude A",
      location: "Keller",
      descriptionShort: "Feuchtigkeit im Keller",
      descriptionDetailed:
        "Feuchtigkeit tritt an mehreren Stellen im Keller auf, insbesondere in der Nähe der Außenwand. Dies könnte auf eine defekte Drainage oder undichte Stellen in der Wand hindeuten.",
      reportingDate: new Date("2024-05-01"),
      status: "Offen",
    },
    {
      property: "Bürogebäude B",
      location: "3. Stock, Raum 305",
      descriptionShort: "Kaputte Klimaanlage",
      descriptionDetailed:
        "Die Klimaanlage in Raum 305 funktioniert nicht mehr. Sie gibt nur noch heiße Luft ab, was die Arbeit in diesem Raum erschwert. Eine schnelle Reparatur wird empfohlen.",
      reportingDate: new Date("2024-06-15"),
      status: "In-Bearbeitung",
    },
    {
      property: "Lagerhalle C",
      location: "Haupteingang",
      descriptionShort: "Türschloss defekt",
      descriptionDetailed:
        "Das Türschloss am Haupteingang der Lagerhalle funktioniert nicht mehr ordnungsgemäß. Es lässt sich schwer öffnen und könnte für Unbefugte leicht zugänglich sein.",
      reportingDate: new Date("2024-03-22"),
      status: "Geschlossen",
    },
    {
      property: "Wohngebäude D",
      location: "Dachgeschoss",
      descriptionShort: "Dach undicht",
      descriptionDetailed:
        "Bei starkem Regen tropft Wasser durch das Dach ins Dachgeschoss. Besonders betroffen ist der Bereich über dem Schlafzimmer. Es besteht die Gefahr von Wasserschäden.",
      reportingDate: new Date("2024-07-10"),
      status: "Offen",
    },
    {
      property: "Bürogebäude E",
      location: "1. Stock, Raum 101",
      descriptionShort: "Stromausfall",
      descriptionDetailed:
        "Im Raum 101 gibt es immer wieder Stromausfälle. Die Ursache ist unbekannt, könnte aber auf ein Problem mit der Elektrik im Gebäude hinweisen.",
      reportingDate: new Date("2024-04-25"),
      status: "Abgelehnt",
    },
    {
      property: "Wohngebäude F",
      location: "Garten",
      descriptionShort: "Mauer beschädigt",
      descriptionDetailed:
        "Die Gartenmauer ist an mehreren Stellen beschädigt, vermutlich durch Frost im letzten Winter. Es gibt Risse, die sich auszubreiten scheinen.",
      reportingDate: new Date("2024-08-02"),
      status: "In-Bearbeitung",
    },
    {
      property: "Lagerhalle G",
      location: "Lagerraum 1",
      descriptionShort: "Schimmelbildung",
      descriptionDetailed:
        "Schimmel wurde in Lagerraum 1 entdeckt, besonders in den Ecken und an den Decken. Es scheint, als ob Feuchtigkeit über längere Zeit unbemerkt geblieben ist.",
      reportingDate: new Date("2024-05-30"),
      status: "Offen",
    },
  ]);
  const [newDefect, setNewDefect] = useState<Defect>({
    property: "",
    location: "",
    descriptionShort: "",
    descriptionDetailed: "",
    reportingDate: new Date(),
    status: "Offen",
  });
  const [filter, setFilter] = useState({
    property: "",
    status: "",
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  useEffect(() => {
    fetchDefects();
  }, []);

  const handleDeleteDefect = (defectId: string) => {
    const defectsApi = new DefectsApi();
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
    const defectsApi = new DefectsApi();
    try {
      const requestParameters = {
        property: filter.property || undefined,
        status: filter.status as DefectStatusEnum || undefined,
      };

      console.log("Fetching defects with parameters:", requestParameters);
      const response = await defectsApi.listDefects(requestParameters);
      setDefects(response);
    } catch (error) {
      console.error("Fehler beim Laden der Mängel:", error);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchDefects();
  };

  const handleAddDefect = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const defectsApi = new DefectsApi();
    defectsApi
      .addDefect({ defect: newDefect })
      .then((response) => {
        console.log("Defekt erfolgreich hinzugefügt:", response);
        fetchDefects();
      })
      .catch((error) => {
        console.error("Fehler beim Hinzufügen des Defekts:", error);
      });
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : null); // Setzt expanded auf null, wenn das Panel geschlossen wird
  };

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
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
              src="/parkhaus.png"
              alt="Parkhaus"
              width={75}
              height={20}
              layout="intrinsic"
            />
            <Typography variant="h3" gutterBottom>
              GM-Parking Solutions
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
                      value={newDefect.reportingDate ? newDefect.reportingDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => setNewDefect({ ...newDefect, reportingDate: new Date(e.target.value) })}
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


          <form onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
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
                      value={filter.property}
                      onChange={(e) => setFilter({ ...filter, property: e.target.value })}
                    />
                  </Box>
                  <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
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
                    <Button type="submit" variant="contained" color="primary" style={{ height: 'fit-content' }}>
                      Anwenden
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </form>




          <Box display="flex" flexWrap="wrap" gap={2}>
            {defects.map((defect, index) => {
              const isExpanded = expandedCard === index;
              return (
                <Box key={index} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} mb={2}>
                  <Card style={{ height: isExpanded ? 'auto' : '100px' }}> {/* Festgelegte Höhe für eingeklappte Karten */}
                    <CardContent onClick={() => toggleCard(index)} style={{ cursor: 'pointer' }}>
                      <Typography variant="h5">{defect.property}</Typography>
                      <Typography color="textSecondary">
                        <strong>{defect.descriptionShort}</strong>
                      </Typography>

                      {isExpanded && (
                        <>
                          <Typography variant='h6'>
                            Standort:
                          </Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {defect.location}
                          </Typography>
                          <Typography variant='h6'>
                            Detailbeschreibung:
                          </Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {defect.descriptionDetailed}
                          </Typography>
                          <Typography variant='h6'>
                            Meldedatum:
                          </Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            {defect.reportingDate ? new Date(defect.reportingDate).toLocaleDateString('de-DE') : 'Kein Datum'}
                          </Typography>
                          <Typography variant='h6'>
                            Status:
                          </Typography>
                          <Typography color="textSecondary" style={{ marginLeft: '10px' }}>
                            <span className={styles[defect.status?.toLowerCase() || "undefined"]}>{defect.status || "Unbekannt"}</span>
                          </Typography>

                        </>
                      )}
                    </CardContent>
                    {isExpanded && (
                      <CardActions>
                        <Button size="small" color="error" onClick={() => defect.id && handleDeleteDefect(defect.id)}>
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
      </Container >
    </>
  );
}
