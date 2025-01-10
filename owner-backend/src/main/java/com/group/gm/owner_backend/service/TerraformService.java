package com.group.gm.owner_backend.service;

import com.group.gm.openapi.model.GmTenant;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TerraformService {
    public String start(String clusterName, GmTenant gmTenant) {
        String externalIp = null;
        try {
            // Pfad zum Skript
            String scriptPath = "/app/scripts/newTenant.sh";
            String regionStorage = gmTenant.getPreferedRegion().split("-[a-z]$")[0];

            // ProcessBuilder initialisieren mit Parametern
            ProcessBuilder processBuilder = new ProcessBuilder(
                    scriptPath,
                    clusterName,
                    gmTenant.getPreferedRegion(),
                    gmTenant.getServices().getPropertyBackend().getVersion(),
                    gmTenant.getServices().getManagementFrontend().getVersion(),
                    gmTenant.getServices().getFinanceBackend().getVersion(),
                    regionStorage
            );

            // Starte den Prozess
            Process process = processBuilder.start();


            // Standard- und Fehlerausgabe des Prozesses in separaten Threads lesen und direkt auf die Konsole loggen
            StringBuilder output = new StringBuilder();
            Thread stdOutLogger = new Thread(() -> {
                String result = logStreamAndCapture(process.getInputStream(), "STDOUT");
                synchronized (output) {
                    output.append(result);
                }
            });
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

            // External IP aus der Ausgabe extrahieren
            externalIp = parseExternalIp(output.toString());

            if (externalIp == null) {
                System.err.println("External IP konnte nicht ermittelt werden.");
            } else {
                System.out.println("External IP: " + externalIp);
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
        return externalIp;
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


    public void startMid(GmTenant gmTenant) {
        try {
            // Pfad zum Skript
            String scriptPath = "/app/scripts/newTenantMid.sh";
            String preferedRegion = gmTenant.getPreferedRegion();
            String regionStorage = preferedRegion.matches(".*-[a-z]$")
                    ? preferedRegion.split("-[a-z]$")[0]
                    : preferedRegion;


            // ProcessBuilder initialisieren mit Parametern
            ProcessBuilder processBuilder = new ProcessBuilder(
                    scriptPath,
                    gmTenant.getId(),
                    regionStorage
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

    public String relaunch(String clusterName, GmTenant gmTenant) {
        String externalIp = null;
        try {
            // Pfad zum Skript
            String scriptPath = "/app/scripts/relaunchTenant.sh";

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
            StringBuilder output = new StringBuilder();
            Thread stdOutLogger = new Thread(() -> {
                String result = logStreamAndCapture(process.getInputStream(), "STDOUT");
                synchronized (output) {
                    output.append(result);
                }
            });
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

            // External IP aus der Ausgabe extrahieren
            externalIp = parseExternalIp(output.toString());

            if (externalIp == null) {
                System.err.println("External IP konnte nicht ermittelt werden.");
            } else {
                System.out.println("External IP: " + externalIp);
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
        return externalIp;
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

    private String logStreamAndCapture(InputStream inputStream, String streamName) {
        StringBuilder capturedOutput = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[" + streamName + "] " + line);
                capturedOutput.append(line).append("\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return capturedOutput.toString();
    }

    private String parseExternalIp(String output) {
        // Suche nach der Zeile mit der External IP
        Pattern ipPattern = Pattern.compile("Ingress External IP: (\\d+\\.\\d+\\.\\d+\\.\\d+)");
        Matcher matcher = ipPattern.matcher(output);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
