package com.example.care_bridge.model;


import com.example.care_bridge.user.entity.TherapistProfile;
import java.util.List;

public class TherapistDTO {

    private Long id;
    // From User entity
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    // From TherapistProfile entity
    private String title;
    private String specialization;
    private String bio;
    private String location;
    private String languages;
    private double rating;
    private String imageUrl;
    private String consultationType;
    private String contactMethod;
    private boolean isVerified;
    private double pricePerSession;
    private int yearsOfExperience;
    private List<String> specialties;
    private List<String> education;
    private List<TherapistProfile.WorkDaySchedule> workSchedule;

    // Static factory — builds DTO from TherapistProfile + its linked User
    public static TherapistDTO from(TherapistProfile p) {
        TherapistDTO dto = new TherapistDTO();
        dto.id               = p.getId();
        // Pull name from the linked User
        dto.firstName        = p.getUser() != null ? p.getUser().getFirstName() : "";
        dto.lastName         = p.getUser() != null ? p.getUser().getLastName()  : "";
        dto.email            = p.getUser() != null ? p.getUser().getEmail()      : "";
        dto.phone            = p.getUser() != null ? p.getUser().getPhone()      : "";
        dto.title            = p.getTitle();
        dto.specialization   = p.getSpecialization();
        dto.bio              = p.getBio();
        dto.location         = p.getLocation();
        dto.languages        = p.getLanguages();
        dto.rating           = p.getRating();
        dto.imageUrl         = p.getImageUrl();
        dto.consultationType = p.getConsultationType();
        dto.contactMethod    = p.getContactMethod();
        dto.isVerified       = p.isVerified();
        dto.pricePerSession  = p.getPricePerSession();
        dto.yearsOfExperience= p.getYearsOfExperience();
        dto.specialties      = p.getSpecialties();
        dto.education        = p.getEducation();
        dto.workSchedule     = p.getWorkSchedule();
        return dto;
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    public Long getId()                  { return id; }
    public String getFirstName()         { return firstName; }
    public String getLastName()          { return lastName; }
    public String getEmail()             { return email; }
    public String getPhone()             { return phone; }
    public String getTitle()             { return title; }
    public String getSpecialization()    { return specialization; }
    public String getBio()               { return bio; }
    public String getLocation()          { return location; }
    public String getLanguages()         { return languages; }
    public double getRating()            { return rating; }
    public String getImageUrl()          { return imageUrl; }
    public String getConsultationType()  { return consultationType; }
    public String getContactMethod()     { return contactMethod; }
    public boolean isVerified()          { return isVerified; }
    public double getPricePerSession()   { return pricePerSession; }
    public int getYearsOfExperience()    { return yearsOfExperience; }
    public List<String> getSpecialties() { return specialties; }
    public List<String> getEducation()   { return education; }
    public List<TherapistProfile.WorkDaySchedule> getWorkSchedule() { return workSchedule; }
}