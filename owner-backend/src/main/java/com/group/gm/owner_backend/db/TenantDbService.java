package com.group.gm.owner_backend.db;

import com.group.gm.openapi.model.Tenant;

import java.util.List;

public interface TenantDbService {

    /**
     * Fügt einen neuen Tenant hinzu.
     *
     * @param tenant Das hinzuzufügende Tenant-Objekt.
     * @return Das hinzugefügte Tenant mit generierter ID.
     */
    Tenant addTenant(Tenant tenant);

    /**
     * Gibt eine Liste aller Tenants zurück.
     *
     * @return Liste aller Tenants.
     */
    List<Tenant> getAllTenants();

    /**
     * Ruft einen spezifischen Tenant anhand der ID ab.
     *
     * @param id Die ID des Tenants.
     * @return Das Tenant mit der angegebenen ID, falls vorhanden.
     */
    Tenant getTenantById(String id);

    /**
     * Filtert die Tenants nach Property und Status.
     *
     * @param property Das Parkhaus, nach dem gefiltert werden soll.
     * @param status Der Status der Tenants (z.B. Offen, Geschlossen).
     * @return Gefilterte Liste der Tenants.
     */
    List<Tenant> filterTenants(String property, String status);

    /**
     * Aktualisiert einen vorhandenen Tenant.
     *
     * @param tenant Das zu aktualisierende Tenant-Objekt.
     * @return Das aktualisierte Tenant, oder null, wenn es nicht gefunden wurde.
     */
    Tenant updateTenant(Tenant tenant);

    /**
     * Löscht einen Tenant anhand der ID.
     *
     * @param id Die ID des zu löschenden Tenants.
     * @return true, wenn der Tenant erfolgreich gelöscht wurde, andernfalls false.
     */
    boolean deleteTenant(String id);
}

