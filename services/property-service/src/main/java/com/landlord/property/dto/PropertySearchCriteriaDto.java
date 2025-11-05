package com.landlord.property.dto;

import com.landlord.property.model.Property;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertySearchCriteriaDto {

    // Basic filters
    private String ownerId;
    private Property.PropertyStatus status;
    private Property.PropertyType propertyType;

    // Location filters
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 50, message = "State must not exceed 50 characters")
    private String state;
    
    @Size(max = 20, message = "Zip code must not exceed 20 characters")
    private String zipCode;
    
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;
    
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;
    
    @DecimalMin(value = "0.0", message = "Search radius must be positive")
    @DecimalMax(value = "1000.0", message = "Search radius cannot exceed 1000 miles")
    private Double radiusMiles;

    // Price filters
    @DecimalMin(value = "0.0", message = "Minimum rent must be positive")
    @DecimalMax(value = "999999.99", message = "Minimum rent is too high")
    private BigDecimal minRent;
    
    @DecimalMin(value = "0.0", message = "Maximum rent must be positive")
    @DecimalMax(value = "999999.99", message = "Maximum rent is too high")
    private BigDecimal maxRent;
    
    @DecimalMin(value = "0.0", message = "Minimum security deposit must be positive")
    @DecimalMax(value = "999999.99", message = "Minimum security deposit is too high")
    private BigDecimal minSecurityDeposit;
    
    @DecimalMin(value = "0.0", message = "Maximum security deposit must be positive")
    @DecimalMax(value = "999999.99", message = "Maximum security deposit is too high")
    private BigDecimal maxSecurityDeposit;

    // Property specifications
    @Min(value = 0, message = "Minimum bedrooms cannot be negative")
    @Max(value = 20, message = "Too many bedrooms")
    private Integer minBedrooms;
    
    @Min(value = 0, message = "Maximum bedrooms cannot be negative")
    @Max(value = 20, message = "Too many bedrooms")
    private Integer maxBedrooms;
    
    @DecimalMin(value = "0.0", message = "Minimum bathrooms cannot be negative")
    @DecimalMax(value = "20.0", message = "Too many bathrooms")
    private Double minBathrooms;
    
    @DecimalMin(value = "0.0", message = "Maximum bathrooms cannot be negative")
    @DecimalMax(value = "20.0", message = "Too many bathrooms")
    private Double maxBathrooms;
    
    @DecimalMin(value = "0.0", message = "Minimum square footage must be positive")
    @DecimalMax(value = "999999.99", message = "Minimum square footage is too large")
    private BigDecimal minSquareFootage;
    
    @DecimalMin(value = "0.0", message = "Maximum square footage must be positive")
    @DecimalMax(value = "999999.99", message = "Maximum square footage is too large")
    private BigDecimal maxSquareFootage;

    // Amenities and features
    private Boolean utilitiesIncluded;
    private Boolean petFriendly;
    private Boolean furnished;
    private Boolean parkingAvailable;
    private Boolean smokeFree;
    private Boolean isAvailable;
    private Boolean isFeatured;

    // Date filters
    private LocalDate availableFrom;
    private LocalDate availableTo;
    
    // Date range for created/updated
    private LocalDate createdFrom;
    private LocalDate createdTo;
    
    private LocalDate updatedFrom;
    private LocalDate updatedTo;

    // Credit and income requirements
    @Min(value = 300, message = "Minimum credit score cannot be less than 300")
    @Max(value = 850, message = "Maximum credit score cannot exceed 850")
    private Integer minCreditScore;
    
    @DecimalMin(value = "1.0", message = "Minimum income multiple must be at least 1.0")
    @DecimalMax(value = "10.0", message = "Maximum income multiple cannot exceed 10.0")
    private BigDecimal minIncomeMultiple;

    // Lease terms
    @Min(value = 1, message = "Minimum lease months must be at least 1")
    @Max(value = 60, message = "Maximum lease months cannot exceed 60")
    private Integer minLeaseMonths;
    
    @Min(value = 1, message = "Maximum lease months must be at least 1")
    @Max(value = 60, message = "Maximum lease months cannot exceed 60")
    private Integer maxLeaseMonths;

    // View and engagement filters
    @Min(value = 0, message = "Minimum view count cannot be negative")
    private Integer minViewCount;
    
    @Min(value = 0, message = "Maximum view count cannot be negative")
    private Integer maxViewCount;

    // Search text
    @Size(max = 255, message = "Search keyword must not exceed 255 characters")
    private String searchKeyword;

    // Tags
    private java.util.List<String> tags;

    // Advanced filters
    private Boolean hasImages;
    private Boolean has360Images;
    private Boolean hasVideos;
    
    // Financial filters
    private Boolean hasSecurityDeposit;
    private Boolean hasPetDeposit;
    private Boolean hasApplicationFee;
    
    // Building features
    private Boolean elevatorBuilding;
    private Boolean hasParking;
    private Boolean hasStorage;
    private Boolean hasOutdoorSpace;
    
    // HVAC
    private String heatingType;
    private String coolingType;
    private Boolean airConditioning;
    
    // Energy efficiency
    private String energyEfficiencyRating;
}