import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import { UserApi } from "@/api/property/apis/UserApi";
import { User, UserRoleEnum } from "@/api/property/models/User";
import { Pricing } from "@/api/property/models/Pricing";
import { useEffect, useState, createRef } from "react";
import styles from "@/styles/Defects.module.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import EditIcon from '@mui/icons-material/Edit';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import DeleteIcon from '@mui/icons-material/Delete';
import * as Api from '../api/property';
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
    DialogActions,
    Table, TableBody, TableCell, TableHead, TableRow,
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

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState<User>({
        name: "",
        mail: "",
        role: "Facility",
    });
    const [filter, setFilter] = useState({
        name: "",
        role: "",
    });

    const [filterForm, setFilterForm] = useState({
        name: "",
        role: "",
    });

    const [expanded, setExpanded] = useState<string | null>(null);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
    const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
    const appName = process.env.NEXT_PUBLIC_APPLICATION_NAME || "GM-Parking Solutions-local";
    const router = useRouter();
    const [editUser, setEditUser] = useState<User | null>(null);



    useEffect(() => {
        fetchUsers();
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

    const handleDeleteUser = (userId: string) => {
        const userApi = new UserApi(config);
        const requestParameters = { id: userId };

        userApi
            .deleteUser(requestParameters)
            .then(() => {
                console.log("User erfolgreich gelöscht");
                fetchUsers();
            })
            .catch((error) => {
                console.error("Fehler beim Löschen der User:", error);
            });
    };

    const fetchUsers = async () => {
        console.log("env:", process.env.NEXT_PUBLIC_PROPERTY_BACKEND);
        const userApi = new UserApi(config);
        try {
            const requestParameters = {
                name: filter.name || undefined,
                role: filter.role as UserRoleEnum || undefined,
            };

            console.log("Fetching users with parameters:", requestParameters);
            const response = await userApi.listUsers(requestParameters);
            setUsers(response);
        } catch (error: any) {
            console.error("Fehler beim Laden der Users:", error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilter(filterForm);
    };


    const handleAddUser = (e: { preventDefault: () => void }) => {
        e.preventDefault();

        const userApi = new UserApi(config);
        userApi
            .addUser({ user: newUser })
            .then((response) => {
                console.log("User erfolgreich hinzugefügt:", response);
                fetchUsers();
                setNewUser({
                    name: "",
                    mail: "",
                    role: "Facility",
                });
            })
            .catch((error) => {
                console.error("Fehler beim Hinzufügen des Users:", error);
            });
    };

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : null); // Setzt expanded auf null, wenn das Panel geschlossen wird
    };

    const handleReset = () => {
        setFilter({
            name: '',
            role: "",
        });
        setFilterForm({
            name: '',
            role: "",
        });
    };

    const handleEditUser = (user: User) => {
        setEditUser(user);
        setOpen(true);  // Dialog öffnen
    };

    const handleUpdateUser = () => {
        if (!editUser) return;

        const userApi = new UserApi(config);
        userApi.updateUser({ id: editUser.id!, user: editUser })
            .then(() => {
                console.log("User erfolgreich aktualisiert");
                fetchUsers();
                setOpen(false);
                setEditUser(null); // Dialog schließen und das bearbeitete User zurücksetzen
            })
            .catch((error) => {
                console.error("Fehler beim Aktualisieren der User:", error);
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
                <title>Users</title>
                <meta name="description" content="Anwendung zur Verwaltung von Mängeln" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="https://fo9.de/flutter/favicon.ico" />
            </Head>
            <Container className={`${geistSans.variable} ${geistMono.variable}`} maxWidth="lg">
                <main>
                    <div style={{ textAlign: "center", margin: "20px 0" }}>
                        <Image
                            src="https://fo9.de/flutter/parkhaus.png"
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
                        User Management
                    </Typography>

                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h5">Neue User erstellen</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <form onSubmit={handleAddUser} style={{ marginBottom: "20px" }}>
                                <Box display="flex" flexWrap="wrap" justifyContent="space-between" gap={2}>
                                    <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                                        <TextField
                                            label="Name"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            required
                                            fullWidth
                                        />
                                    </Box>
                                    <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                                        <TextField
                                            label="Mail"
                                            value={newUser.mail}
                                            onChange={(e) => setNewUser({ ...newUser, mail: e.target.value })}
                                            required
                                            fullWidth
                                        />
                                    </Box>
                                    <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Rolle</InputLabel>
                                            <Select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRoleEnum })}
                                                label="Rolle"
                                            >
                                                <MenuItem value="Facility">Facility</MenuItem>
                                                <MenuItem value="Admin">Admin</MenuItem>
                                                <MenuItem value="Finance">Finance</MenuItem>
                                                <MenuItem value="Operations">Operations</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box flexBasis="100%">
                                        <Button type="submit" variant="contained" color="primary">
                                            Benutzer hinzufügen
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
                                            value={filterForm.name}
                                            onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })}
                                        />
                                    </Box>
                                    <Box flexBasis={{ xs: '100%', sm: '48%' }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Rolle</InputLabel>
                                            <Select
                                                value={filterForm.role}
                                                onChange={(e) => setFilterForm({ ...filterForm, role: e.target.value })}
                                                label="Rolle"
                                            >
                                                <MenuItem value="Facility">Facility</MenuItem>
                                                <MenuItem value="Admin">Admin</MenuItem>
                                                <MenuItem value="Finance">Finance</MenuItem>
                                                <MenuItem value="Operations">Operations</MenuItem>
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
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Rolle</TableCell>
                                    <TableCell>Aktionen</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.mail}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            <Box display="flex" justifyContent="flex-start" gap={1}>
                                                <IconButton onClick={() => handleEditUser(user)} aria-label="Bearbeiten">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => user.id && handleDeleteUser(user.id)} aria-label="Löschen">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle>User bearbeiten</DialogTitle>
                            <DialogContent>
                                {editUser && (
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <TextField
                                            label="Name"
                                            value={editUser.name}
                                            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                            fullWidth
                                        />
                                        <TextField
                                            label="Mail"
                                            value={editUser.mail}
                                            onChange={(e) => setEditUser({ ...editUser, mail: e.target.value })}
                                            fullWidth
                                        />
                                        <FormControl fullWidth required>
                                            <InputLabel>Rolle</InputLabel>
                                            <Select
                                                value={editUser.role}
                                                onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRoleEnum })}
                                                label="Rolle"
                                            >
                                                <MenuItem value="Facility">Facility</MenuItem>
                                                <MenuItem value="Admin">Admin</MenuItem>
                                                <MenuItem value="Finance">Finance</MenuItem>
                                                <MenuItem value="Operations">Operations</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpen(false)} color="primary">
                                    Abbrechen
                                </Button>
                                <Button onClick={handleUpdateUser} color="primary">
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
