package com.example.care_bridge.service;

import com.example.care_bridge.user.entity.TherapistProfile;
import com.example.care_bridge.repository.TherapistProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TherapistprofileService {

    private final TherapistProfileRepository profileRepository;

    // CREATE
    @Transactional
    public TherapistProfile createProfile(TherapistProfile profile) {
        if (profile.getRating() == 0.0) {
            profile.setRating(0.0);
        }
        return profileRepository.save(profile);
    }

    // READ (All)
    @Transactional(readOnly = true)
    public List<TherapistProfile> getAllProfiles() {
        return profileRepository.findAll();
    }

    // READ (Single by ID)
    @Transactional(readOnly = true)
    public Optional<TherapistProfile> getProfileById(Long id) {
        return profileRepository.findByIdWithDetails(id);
    }

    // READ (By Specialty)
    @Transactional(readOnly = true)
    public List<TherapistProfile> getProfilesBySpecialty(String specialty) {
        return profileRepository.findBySpecialty(specialty);
    }

    // UPDATE
    @Transactional
    public TherapistProfile updateProfile(Long id, TherapistProfile updatedDetails) {
        return profileRepository.findByIdWithDetails(id).map(existingProfile -> {

            existingProfile.setTitle(updatedDetails.getTitle());
            existingProfile.setSpecialization(updatedDetails.getSpecialization());
            existingProfile.setBio(updatedDetails.getBio());
            existingProfile.setLocation(updatedDetails.getLocation());
            existingProfile.setLanguages(updatedDetails.getLanguages());
            existingProfile.setRating(updatedDetails.getRating());
            existingProfile.setImageUrl(updatedDetails.getImageUrl());
            existingProfile.setConsultationType(updatedDetails.getConsultationType());
            existingProfile.setContactMethod(updatedDetails.getContactMethod());
            existingProfile.setVerified(updatedDetails.isVerified());
            existingProfile.setPricePerSession(updatedDetails.getPricePerSession());
            existingProfile.setYearsOfExperience(updatedDetails.getYearsOfExperience());

            // Synchronizing Set collections securely within the transaction state
            existingProfile.getSpecialties().clear();
            if (updatedDetails.getSpecialties() != null) {
                existingProfile.getSpecialties().addAll(updatedDetails.getSpecialties());
            }

            existingProfile.getEducation().clear();
            if (updatedDetails.getEducation() != null) {
                existingProfile.getEducation().addAll(updatedDetails.getEducation());
            }

            existingProfile.getWorkSchedule().clear();
            if (updatedDetails.getWorkSchedule() != null) {
                existingProfile.getWorkSchedule().addAll(updatedDetails.getWorkSchedule());
            }

            return existingProfile;

        }).orElseThrow(() -> new EntityNotFoundException("Therapist profile not found with id: " + id));
    }

    // DELETE
    @Transactional
    public void deleteProfile(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete. Therapist profile not found with id: " + id);
        }
        profileRepository.deleteById(id);
    }
}