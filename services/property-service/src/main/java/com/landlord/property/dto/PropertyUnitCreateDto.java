package com.landlord.property.dto;

import com.landlord.property.model.PropertyUnit;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyUnitCreateDto {

    @NotBlank(message = "Unit number is required")
    @Size(max = 20, message = "Unit number must not exceed 20 characters")
    private String unitNumber;

    @Min(value = 0, message = "Floor number cannot be negative")
    @Max(value = 200, message = "Floor number is too high")
    private Integer floorNumber;

    @Size(max = 50, message = "Building section must not exceed 50 characters")
    private String buildingSection;

    @DecimalMin(value = "0.0", message = "Square footage must be positive")
    @DecimalMax(value = "99999.99", message = "Square footage is too large")
    private BigDecimal sqft;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    @Max(value = 20, message = "Too many bedrooms")
    private Integer bedrooms;

    @DecimalMin(value = "0.0", message = "Bathrooms cannot be negative")
    @DecimalMax(value = "20.0", message = "Too many bathrooms")
    private BigDecimal bathrooms;

    @DecimalMin(value = "0.0", message = "Half bathrooms cannot be negative")
    @DecimalMax(value = "10.0", message = "Too many half bathrooms")
    private BigDecimal halfBathrooms;

    @NotNull(message = "Monthly rent is required")
    @DecimalMin(value = "0.0", message = "Monthly rent must be positive")
    @DecimalMax(value = "99999.99", message = "Monthly rent is too high")
    private BigDecimal monthlyRent;

    @DecimalMin(value = "0.0", message = "Security deposit must be positive")
    @DecimalMax(value = "99999.99", message = "Security deposit is too high")
    private BigDecimal securityDeposit;

    @DecimalMin(value = "0.0", message = "Pet deposit must be positive")
    @DecimalMax(value = "9999.99", message = "Pet deposit is too high")
    private BigDecimal petDeposit;

    private Boolean utilitiesIncluded = false;
    private Boolean petFriendly = false;
    private Boolean furnished = false;
    private Boolean parkingAssigned = false;
    private Boolean storageAssigned = false;
    private Boolean balcony = false;
    private Boolean terrace = false;
    private Boolean gardenAccess = false;

    @Size(max = 100, message = "View type must not exceed 100 characters")
    private String viewType;

    @Size(max = 200, message = "Window orientation must not exceed 200 characters")
    private String windowOrientation;

    @Size(max = 1000, message = "Appliances included must not exceed 1000 characters")
    private String appliancesIncluded;

    @Size(max = 1000, message = "Special features must not exceed 1000 characters")
    private String specialFeatures;

    @Size(max = 1000, message = "Accessibility features must not exceed 1000 characters")
    private String accessibilityFeatures;

    @Future(message = "Available from date must be in the future")
    private LocalDateTime availableFrom;

    @Min(value = 1, message = "Minimum lease months must be at least 1")
    @Max(value = 60, message = "Maximum lease months cannot exceed 60")
    private Integer minimumLeaseMonths = 12;

    @Min(value = 1, message = "Maximum lease months must be at least 1")
    @Max(value = 60, message = "Maximum lease months cannot exceed 60")
    private Integer maximumLeaseMonths = 12;

    private Boolean backgroundCheckRequired = true;

    @Min(value = 300, message = "Minimum credit score cannot be less than 300")
    @Max(value = 850, message = "Maximum credit score cannot exceed 850")
    private Integer creditScoreMinimum = 650;

    @DecimalMin(value = "1.0", message = "Income multiple must be at least 1.0")
    @DecimalMax(value = "10.0", message = "Income multiple cannot exceed 10.0")
    private BigDecimal incomeMultipleRequired = BigDecimal.valueOf(3.0);

    @DecimalMin(value = "0.0", message = "Application fee must be positive")
    @DecimalMax(value = "9999.99", message = "Application fee is too high")
    private BigDecimal applicationFee;

    @DecimalMin(value = "0.0", message = "Hold deposit must be positive")
    @DecimalMax(value = "9999.99", message = "Hold deposit is too high")
    private BigDecimal holdDeposit;

    private Boolean isAvailable = true;
    private Boolean isPremium = false;

    @Future(message = "Premium until date must be in the future")
    private LocalDateTime premiumUntil;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Size(max = 1000, message = "Lease terms must not exceed 1000 characters")
    private String leaseTerms;

    @Size(max = 1000, message = "Restrictions must not exceed 1000 characters")
    private String restrictions;

    @NotNull(message = "Unit status is required")
    private PropertyUnit.UnitStatus status = PropertyUnit.UnitStatus.AVAILABLE;

    // Image upload metadata
    private List<String> imageCategories;
    private List<PropertyImageUploadDto> images;
}