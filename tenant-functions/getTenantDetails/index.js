const admin = require("firebase-admin");
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });

// Firebase-App für prod initialisieren
const prodApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ca-test2-438111',
}, 'prod');

// Firebase-App für dev initialisieren
const devApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ca-test2-438111',
}, 'dev');

// Firestore-Instanzen für prod und dev
const db = prodApp.firestore();
const dbDev = devApp.firestore();

db.settings({ databaseId: 'gm-owner-prod' });
dbDev.settings({ databaseId: 'gm-owner-dev' });

functions.http('getTenantDetails', (req, res) => {
    // CORS middleware aktivieren
    cors(req, res, async () => {
        // Hier behandeln wir die CORS Preflight (OPTIONS) Anfrage
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(204).send('');
        }

        try {
            // CORS-Header für die tatsächliche Anfrage
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            // Authentifizierung überprüfen
            const idToken = req.headers.authorization?.split("Bearer ")[1];

            if (!idToken) {
                return res.status(401).send("Kein Authentifizierungstoken bereitgestellt");
            }

            const decodedToken = await prodApp.auth().verifyIdToken(idToken);
            console.log("Authenticated user:", decodedToken.uid);

        } catch (error) {
            console.error("Fehler bei der Authentifizierung:", error);
            res.status(403).send("Nicht autorisiert");
        }

        try {
            const tenantId = req.body.tenantId;
            if (!tenantId) {
                return res.status(400).send("TenantId fehlt");
            }

            const docRef = db.collection('tenants').doc(tenantId);
            let doc = await docRef.get();

            if (!doc.exists) {
                const docRef2 = dbDev.collection('tenants').doc(tenantId);
                doc = await docRef2.get();
            }
            if(!doc.exists){
                return res.status(404).send('Dokument in prod nicht gefunden');
            }

            res.json(doc.data());
        } catch (error) {
            console.error("Fehler beim laden der details", error);
            res.status(500).send("Details not found");
        }

    });
});
