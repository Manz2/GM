//package com.group.gm.gm_backend.db;
//
//import com.group.gm.openapi.model.Defect;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.*;
//import java.util.*;
//import java.util.stream.Collectors;
//import java.time.LocalDate;
//
//@Service
//public class TextFileDefectDatabase implements GMDBService {
//
//    //Pfad zur Textdatei welche Defects speichert
//    private final String filePath;
//
//    public TextFileDefectDatabase(@Value("${TextFileDefectDatabase.path}") String filePath) {
//        this.filePath = filePath;
//        try {
//            new File(filePath).createNewFile();
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//    }
//
//    @Override
//    public Defect addDefect(Defect defect) {
//        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath, true))) {
//            String defectString = defectToString(defect);
//            writer.write(defectString);
//            writer.newLine();
//            return defect;
//        } catch (IOException e) {
//            e.printStackTrace();
//            return null;
//        }
//    }
//
//    @Override
//    public Defect addDefectWithImage(Defect defect, MultipartFile image) {
//        throw new UnsupportedOperationException();
//    }
//
//
//    @Override
//    public List<Defect> getAllDefects() {
//        return readAllDefects();
//    }
//
//    @Override
//    public Defect getDefectById(String id) {
//        return readAllDefects().stream()
//                .filter(defect -> defect.getId().equals(id))
//                .findFirst()
//                .orElse(null);
//    }
//
//    @Override
//    public List<Defect> filterDefects(String property, String status) {
//        return readAllDefects().stream()
//                .filter(defect -> (property == null || defect.getProperty().equals(property)) &&
//                        (status == null || defect.getStatus().equals(status)))
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public Defect updateDefect(Defect updatedDefect) {
//        List<Defect> defects = readAllDefects();
//        boolean updated = false;
//
//        for (int i = 0; i < defects.size(); i++) {
//            if (defects.get(i).getId().equals(updatedDefect.getId())) {
//                defects.set(i, updatedDefect);
//                updated = true;
//                break;
//            }
//        }
//
//        if (updated) {
//            writeAllDefects(defects);
//            return updatedDefect;
//        } else {
//            return null;
//        }
//    }
//
//    @Override
//    public boolean deleteDefect(String id) {
//        List<Defect> defects = readAllDefects();
//        boolean removed = defects.removeIf(defect -> defect.getId().equals(id));
//
//        if (removed) {
//            writeAllDefects(defects);
//            return true;
//        }
//        return false;
//    }
//
//    private String defectToString(Defect defect) {
//        return String.join(";",
//                defect.getId(),
//                defect.getProperty(),
//                defect.getLocation(),
//                defect.getDescriptionShort(),
//                defect.getDescriptionDetailed(),
//                defect.getReportingDate() != null ? defect.getReportingDate().toString() : "", // Konvertierung zu String
//                defect.getStatus() != null ? defect.getStatus().getValue() : "" // Enum-Wert als String
//        );
//    }
//
//    private Defect stringToDefect(String line) {
//        String[] parts = line.split(";");
//        Defect defect = new Defect(); // Leeres Defect-Objekt erstellen
//
//        // Felder setzen
//        defect.setId(parts[0]);
//        defect.setProperty(parts[1]);
//        defect.setLocation(parts[2]);
//        defect.setDescriptionShort(parts[3]);
//        defect.setDescriptionDetailed(parts[4]);
//
//        // LocalDate aus String parsen
//        defect.setReportingDate(parseDate(parts[5])); // Annahme: parts[5] enthält das Datum im Format "yyyy-MM-dd"
//
//        // StatusEnum setzen
//        defect.setStatus(Defect.StatusEnum.fromValue(parts[6])); // Annahme: parts[6] enthält den Status
//
//        return defect; // Defect-Objekt zurückgeben
//    }
//
//    // Hilfsmethode zum Parsen des Datums
//    private long parseDate(String dateString) {
//        if (dateString == null || dateString.isEmpty()) {
//            return 0; // oder eine Standarddatum, falls nötig
//        }
//        return LocalDate.parse(dateString).toEpochDay(); // Datum im Format "yyyy-MM-dd" parsen
//    }
//
//
//
//    // Hilfsmethode: Alle Defects aus der Datei lesen
//    private List<Defect> readAllDefects() {
//        List<Defect> defects = new ArrayList<>();
//        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
//            String line;
//            while ((line = reader.readLine()) != null) {
//                defects.add(stringToDefect(line));
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        return defects;
//    }
//
//    // Hilfsmethode: Alle Defects in die Datei schreiben
//    private void writeAllDefects(List<Defect> defects) {
//        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
//            for (Defect defect : defects) {
//                writer.write(defectToString(defect));
//                writer.newLine();
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//}
