package com.group.gm.parking_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.openapi.model.ParkingProperty;
import com.group.gm.openapi.model.Ticket;
import com.group.gm.parking_backend.config.FirestoreConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreParkingDatabase {

    private CollectionReference propertyCollection;
    private CollectionReference ticketCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreParkingDatabase.class);


    public FirestoreParkingDatabase() {
    }

    private void tenantSpecificConfig(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        GmTenant gmTenant = (GmTenant) authentication.getDetails();
        String dbId = gmTenant.getServices().getParkingDb().getUrl();
        Firestore firestore;
        try {
            firestore = new FirestoreConfig(dbId).firestore();
            logger.info("Firestore with id: " + dbId);
        } catch (IOException e) {
            logger.error("unable to get firestore"+ e.getMessage());
            throw new RuntimeException(e);
        }
        String tenantId = (String) authentication.getCredentials();
        if(gmTenant.getTier()== GmTenant.TierEnum.ENTRY){
            propertyCollection = firestore.collection("tenants").document(tenantId).collection("properties");
            ticketCollection = firestore.collection("tenants").document(tenantId).collection("tickets");
        } else {
            propertyCollection = firestore.collection("properties");
            ticketCollection = firestore.collection("tickets");
        }
    }

    public ParkingProperty add(ParkingProperty property) {
        tenantSpecificConfig();
        try {
            ApiFuture<DocumentReference> future = propertyCollection.add(property);
            DocumentReference document = future.get();
            property.setId(document.getId());
            document.set(property);
            logger.info("Added property: {} to: {}", property, propertyCollection.getId());

            return property;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error adding property: {}", e.getMessage());
            return null;
        }
    }

    public ParkingProperty getById(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                ParkingProperty property = document.toObject(ParkingProperty.class);
                if (property != null) {
                    property.setId(document.getId());
                }
                return property;
            } else {
                logger.warn("No property found with id: {}", id);
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching property by id: {}", e.getMessage());
            return null;
        }
    }

    public ParkingProperty update(ParkingProperty property) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(property.getId());
            ApiFuture<WriteResult> future = docRef.set(property);
            future.get();
            logger.info("Updated property: {} in: {}", property, propertyCollection.getId());
            return property;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error updating property: {}", e.getMessage());
            return null;
        }
    }

    public boolean delete(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted property with id: {} in: {}", id, propertyCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error deleting property: {}", e.getMessage());
            return false;
        }
    }

    public Ticket addTicket(Ticket ticket) {
        tenantSpecificConfig();
        try {
            ApiFuture<DocumentReference> future = ticketCollection.add(ticket);
            DocumentReference document = future.get();
            ticket.setId(document.getId());
            document.set(ticket);
            logger.info("Added ticket: {} to: {}", ticket, ticketCollection.getId());
            return ticket;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error adding ticket: {}", e.getMessage());
            return null;
        }
    }

    public Ticket getTicketById(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = ticketCollection.document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                Ticket ticket = document.toObject(Ticket.class);
                if (ticket != null) {
                    ticket.setId(document.getId());
                }
                return ticket;
            } else {
                logger.warn("No ticket found with id: {}", id);
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching ticket by id: {}", e.getMessage());
            return null;
        }
    }

    public Ticket updateTicket(Ticket ticket) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = ticketCollection.document(ticket.getId());
            ApiFuture<WriteResult> future = docRef.set(ticket);
            future.get();
            logger.info("Updated ticket: {} in: {}", ticket, ticketCollection.getId());
            return ticket;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error updating ticket: {}", e.getMessage());
            return null;
        }
    }

    public boolean deleteTicket(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = ticketCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted ticket with id: {} in: {}", id, ticketCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error deleting ticket: {}", e.getMessage());
            return false;
        }
    }

}
