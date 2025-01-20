const admin = require("firebase-admin");
const axios = require("axios");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors")({ origin: true });

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "ca-test2-438111",
});

const db = admin.firestore();
db.settings({ databaseId: "gm-owner-prod" });

functions.http("getStatus", (req, res) => {
  cors(req, res, async () => {
    try {
      const tenantsSnapshot = await db.collection("tenants").get();
      if (tenantsSnapshot.empty) {
        return res.status(404).send("Keine Tenants gefunden");
      }

      const updates = tenantsSnapshot.docs.map(async (tenantDoc) => {
        const tenantData = tenantDoc.data();
        const tenantId = tenantDoc.id;
        const tier = tenantData.tier;

        if (tier === "PREMIUM") {
          const services = tenantData.services;
          const propertyBackendUrl = services.propertyBackend?.url;

          if (!propertyBackendUrl) {
            console.warn(`Property Backend URL fehlt für Tenant ${tenantId}`);
            return;
          }

          const urlsToCheck = {
            propertyBackend: `http://${propertyBackendUrl}/property-backend/actuator/health/liveness`,
            financeBackend: `http://${propertyBackendUrl}/finance-backend/actuator/health/liveness`,
            parkingBackend: `http://${propertyBackendUrl}/parking-backend/actuator/health/liveness`,
            managementFrontend: `http://${propertyBackendUrl}/management-frontend/login`,
          };

          const results = {};

          // Überprüfung jeder URL
          for (const [serviceName, url] of Object.entries(urlsToCheck)) {
            try {
              const response = await axios.get(url, { timeout: 500 }); // Timeout auf 5 Sekunden setzen

              if (serviceName === "managementFrontend") {
                results[serviceName] = response.status === 200;
              } else {
                results[serviceName] = response.data.status === "UP";
              }
            } catch (error) {
              // Fehlerbehandlung bei Verbindungsproblemen
              console.error(
                `Fehler bei der Überprüfung von ${serviceName} für Tenant ${tenantId}:`,
                error.message
              );

              // Zusätzliche Logging für spezifische Fehler
              if (error.code === "ETIMEDOUT") {
                console.warn(
                  `Timeout-Fehler bei der Verbindung zu ${serviceName} (${url})`
                );
              }

              results[serviceName] = false; // Markiere den Service als "down"
            }
          }

          // Aktualisieren der Ergebnisse in Firestore
          await tenantDoc.ref.update({
            "services.propertyBackend.up": results.propertyBackend,
            "services.propertyBackend.lastUp": results.propertyBackend
              ? Date.now()
              : tenantData.services.propertyBackend.lastUp,
            "services.financeBackend.up": results.financeBackend,
            "services.financeBackend.lastUp": results.financeBackend
              ? Date.now()
              : tenantData.services.financeBackend.lastUp,
            "services.parkingBackend.up": results.parkingBackend,
            "services.parkingBackend.lastUp": results.parkingBackend
              ? Date.now()
              : tenantData.services.parkingBackend.lastUp,
            "services.managementFrontend.up": results.managementFrontend,
            "services.managementFrontend.lastUp": results.managementFrontend
              ? Date.now()
              : tenantData.services.managementFrontend.lastUp,
          });

          console.log(`Tenant ${tenantId} aktualisiert:`, results);
        }
      });

      await Promise.all(updates);
      res.send("Daten erfolgreich aktualisiert.");
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Services:", error);
      res.status(500).send("Fehler beim Aktualisieren der Services");
    }
  });
});
