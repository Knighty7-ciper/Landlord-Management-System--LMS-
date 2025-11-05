package com.landlord.property.dto;

import com.landlord.property.model.Property;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyUpdateDto {

    @Size(max = 255, message = "Property name must not exceed 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private Property.PropertyType propertyType;
    private Property.PropertyStatus status;

    @Valid
    private AddressDto address;

    @Valid
    private PropertyDetailsDto details;

    @DecimalMin(value = "0.0", message = "Listing price must be positive")
    @DecimalMax(value = "999999999.99", message = "Listing price is too high")
    private BigDecimal listingPrice;

    @DecimalMin(value = "0.0", message = "Monthly rent must be positive")
    @DecimalMax(value = "999999.99", message = "Monthly rent is too high")
    private BigDecimal monthlyRent;

    @DecimalMin(value = "0.0", message = "Security deposit must be positive")
    @DecimalMax(value = "999999.99", message = "Security deposit is too high")
    private BigDecimal securityDeposit;

    @DecimalMin(value = "0.0", message = "Pet deposit must be positive")
    @DecimalMax(value = "99999.99", message = "Pet deposit is too high")
    private BigDecimal petDeposit;

    private Boolean utilitiesIncluded;
    private Boolean petFriendly;
    private Boolean furnished;
    private Boolean parkingAvailable;
    private Boolean smokeFree;

    @Future(message = "Available from date must be in the future")
    private LocalDateTime availableFrom;

    @Min(value = 1, message = "Minimum lease months must be at least 1")
    @Max(value = 60, message = "Maximum lease months cannot exceed 60")
    private Integer leaseMinMonths;

    @Min(value = 1, message = "Maximum lease months must be at least 1")
    @Max(value = 60, message = "Maximum lease months cannot exceed 60")
    private Integer leaseMaxMonths;

    private Boolean backgroundCheckRequired;

    @Min(value = 300, message = "Minimum credit score cannot be less than 300")
    @Max(value = 850, message = "Maximum credit score cannot exceed 850")
    private Integer creditScoreMinimum;

    @DecimalMin(value = "1.0", message = "Income multiple must be at least 1.0")
    @DecimalMax(value = "10.0", message = "Income multiple cannot exceed 10.0")
    private BigDecimal incomeMultiple;

    @DecimalMin(value = "0.0", message = "Application fee must be positive")
    @DecimalMax(value = "9999.99", message = "Application fee is too high")
    private BigDecimal applicationFee;

    private Boolean isFeatured;

    @Future(message = "Featured until date must be in the future")
    private LocalDateTime featuredUntil;

    private Double latitude;
    private Double longitude;

    @Size(max = 1000, message = "Google Maps URL must not exceed 1000 characters")
    private String googleMapsUrl;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    // JSON metadata as Map for flexibility
    private Map<String, Object> metaData;

    // Increment view counter
    private Boolean incrementViewCount = false;

    // Increment inquiry counter
    private Boolean incrementInquiryCount = false;

    // Increment favorite counter
    private Boolean incrementFavoriteCount = false;

    // Decrement counters
    private Boolean decrementViewCount = false;
    private Boolean decrementInquiryCount = false;
    private Boolean decrementFavoriteCount = false;
}