package com.group.gm.parking_backend.db;

import java.util.List;

public interface GMDBService<T> {

    /**
     * Fügt ein neues Objekt hinzu.
     *
     * @param entity Das hinzuzufügende Objekt.
     * @return Das hinzugefügte Objekt mit generierter ID.
     */
    T add(T entity);

    /**
     * Gibt eine Liste aller Objekte zurück.
     *
     * @return Liste aller Objekte.
     */
    List<T> getAll();

    /**
     * Ruft ein spezifisches Objekt anhand der ID ab.
     *
     * @param id Die ID des Objekts.
     * @return Das Objekt mit der angegebenen ID, falls vorhanden.
     */
    T getById(String id);

    /**
     * Filtert die Objekte nach einem bestimmten Attribut (z. B. Property) und Status.
     *
     * @param attribute Ein Filterattribut, wie z. B. Property.
     * @param status Der Status der Objekte (z. B. Offen, Geschlossen).
     * @return Gefilterte Liste der Objekte.
     */
    List<T> filter(String attribute, String status);

    /**
     * Aktualisiert ein vorhandenes Objekt.
     *
     * @param entity Das zu aktualisierende Objekt.
     * @return Das aktualisierte Objekt, oder null, wenn es nicht gefunden wurde.
     */
    T update(T entity);

    /**
     * Löscht ein Objekt anhand der ID.
     *
     * @param id Die ID des zu löschenden Objekts.
     * @return true, wenn das Objekt erfolgreich gelöscht wurde, andernfalls false.
     */
    boolean delete(String id);
}
