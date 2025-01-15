package com.group.gm.finance_backend.db;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface GMDBService<T> {

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

    Map<String, Object> generateFinanceReport(String location, String startDatum, String endDatum);

    Map<String, Object> generateDefectReport(String location, String status, String startDatum, String endDatum);

    MultipartFile generatePdfFromReport(Map<String, Object> report);

    MultipartFile generatePdfFromFinanceReport(Map<String, Object> report);
}
