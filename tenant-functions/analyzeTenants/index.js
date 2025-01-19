const admin = require("firebase-admin");
const functions = require('@google-cloud/functions-framework');
const cors = require('cors')({ origin: true });

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ca-test2-438111'
});

const db = admin.firestore();
db.settings({ databaseId: 'gm-owner-prod' });

functions.http('analyzetenants', (req, res) => {
    // CORS middleware aktivieren
    cors(req, res, async () => {

        try {

            const tenantsSnapshot = await db.collection('tenants').get();
            if (tenantsSnapshot.empty) {
                return res.status(404).send('Keine Tenants gefunden');
            }

            const updates = tenantsSnapshot.docs.map(async (tenantDoc) => {
                const tenantData = tenantDoc.data();
                const tenantId = tenantDoc.id;
                if (tenantData.services && tenantData.services.propertyDb) {
                    const propertyDbUrl = tenantData.services.propertyDb.url;
                    const tier = tenantData.tier;


                    if (propertyDbUrl) {
                        console.log(`Tenant ${tenantId} - PropertyDB URL: ${propertyDbUrl}`);
                        // Verbindung zur Tenant-spezifischen Datenbank
                        const dbtenant = new admin.firestore.Firestore({
                            projectId: 'ca-test2-438111',
                            databaseId: propertyDbUrl
                        });

                        let defects = 0;
                        let users = 0;
                        let properties = 0;

                        if(tier == 'PREMIUM' || tier == 'ENHANCED' ) {
                            const propertiesSnapshot = await dbtenant.collection('properties').get();
                            properties = propertiesSnapshot.size;

                            const defectsSnapshot = await dbtenant.collection('defects').get();
                            defects = defectsSnapshot.size;

                            const usersSnapshot = await dbtenant.collection('users').get();
                            users = usersSnapshot.size;

                        } else {
                            const propertiesSnapshot = await dbtenant.collection(`tenants/${tenantId}/properties`).get();
                            properties = propertiesSnapshot.size;

                            const defectsSnapshot = await dbtenant.collection(`tenants/${tenantId}/defects`).get();
                            defects = defectsSnapshot.size;

                            const usersSnapshot = await dbtenant.collection(`tenants/${tenantId}/users`).get();
                            users = usersSnapshot.size;
                        }
                        console.log("tenantDoc:", tenantDoc);

                        tenantDoc._ref.update({
                            numberOfProperties:properties,
                            numberOfDefects:defects,
                            numberOfUsers:users
                        })

                        console.log(`Tenant ${tenantId} aktualisiert:`, {
                            numberOfProperties: properties,
                            numberOfDefects: defects,
                            numberOfUsers: users
                        });

                    } else {
                        console.warn(`Tenant ${tenantId} hat keine URL für PropertyDB.`);
                    }
            } else {
                console.warn(`Tenant ${tenantId} hat keine PropertyDB definiert.`);
            }
        });        
        await Promise.all(updates);
        res.send("Daten erfolgreich aktualisiert.");
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Customisation", error);
        res.status(500).send("Fehler beim Aktualisieren der Customisation");;
    }

    });
});


