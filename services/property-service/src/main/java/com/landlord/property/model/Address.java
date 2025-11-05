package com.landlord.property.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Column(name = "street_address", nullable = false, length = 255)
    private String streetAddress;

    @Column(name = "street_address_2", length = 255)
    private String streetAddress2;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 50)
    private String state;

    @Column(name = "zip_code", nullable = false, length = 20)
    private String zipCode;

    @Column(name = "country", nullable = false, length = 50)
    private String country = "United States";

    @Column(name = "county", length = 100)
    private String county;

    @Column(name = "timezone", length = 50)
    private String timezone;

    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(streetAddress);
        if (streetAddress2 != null && !streetAddress2.trim().isEmpty()) {
            sb.append(", ").append(streetAddress2);
        }
        sb.append(", ").append(city);
        sb.append(", ").append(state);
        sb.append(" ").append(zipCode);
        sb.append(", ").append(country);
        return sb.toString();
    }

    public String getCityStateZip() {
        return city + ", " + state + " " + zipCode;
    }
}