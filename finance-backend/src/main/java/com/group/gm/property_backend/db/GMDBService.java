package com.group.gm.property_backend.db;

import com.group.gm.openapi.model.Defect;

import java.util.List;

public interface GMDBService {

    /**
     * Fügt einen neuen Defect hinzu.
     *
     * @param defect Das hinzuzufügende Defect-Objekt.
     * @return Das hinzugefügte Defect mit generierter ID.
     */
    Defect addDefect(Defect defect);

    /**
     * Gibt eine Liste aller Defects zurück.
     *
     * @return Liste aller Defects.
     */
    List<Defect> getAllDefects();

    /**
     * Ruft einen spezifischen Defect anhand der ID ab.
     *
     * @param id Die ID des Defects.
     * @return Das Defect mit der angegebenen ID, falls vorhanden.
     */
    Defect getDefectById(String id);

    /**
     * Filtert die Defects nach Property und Status.
     *
     * @param property Das Parkhaus, nach dem gefiltert werden soll.
     * @param status Der Status der Defects (z.B. Offen, Geschlossen).
     * @return Gefilterte Liste der Defects.
     */
    List<Defect> filterDefects(String property, String status);

    /**
     * Aktualisiert einen vorhandenen Defect.
     *
     * @param defect Das zu aktualisierende Defect-Objekt.
     * @return Das aktualisierte Defect, oder null, wenn es nicht gefunden wurde.
     */
    Defect updateDefect(Defect defect);

    /**
     * Löscht einen Defect anhand der ID.
     *
     * @param id Die ID des zu löschenden Defects.
     * @return true, wenn der Defect erfolgreich gelöscht wurde, andernfalls false.
     */
    boolean deleteDefect(String id);
}

