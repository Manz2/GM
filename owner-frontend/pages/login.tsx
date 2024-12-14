import React, { useState } from 'react';
import 'firebase/compat/auth';
import { getAuth } from "firebase/auth";
import { TextField, Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { firebase } from '../config/firebaseConfig';
import { useRouter } from 'next/router';

function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Anmeldung bei Firebase
    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault(); // Verhindert das Neuladen der Seite

        setLoading(true);
        setError(null);

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("login successful");
            setToken(await generateToken());
            // Weiterleitung nach erfolgreichem Login
            router.push('/tennants');
        } catch (err) {
            setError('Fehler bei der Anmeldung. Überprüfe deine Daten.');
        } finally {
            setLoading(false);
        }
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

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Typography variant="h5">Anmeldung</Typography>
                {error && <Typography color="error">{error}</Typography>}

                {/* Form-Tag für das Formular */}
                <form onSubmit={handleSignIn}>
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

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit" // Der Button löst das Submit-Ereignis aus
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Anmelden'}
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default SignInScreen;
