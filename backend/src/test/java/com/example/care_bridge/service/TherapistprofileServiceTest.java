package com.example.care_bridge.service;

import com.example.care_bridge.user.TherapistProfile;
import com.example.care_bridge.repository.TherapistProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TherapistprofileServiceTest {

    @Mock
    private TherapistProfileRepository profileRepository;

    @InjectMocks
    private TherapistprofileService therapistService;

    private TherapistProfile sampleProfile;

    @BeforeEach
    void setUp() {
        // Initialize a clean sample object before each test
        sampleProfile = new TherapistProfile();
        sampleProfile.setId(1L);
        sampleProfile.setTitle("Dr. Jane Doe");
        sampleProfile.setSpecialization("Cognitive Behavioral Therapy");
        sampleProfile.setBio("Experienced clinical psychologist.");
        sampleProfile.setLocation("New York");
        sampleProfile.setLanguages("English, Spanish");
        sampleProfile.setRating(4.8);
        sampleProfile.setImageUrl("http://example.com/image.jpg");
        sampleProfile.setConsultationType("Video, In-Person");
        sampleProfile.setContactMethod("Email");
        sampleProfile.setVerified(true);
        sampleProfile.setPricePerSession(150.0);
        sampleProfile.setYearsOfExperience(10);

        // Initialize collections to avoid NullPointerException on update logic
        sampleProfile.setSpecialties(new ArrayList<>());
        sampleProfile.setEducation(new ArrayList<>());
        sampleProfile.setWorkSchedule(new ArrayList<>());
    }

    // ==========================================
    // CREATE TESTS
    // ==========================================
    @Nested
    @DisplayName("Create Profile Tests")
    class CreateProfileTests {

        @Test
        @DisplayName("Should successfully create a therapist profile")
        void shouldCreateProfile() {
            when(profileRepository.save(any(TherapistProfile.class))).thenReturn(sampleProfile);

            TherapistProfile savedProfile = therapistService.createProfile(sampleProfile);

            assertThat(savedProfile).isNotNull();
            assertThat(savedProfile.getTitle()).isEqualTo("Dr. Jane Doe");
            verify(profileRepository, times(1)).save(sampleProfile);
        }

        @Test
        @DisplayName("Should handle default rating check when rating is 0.0")
        void shouldHandleZeroRatingOnCreate() {
            sampleProfile.setRating(0.0);
            when(profileRepository.save(any(TherapistProfile.class))).thenReturn(sampleProfile);

            TherapistProfile savedProfile = therapistService.createProfile(sampleProfile);

            assertThat(savedProfile.getRating()).isEqualTo(0.0);
            verify(profileRepository, times(1)).save(sampleProfile);
        }
    }

    // ==========================================
    // READ TESTS
    // ==========================================
    @Nested
    @DisplayName("Read Profile Tests")
    class ReadProfileTests {

        @Test
        @DisplayName("Should return a list of all therapist profiles")
        void shouldReturnAllProfiles() {
            when(profileRepository.findAll()).thenReturn(List.of(sampleProfile));

            List<TherapistProfile> profiles = therapistService.getAllProfiles();

            assertThat(profiles).hasSize(1);
            assertThat(profiles.get(0).getId()).isEqualTo(1L);
            verify(profileRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return a profile when searching by valid ID")
        void shouldReturnProfileByValidId() {
            when(profileRepository.findByIdWithUser(1L)).thenReturn(Optional.of(sampleProfile));

            Optional<TherapistProfile> foundProfile = therapistService.getProfileById(1L);

            assertThat(foundProfile).isPresent();
            assertThat(foundProfile.get().getId()).isEqualTo(1L);
            verify(profileRepository, times(1)).findByIdWithUser(1L);
        }

        @Test
        @DisplayName("Should return empty Optional when searching by non-existing ID")
        void shouldReturnEmptyWhenIdNotFound() {
            when(profileRepository.findByIdWithUser(99L)).thenReturn(Optional.empty());

            Optional<TherapistProfile> foundProfile = therapistService.getProfileById(99L);

            assertThat(foundProfile).isEmpty();
            verify(profileRepository, times(1)).findByIdWithUser(99L);
        }

        @Test
        @DisplayName("Should return a list of profiles matching a specialty")
        void shouldReturnProfilesBySpecialty() {
            String targetSpecialty = "Anxiety";
            when(profileRepository.findBySpecialty(targetSpecialty)).thenReturn(List.of(sampleProfile));

            List<TherapistProfile> profiles = therapistService.getProfilesBySpecialty(targetSpecialty);

            assertThat(profiles).hasSize(1);
            verify(profileRepository, times(1)).findBySpecialty(targetSpecialty);
        }
    }

    // ==========================================
    // UPDATE TESTS
    // ==========================================
    @Nested
    @DisplayName("Update Profile Tests")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should update all details successfully when profile exists")
        void shouldUpdateProfileWhenExists() {
            // Arrange
            TherapistProfile existingProfile = new TherapistProfile();
            existingProfile.setId(1L);
            existingProfile.setSpecialties(new ArrayList<>());
            existingProfile.setEducation(new ArrayList<>());
            existingProfile.setWorkSchedule(new ArrayList<>());

            // 1. Create a mock or concrete instance of your WorkDaySchedule object
            // (Adjust the constructor or setters based on how your WorkDaySchedule entity is built)
            TherapistProfile.WorkDaySchedule mockSchedule = new TherapistProfile.WorkDaySchedule();
            // Example setting: mockSchedule.setDay("Monday"); mockSchedule.setTimeSlot("9-5");

            TherapistProfile updatedDetails = new TherapistProfile();
            updatedDetails.setTitle("Dr. Jane Updated");
            updatedDetails.setSpecialization("Trauma");
            updatedDetails.setBio("Updated bio text.");
            updatedDetails.setSpecialties(List.of("EMDR"));
            updatedDetails.setEducation(List.of("Ph.D. Harvard"));

            // 2. Pass the correct object list here instead of a String
            updatedDetails.setWorkSchedule(List.of(mockSchedule));

            when(profileRepository.findById(1L)).thenReturn(Optional.of(existingProfile));
            when(profileRepository.save(any(TherapistProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            TherapistProfile result = therapistService.updateProfile(1L, updatedDetails);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTitle()).isEqualTo("Dr. Jane Updated");
            assertThat(result.getSpecialization()).isEqualTo("Trauma");
            assertThat(result.getBio()).isEqualTo("Updated bio text.");
            assertThat(result.getSpecialties()).containsExactly("EMDR");
            assertThat(result.getEducation()).containsExactly("Ph.D. Harvard");

            // 3. Fix the assertion to expect the object array
            assertThat(result.getWorkSchedule()).containsExactly(mockSchedule);

            verify(profileRepository, times(1)).findById(1L);
            verify(profileRepository, times(1)).save(existingProfile);
        }
        @Test
        @DisplayName("Should throw EntityNotFoundException when updating non-existent profile")
        void shouldThrowExceptionWhenUpdateIdNotFound() {
            TherapistProfile updatedDetails = new TherapistProfile();
            when(profileRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> therapistService.updateProfile(99L, updatedDetails))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Therapist profile not found with id: 99");

            verify(profileRepository, times(1)).findById(99L);
            verify(profileRepository, never()).save(any());
        }
    }

    // ==========================================
    // DELETE TESTS
    // ==========================================
    @Nested
    @DisplayName("Delete Profile Tests")
    class DeleteProfileTests {

        @Test
        @DisplayName("Should successfully delete profile when ID exists")
        void shouldDeleteProfileWhenExists() {
            when(profileRepository.existsById(1L)).thenReturn(true);
            doNothing().when(profileRepository).deleteById(1L);

            therapistService.deleteProfile(1L);

            verify(profileRepository, times(1)).existsById(1L);
            verify(profileRepository, times(1)).deleteById(1L);
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when attempting to delete non-existent profile")
        void shouldThrowExceptionWhenDeleteIdNotFound() {
            when(profileRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> therapistService.deleteProfile(99L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Cannot delete. Therapist profile not found with id: 99");

            verify(profileRepository, times(1)).existsById(99L);
            verify(profileRepository, never()).deleteById(anyLong());
        }
    }
}