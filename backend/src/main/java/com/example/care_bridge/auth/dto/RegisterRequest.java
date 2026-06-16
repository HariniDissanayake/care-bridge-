package com.example.care_bridge.auth.dto;

import com.example.care_bridge.user.entity.TherapistProfile;
import lombok.Data;

import com.example.care_bridge.user.entity.Role;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private Role role;
    private TherapistProfile therapistProfile;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
    public TherapistProfile getTherapistProfile() { return therapistProfile; }
    public void setTherapistProfile(TherapistProfile therapistProfile) { this.therapistProfile = therapistProfile; }
}



