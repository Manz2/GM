import { GmTenant } from "@/api/finance";

export async function fetchAndStoreTenantInfo() {

    //set to true to use local backends
    const debug = false;
    if (debug) {
        return;
    }


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

    const tenantInfo: GmTenant = await response.json();
    console.log(tenantInfo);

    const imageUrl = tenantInfo.customisation?.backgroundImage;
    if (!imageUrl) {
        console.log("Kein Bild gefunden");
    }
    console.log(`iamge hat die URL ${imageUrl}`);
    sessionStorage.setItem(`imageUrl`, imageUrl || "https://fo9.de/flutter/parkhaus.png");

    const applicationName = tenantInfo.customisation?.applicationName;
    if (!applicationName) {
        console.log("Kein Application Name gefunden");
    }
    console.log(`Application name: ${applicationName}`);
    sessionStorage.setItem(`applicationName`, applicationName || "GM-GarageManager");
}

export async function updateCustomisation(gmApplicationName: string, gmImageUrl: string) {

    if (typeof window === "undefined") {
        console.log("Window was null")
        return null;
    }
    const tenantId = sessionStorage.getItem("tenantId");

    if (!tenantId) {
        throw new Error("Tenant-ID wurde nicht im sessionStorage gefunden.");
    }

    const functionUrl = "https://europe-west1-ca-test2-438111.cloudfunctions.net/UpdateTenantDetails";
    const token = await sessionStorage.getItem("authToken");

    const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Firebase Token übergeben
        },
        body: JSON.stringify({ applicationName: gmApplicationName, imageUrl: gmImageUrl, tenantId: tenantId }),
    });

    if (!response.ok) {
        throw new Error(`Fehler beim Aufrufen der Cloud Function: ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log(responseText);

    const imageUrl = gmImageUrl;
    sessionStorage.setItem(`imageUrl`, gmImageUrl || "https://fo9.de/flutter/parkhaus.png");

    const applicationName = gmApplicationName;
    sessionStorage.setItem(`applicationName`, gmApplicationName || "GM-GarageManager");
}



export function getServiceUrl(serviceName: string): string | null {
    if (typeof window === "undefined") {
        console.log("Window was null")
        return null;
    }
    return sessionStorage.getItem(`${serviceName}Url`);
}

export function getImage(): string | null {
    if (typeof window === "undefined") {
        console.log("Window was null")
        return null;
    }
    return sessionStorage.getItem(`imageUrl`);
}

export function getApplicationName(): string | null {
    if (typeof window === "undefined") {
        console.log("Window was null")
        return null;
    }
    return sessionStorage.getItem(`applicationName`);
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

