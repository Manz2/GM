package com.group.gm.parking_backend.service;

import com.group.gm.openapi.api.ParkingApiDelegate;
import com.group.gm.openapi.model.Occupancy;
import com.group.gm.openapi.model.ParkingProperty;
import com.group.gm.openapi.model.Ticket;
import com.group.gm.parking_backend.db.FirestoreParkingDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ParkingService implements ParkingApiDelegate {

    private final FirestoreParkingDatabase parkingDatabase;
    private static final Logger logger = LoggerFactory.getLogger(ParkingService.class);

    public ParkingService(FirestoreParkingDatabase parkingDatabase) {
        this.parkingDatabase = parkingDatabase;
    }

    @Override
    public ResponseEntity<Double> getPrice(String ticketId) {
        logger.info("Fetching price for ticketId: {}", ticketId);

        Ticket ticket = parkingDatabase.getTicketById(ticketId);
        if (ticket != null) {
            // Beispiel: Preis berechnen (10 Einheiten pro Stunde seit Erstellung)
            long creationTime = ticket.getCreationDate();
            long currentTime = System.currentTimeMillis();
            double price = ((double) (currentTime - creationTime) / 3600000 * 10); // Preis pro Stunde
            return ResponseEntity.ok(price);
        }
        return ResponseEntity.badRequest().build();
    }

    @Override
    public ResponseEntity<Void> isTicketPayed(String ticketId) {
        logger.info("Checking payment status for ticketId: {}", ticketId);

        Ticket ticket = parkingDatabase.getTicketById(ticketId);
        if (ticket != null &&
                Ticket.StatusEnum.BEZAHLT.equals(ticket.getStatus())) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> markTicketPayed(String ticketId) {
        logger.info("Marking ticketId: {} as paid", ticketId);

        Ticket ticket = parkingDatabase.getTicketById(ticketId);
        if (ticket != null) {
            ticket.setStatus(Ticket.StatusEnum.BEZAHLT);
            parkingDatabase.updateTicket(ticket);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @Override
    public ResponseEntity<Occupancy> occupancy(String propertyId) {
        logger.info("Fetching occupancy for propertyId: {}", propertyId);

        // Beispiel: Platzhalter für Auslastung, da es keine direkte Implementierung in der DB gibt.
        Occupancy occupancy = new Occupancy();
        occupancy.setSpaces(100); // Beispielwerte
        occupancy.setUsed(60);    // Beispielwerte
        return ResponseEntity.ok(occupancy);
    }

    @Override
    public ResponseEntity<Ticket> requestEntry(String propertyId) {
        logger.info("Requesting entry for propertyId: {}", propertyId);
        ParkingProperty property = parkingDatabase.getById(propertyId);
        if (property.getAvailableSpace() > property.getOccupiedSpace()) {
            return ResponseEntity.noContent().build();
        }
        property.setOccupiedSpace(property.getOccupiedSpace()+1);

        Ticket ticket = new Ticket();
        ticket.setPropertyId(propertyId);
        ticket.setCreationDate(System.currentTimeMillis());
        ticket.setStatus(Ticket.StatusEnum.OFFEN);


        Ticket createdTicket = parkingDatabase.addTicket(ticket);
        return ResponseEntity.ok(createdTicket);
    }

    @Override
    public ResponseEntity<Void> requestExit(String propertyId, String ticketId) {
        logger.info("Requesting exit for ticketId: {} in propertyId: {}", ticketId, propertyId);
        ParkingProperty property = parkingDatabase.getById(propertyId);

        Ticket ticket = parkingDatabase.getTicketById(ticketId);
        if (ticket != null && Ticket.StatusEnum.BEZAHLT.equals(ticket.getStatus())) {
            property.setOccupiedSpace(property.getOccupiedSpace()-1);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.noContent().build();
    }
}
