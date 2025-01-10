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
    DialogActions
} from "@mui/material";
import { firebase } from '../config/firebaseConfig';
import { useRouter } from "next/router";
import 'firebase/compat/auth';
import { getAuth } from "firebase/auth";

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

export default function Public() {
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
    const [pay, setPay] = useState<GmTenant | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const getToken = () => {
        if (typeof window === "undefined") {
            console.log("Window was null getToken")
            return null;
        }
        // Production: Speichere im sessionStorage
        return sessionStorage.getItem("authToken");
    };



    // Token im Session Storage speichern
    const setToken = (token: string) => {
        if (typeof window === "undefined") {
            console.log("Window was null")
            return;
        }
        sessionStorage.setItem("authToken", token);
    };

    // Token des angemeldeten Benutzers generieren
    const generateToken = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // ID-Token des aktuell angemeldeten Benutzers abrufen
            return await user.getIdToken();
        } else {
            throw new Error("Kein Benutzer angemeldet");
        }
    };
    let configParameters: Api.ConfigurationParameters = {};
    let config: Api.Configuration | undefined;

    const loginAndAdd = async (e: { preventDefault: () => void }) => {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("login successful");
            await setToken(await generateToken());
        } catch (err) {
            console.log(err)
            console.log('Fehler bei der Anmeldung. Überprüfe deine Daten.');
            return
        }
        configParameters = {
            headers: {
                'Authorization': 'Bearer ' + getToken(),
            },
        };
        config = new Api.Configuration(configParameters);
        handleAddTenant(e);

    }
    const handleAddTenant = async (e: { preventDefault: () => void }) => {
        handleClose()
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
        if (!open) {
            setExpandedCard(expandedCard === index ? null : index);
        }
    };

    const handleOpen = () => {
        console.log('Dialog geöffnet');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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
                <title>Public</title>
                <meta name="description" content="Anwendung um gm Abos abzuschließen" />
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
                        Gm Abonieren
                    </Typography>

                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h5">Abo abschießen</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleOpen();
                            }
                            } style={{ marginBottom: "20px" }}>
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
                                            <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                                                <TextField
                                                    label="Finance Backend Version"
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
                                        </>
                                    )}
                                    <Box flexBasis="100%">
                                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                            {loading ? (
                                                <CircularProgress size={24} style={{ color: "white" }} />
                                            ) : (
                                                "Kostenplichtig aboniernen"
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        </AccordionDetails>
                    </Accordion>
                    <div style={{ marginTop: '20px' }}>
                    </div>
                    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Bezahlen</DialogTitle>
                        <DialogContent>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <TextField
                                    label="E-Mail"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <TextField
                                    label="Passwort"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)} color="primary">
                                Abbrechen
                            </Button>
                            <Button onClick={loginAndAdd} color="primary">
                                Speichern
                            </Button>
                        </DialogActions>
                    </Dialog>


                    <Box mt={5}>
                        <Typography variant="h6" gutterBottom>
                            Preisübersicht
                        </Typography>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #ddd" }}>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Tier</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Preis pro Monat</th>
                                    <th style={{ textAlign: "left", padding: "10px" }}>Leistungen</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "10px" }}>Entry</td>
                                    <td style={{ padding: "10px" }}>€10</td>
                                    <td style={{ padding: "10px" }}>Basis-Funktionen</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "10px" }}>Enhanced</td>
                                    <td style={{ padding: "10px" }}>€25</td>
                                    <td style={{ padding: "10px" }}>Basis-Funktionen + erweiterte Berichte</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "10px" }}>Premium</td>
                                    <td style={{ padding: "10px" }}>€50</td>
                                    <td style={{ padding: "10px" }}>Alle Funktionen + Prioritäts-Support</td>
                                </tr>
                            </tbody>
                        </table>
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
