package com.example.care_bridge.controller;

import com.example.care_bridge.model.TherapistDTO;
import com.example.care_bridge.user.entity.TherapistProfile;
import com.example.care_bridge.user.entity.User;
import com.example.care_bridge.service.TherapistprofileService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/therapists")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TherapistProfileController {

    private final TherapistprofileService profileService;

    // POST: Create a new profile
    @PostMapping
    public ResponseEntity<TherapistProfile> createProfile(@RequestBody TherapistProfile profile) {
        TherapistProfile created = profileService.createProfile(profile);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }


    @GetMapping
    public ResponseEntity<List<TherapistDTO>> getAllProfiles(
            @RequestParam(required = false) String specialty) {

        List<TherapistProfile> profiles = profileService.getAllProfiles();

        if (specialty != null && !specialty.isBlank()) {
            profiles = profiles.stream()
                    .filter(p -> p.getSpecialization() != null &&
                            p.getSpecialization().toLowerCase().contains(specialty.toLowerCase()))
                    .collect(Collectors.toList());
        }

        List<TherapistDTO> dtos = profiles.stream()
                .map(TherapistDTO::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }


    // GET: Single profile by ID (flat map for React detail page)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProfileById(@PathVariable Long id) {
        return profileService.getProfileById(id)
                .map(profile -> ResponseEntity.ok(flattenProfileData(profile)))
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT: Update an existing profile
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id,
                                           @RequestBody TherapistProfile updatedDetails) {
        try {
            TherapistProfile updated = profileService.updateProfile(id, updatedDetails);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // DELETE: Remove a profile
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable Long id) {
        try {
            profileService.deleteProfile(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ─── Helper: merge TherapistProfile + linked User into one flat map ───────
    // This is what makes firstName/lastName show up in the React frontend.
    // All fields the frontend Therapist interface expects are included here.
    private Map<String, Object> flattenProfileData(TherapistProfile profile) {
        Map<String, Object> flat = new HashMap<>();

        // TherapistProfile fields
        flat.put("id",                profile.getId());
        flat.put("title",             profile.getTitle());
        flat.put("specialization",    profile.getSpecialization());
        flat.put("bio",               profile.getBio());
        flat.put("location",          profile.getLocation());
        flat.put("languages",         profile.getLanguages());
        flat.put("rating",            profile.getRating());
        flat.put("imageUrl",          profile.getImageUrl());
        flat.put("consultationType",  profile.getConsultationType());
        flat.put("contactMethod",     profile.getContactMethod());
        flat.put("isVerified",        profile.isVerified());
        flat.put("pricePerSession",   profile.getPricePerSession());
        flat.put("yearsOfExperience", profile.getYearsOfExperience());
        flat.put("specialties",       profile.getSpecialties());
        flat.put("education",         profile.getEducation());
        flat.put("workSchedule",      profile.getWorkSchedule());

        // User fields — pulled from the linked User entity
        // These will be empty strings if the JOIN FETCH didn't load the user
        User user = profile.getUser();
        if (user != null) {
            flat.put("firstName", user.getFirstName());
            flat.put("lastName",  user.getLastName());
            flat.put("email",     user.getEmail());
            flat.put("phone",     user.getPhone());
        } else {
            flat.put("firstName", "");
            flat.put("lastName",  "");
            flat.put("email",     "");
            flat.put("phone",     "");
        }

        return flat;
    }
}