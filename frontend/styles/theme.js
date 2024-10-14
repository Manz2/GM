// styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9', // oder deine bevorzugte Farbe
        },
        background: {
            default: '#121212', // Dunkler Hintergrund
            paper: '#1e1e1e',   // Dunkleres Papier für die Inputs
        },
        text: {
            primary: '#ffffff', // Textfarbe
            secondary: '#b0bec5', // Sekundärfarbe
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#90caf9', // Setze die Farbe der Outline
                        },
                        '&:hover fieldset': {
                            borderColor: '#bbdefb', // Farbe beim Hover
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#bbdefb', // Farbe im Fokus
                        },
                    },
                },
            },
        },
    },
});

export default theme;
