package com.example.care_bridge.user.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "therapist_profiles")
public class TherapistProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String location;

    private String languages;
    private double rating = 0.0;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String consultationType;

    @Column(columnDefinition = "TEXT")
    private String contactMethod;

    @JsonProperty("isVerified")
    private boolean isVerified = false;

    private double pricePerSession;
    private int yearsOfExperience;

    // Fixed N+1: Added FetchMode.SUBSELECT to efficiently batch load items for list views
    @ElementCollection
    @Fetch(FetchMode.SUBSELECT)
    @CollectionTable(name = "therapist_specialties", joinColumns = @JoinColumn(name = "therapist_id"))
    @Column(name = "specialty")
    private List<String> specialties = new ArrayList<>();

    // Fixed N+1: Added FetchMode.SUBSELECT to efficiently batch load items for list views
    @ElementCollection
    @Fetch(FetchMode.SUBSELECT)
    @CollectionTable(name = "therapist_education", joinColumns = @JoinColumn(name = "therapist_id"))
    @Column(name = "education_detail")
    private List<String> education = new ArrayList<>();

    // Fixed N+1: Added FetchMode.SUBSELECT to efficiently batch load items for list views
    @ElementCollection
    @Fetch(FetchMode.SUBSELECT)
    @CollectionTable(name = "therapist_work_schedules", joinColumns = @JoinColumn(name = "therapist_id"))
    private List<WorkDaySchedule> workSchedule = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // =========================================================================
    // GETTERS AND SETTERS FOR THERAPIST PROFILE
    // =========================================================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }

    public String getContactMethod() { return contactMethod; }
    public void setContactMethod(String contactMethod) { this.contactMethod = contactMethod; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean isVerified) { this.isVerified = isVerified; }

    public double getPricePerSession() { return pricePerSession; }
    public void setPricePerSession(double pricePerSession) { this.pricePerSession = pricePerSession; }

    public int getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(int yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public List<String> getSpecialties() { return specialties; }
    public void setSpecialties(List<String> specialties) { this.specialties = specialties; }

    public List<String> getEducation() { return education; }
    public void setEducation(List<String> education) { this.education = education; }

    public List<WorkDaySchedule> getWorkSchedule() { return workSchedule; }
    public void setWorkSchedule(List<WorkDaySchedule> workSchedule) { this.workSchedule = workSchedule; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // =========================================================================
    // STATIC NESTED EMBEDDABLE CLASS FOR REGISTRATION SHIFTS
    // =========================================================================
    @Embeddable
    public static class WorkDaySchedule {
        private String dayOfWeek;
        private String startTime;
        private String endTime;

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }
}