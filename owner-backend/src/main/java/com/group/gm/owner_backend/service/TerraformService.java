package com.group.gm.owner_backend.service;

import com.group.gm.openapi.model.GmTenant;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

@Service
public class TerraformService {
    public void start(String clusterName, GmTenant gmTenant) {
        try {
            // Pfad zum Skript
            String scriptPath = "/app/scripts/newTenant.sh";

            // ProcessBuilder initialisieren mit Parametern
            ProcessBuilder processBuilder = new ProcessBuilder(
                    scriptPath,
                    clusterName,
                    gmTenant.getPreferedRegion(),
                    gmTenant.getServices().getPropertyBackend().getVersion(),
                    gmTenant.getServices().getManagementFrontend().getVersion(),
                    gmTenant.getServices().getFinanceBackend().getVersion()
            );

            // Starte den Prozess
            Process process = processBuilder.start();


            // Standard- und Fehlerausgabe des Prozesses in separaten Threads lesen und direkt auf die Konsole loggen
            Thread stdOutLogger = new Thread(() -> logStream(process.getInputStream(), "STDOUT"));
            Thread stdErrLogger = new Thread(() -> logStream(process.getErrorStream(), "STDERR"));

            // Threads starten
            stdOutLogger.start();
            stdErrLogger.start();

            // Warte auf die Beendigung des Prozesses
            int exitCode = process.waitFor();

            // Warte auf die Beendigung der Logging-Threads
            stdOutLogger.join();
            stdErrLogger.join();

            System.out.println("Skript beendet mit Exit-Code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void startUpdate(String clusterName, GmTenant gmTenant) {
        try {
            // Pfad zum Skript
            String scriptPath = "/app/scripts/updateTenant.sh";

            // ProcessBuilder initialisieren mit Parametern
            ProcessBuilder processBuilder = new ProcessBuilder(
                    scriptPath,
                    clusterName,
                    gmTenant.getPreferedRegion(),
                    gmTenant.getServices().getPropertyBackend().getVersion(),
                    gmTenant.getServices().getManagementFrontend().getVersion(),
                    gmTenant.getServices().getFinanceBackend().getVersion()
            );

            // Starte den Prozess
            Process process = processBuilder.start();


            // Standard- und Fehlerausgabe des Prozesses in separaten Threads lesen und direkt auf die Konsole loggen
            Thread stdOutLogger = new Thread(() -> logStream(process.getInputStream(), "STDOUT"));
            Thread stdErrLogger = new Thread(() -> logStream(process.getErrorStream(), "STDERR"));

            // Threads starten
            stdOutLogger.start();
            stdErrLogger.start();

            // Warte auf die Beendigung des Prozesses
            int exitCode = process.waitFor();

            // Warte auf die Beendigung der Logging-Threads
            stdOutLogger.join();
            stdErrLogger.join();

            System.out.println("Skript beendet mit Exit-Code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    /**
     * Liest den Stream (stdout oder stderr) und loggt ihn direkt in die Konsole.
     */
    private static void logStream(InputStream stream, String streamName) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[" + streamName + "] " + line);
            }
        } catch (IOException e) {
            System.err.println("Fehler beim Lesen des Streams [" + streamName + "]: " + e.getMessage());
        }
    }
}
