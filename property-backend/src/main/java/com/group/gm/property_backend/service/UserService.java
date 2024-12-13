package com.group.gm.property_backend.service;

import com.group.gm.openapi.model.User;
import com.group.gm.property_backend.db.GMDBService;
import com.group.gm.openapi.api.UserApiDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements UserApiDelegate {

    private final GMDBService<User> gmdbService;

    Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(GMDBService<User> gmdbService) {
        this.gmdbService = gmdbService;
    }

    @Override
    public ResponseEntity<User> getUserById(String id) {
        User user = gmdbService.getById(id);
        if (user != null) {
            return ResponseEntity.ok(gmdbService.getById(id));
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @Override
    public ResponseEntity<User> addUser(User user) {
        if (user == null || user.getMail() == null) {
            return ResponseEntity.badRequest().build();
        }
        gmdbService.add(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user); // 201 Created
    }

    @Override
    public ResponseEntity<List<User>> listUsers(String role, String name) {
        List<User> users;
        users = gmdbService.getAll();
        if (name != null && !name.isEmpty() && role != null && !role.isEmpty()) {
            users = users.stream()
                    .filter(user -> name.equals(user.getName()) &&
                            role.equals(user.getRole() != null ? user.getRole().getValue() : null))
                    .collect(Collectors.toList());
        } else if (name != null && !name.isEmpty()) {
            users = users.stream()
                    .filter(user -> name.equals(user.getName()))
                    .collect(Collectors.toList());
        } else if (role != null && !role.isEmpty()) {
            users = users.stream()
                    .filter(defect -> role.equals(defect.getRole() != null ? defect.getRole().getValue() : null))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(users);
    }

    @Override
    public ResponseEntity<Void> deleteUser(String id) {
        try {
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
    public ResponseEntity<User> updateUser(String id, User updatedUser) {
        User existingUser = gmdbService.getById(id);

        if (existingUser == null) {
            return ResponseEntity.notFound().build();
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setMail(updatedUser.getMail());
        existingUser.setRole(updatedUser.getRole());

        gmdbService.update(existingUser);

        return ResponseEntity.ok(existingUser);
    }
}
