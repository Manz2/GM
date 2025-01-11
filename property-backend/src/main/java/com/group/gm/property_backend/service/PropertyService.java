package com.group.gm.property_backend.service;

import com.group.gm.openapi.model.ParkingProperty;
import com.group.gm.openapi.model.Property;
import com.group.gm.property_backend.db.FirestoreParkingDatabase;
import com.group.gm.property_backend.db.GMDBService;
import com.group.gm.openapi.api.PropertyApiDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PropertyService implements PropertyApiDelegate {

    private final GMDBService<Property> gmdbService;
    private final GoogleCloudStorageService storageService;
    private final FirestoreParkingDatabase parkingDatabase;
    private final String projectId;
    private final String bucket;

    Logger logger = LoggerFactory.getLogger(PropertyService.class);

    public PropertyService(GMDBService<Property> gmdbService,
                          GoogleCloudStorageService storageService,
                          @Value("${google.cloud.projectId}") String projectId,
                          @Value("${google.cloud.bucket}") String bucket,
                           FirestoreParkingDatabase parkingDatabase) {
        this.gmdbService = gmdbService;
        this.storageService = storageService;
        this.projectId = projectId;
        this.bucket = bucket;
        this.parkingDatabase = parkingDatabase;
    }

    @Override
    public ResponseEntity<Property> getPropertyById(String id) {
        Property property = gmdbService.getById(id);
        if (property != null) {
            return ResponseEntity.ok(gmdbService.getById(id));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Resource> getPropertyImageById(String id) {
        try {
            String prefix = id.substring(0, id.lastIndexOf('.'));
            String suffix = id.substring(id.lastIndexOf('.'));

            Path path = Files.createTempFile(prefix, suffix);
            storageService.downloadObject(id, path);
            return ResponseEntity.ok(new UrlResource(path.toUri()));
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Property> addProperty(Property property, MultipartFile file) {
        if (property == null || property.getCity() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (file != null) {
            String imagePath = storageService.uploadObject(file);
            property.setImage(imagePath);
        } else {
            property.setImage("");
        }
        ParkingProperty parkingProperty = new ParkingProperty();
        parkingProperty.setId(property.getId());
        parkingProperty.setAvailableSpace(property.getCapacity());
        parkingDatabase.add(parkingProperty);
        gmdbService.add(property);
        return ResponseEntity.status(HttpStatus.CREATED).body(property); // 201 Created
    }

    @Override
    public ResponseEntity<List<Property>> listProperties(String city,
                                                  Integer capacity){
        List<Property> properties;
        properties = gmdbService.getAll();
        if (city != null && !city.isEmpty() && capacity != null && capacity > 0) {
            properties = properties.stream()
                    .filter(property -> city.equals(property.getCity()) &&
                            capacity.equals(property.getCapacity()))
                    .collect(Collectors.toList());
        } else if (city != null && !city.isEmpty()) {
            properties = properties.stream()
                    .filter(property -> city.equals(property.getCity()))
                    .collect(Collectors.toList());
        } else if (capacity != null && capacity > 0) {
            properties = properties.stream()
                    .filter(property -> capacity.equals(property.getCapacity()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(properties);
    }

    @Override
    public ResponseEntity<Void> deleteProperty(String id) {
        try {
            Property property = gmdbService.getById(id);
            String image = property.getImage();
            if (!Objects.equals(image, "")) {
                storageService.deleteObject(projectId, property.getImage());
            }
            parkingDatabase.delete(id);
            boolean deleted = gmdbService.delete(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Property> updateProperty(String id, Property updatedProperty) {
        Property existingProperty = gmdbService.getById(id);

        if (existingProperty == null) {
            return ResponseEntity.notFound().build();
        }

        if(!Objects.equals(existingProperty.getCapacity(), updatedProperty.getCapacity())){
            ParkingProperty parkingProperty = new ParkingProperty();
            parkingProperty.setId(updatedProperty.getId());
            parkingProperty.setAvailableSpace(updatedProperty.getCapacity());
            parkingDatabase.update(parkingProperty);
        }

        existingProperty.setName(updatedProperty.getName());
        existingProperty.setAddress(updatedProperty.getAddress());
        existingProperty.setStatus(updatedProperty.getStatus());
        existingProperty.setCity(updatedProperty.getCity());
        existingProperty.setConstructionDate(updatedProperty.getConstructionDate());
        existingProperty.setImage(updatedProperty.getImage());
        existingProperty.setCapacity(updatedProperty.getCapacity());
        existingProperty.setExpenses(updatedProperty.getExpenses());
        existingProperty.setFloors(updatedProperty.getFloors());
        existingProperty.setPaymentWatcherJob(updatedProperty.getPaymentWatcherJob());
        existingProperty.setPricing(updatedProperty.getPricing());

        gmdbService.update(existingProperty);

        return ResponseEntity.ok(existingProperty);
    }
}
