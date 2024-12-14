export async function fetchAndStoreServiceUrls() {
    if (typeof window === "undefined") {
        console.log("Window was null")
        return null;
    }
    const tenantId = sessionStorage.getItem("tenantId");

    if (!tenantId) {
        throw new Error("Tenant-ID wurde nicht im sessionStorage gefunden.");
    }

    const functionUrl = "https://europe-west1-ca-test2-438111.cloudfunctions.net/getTenantDetails";
    const token = await sessionStorage.getItem("authToken");

    const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Firebase Token übergeben
        },
        body: JSON.stringify({ tenantId }),
    });

    if (!response.ok) {
        throw new Error(`Fehler beim Aufrufen der Cloud Function: ${response.statusText}`);
    }

    const tenantInfo: TenantInfo = await response.json();

    const services = tenantInfo.services;
    if (!services) {
        throw new Error("Services konnten nicht gefunden werden.");
    }

    // Alle URLs aus den Services in sessionStorage speichern
    for (const [key, service] of Object.entries(services)) {
        if (service?.url) {
            console.log(`Service ${key} hat die URL ${service.url}`);
            sessionStorage.setItem(`${key}Url`, service.url);
        }
    }

    return services;
}



export function getServiceUrl(serviceName: string): string | null {
    if (typeof window === "undefined") {
        console.log("Window was null")
        return null;
    }
    return sessionStorage.getItem(`${serviceName}Url`);
}

interface Service {
    name?: string;
    region?: string | null;
    url?: string; // Optional, da nicht alle Services eine URL haben
}

interface Services {
    [key: string]: Service | null; // Dynamischer Key, da die Services unterschiedliche Namen haben
}

interface TenantInfo {
    tier: string;
    name: string;
    tenantId: string;
    id: string;
    services: Services;
}

