package com.group.gm.gm_backend.db;

import com.group.gm.openapi.model.Defect;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;


public class TextFileDefectDatabase implements GMDBService {

    private final String filePath;

    // Konstruktor, der den Pfad zur Textdatei erhält
    public TextFileDefectDatabase(String filePath) {
        this.filePath = filePath;
    }

    // Methode zum Hinzufügen eines neuen Defects
    @Override
    public Defect addDefect(Defect defect) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath, true))) {
            String defectString = defectToString(defect);
            writer.write(defectString);
            writer.newLine();
            return defect;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Methode zum Abrufen aller Defects
    @Override
    public List<Defect> getAllDefects() {
        return readAllDefects();
    }

    // Methode zum Abrufen eines Defects anhand der ID
    @Override
    public Defect getDefectById(String id) {
        return readAllDefects().stream()
                .filter(defect -> defect.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    // Methode zum Filtern der Defects nach Property und Status
    @Override
    public List<Defect> filterDefects(String property, String status) {
        return readAllDefects().stream()
                .filter(defect -> (property == null || defect.getProperty().equals(property)) &&
                        (status == null || defect.getStatus().equals(status)))
                .collect(Collectors.toList());
    }

    // Methode zum Aktualisieren eines Defects
    @Override
    public Defect updateDefect(Defect updatedDefect) {
        List<Defect> defects = readAllDefects();
        boolean updated = false;

        for (int i = 0; i < defects.size(); i++) {
            if (defects.get(i).getId().equals(updatedDefect.getId())) {
                defects.set(i, updatedDefect);
                updated = true;
                break;
            }
        }

        if (updated) {
            writeAllDefects(defects);
            return updatedDefect;
        } else {
            return null;
        }
    }

    // Methode zum Löschen eines Defects anhand der ID
    @Override
    public boolean deleteDefect(String id) {
        List<Defect> defects = readAllDefects();
        boolean removed = defects.removeIf(defect -> defect.getId().equals(id));

        if (removed) {
            writeAllDefects(defects);
            return true;
        }
        return false;
    }

    private String defectToString(Defect defect) {
        return String.join(";",
                defect.getId(),
                defect.getProperty(),
                defect.getLocation(),
                defect.getDescriptionShort(),
                defect.getDescriptionDetailed(),
                defect.getReportingDate() != null ? defect.getReportingDate().toString() : "", // Konvertierung zu String
                defect.getStatus() != null ? defect.getStatus().getValue() : "" // Enum-Wert als String
        );
    }

    private Defect stringToDefect(String line) {
        String[] parts = line.split(";");
        Defect defect = new Defect(); // Leeres Defect-Objekt erstellen

        // Felder setzen
        defect.setId(parts[0]);
        defect.setProperty(parts[1]);
        defect.setLocation(parts[2]);
        defect.setDescriptionShort(parts[3]);
        defect.setDescriptionDetailed(parts[4]);

        // LocalDate aus String parsen
        defect.setReportingDate(parseDate(parts[5])); // Annahme: parts[5] enthält das Datum im Format "yyyy-MM-dd"

        // StatusEnum setzen
        defect.setStatus(Defect.StatusEnum.fromValue(parts[6])); // Annahme: parts[6] enthält den Status

        return defect; // Defect-Objekt zurückgeben
    }

    // Hilfsmethode zum Parsen des Datums
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null; // oder eine Standarddatum, falls nötig
        }
        return LocalDate.parse(dateString); // Datum im Format "yyyy-MM-dd" parsen
    }



    // Hilfsmethode: Alle Defects aus der Datei lesen
    private List<Defect> readAllDefects() {
        List<Defect> defects = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                defects.add(stringToDefect(line));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return defects;
    }

    // Hilfsmethode: Alle Defects in die Datei schreiben
    private void writeAllDefects(List<Defect> defects) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            for (Defect defect : defects) {
                writer.write(defectToString(defect));
                writer.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
