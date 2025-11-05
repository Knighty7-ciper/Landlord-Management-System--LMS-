package com.landlord.property.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDetailsDto {

    @DecimalMin(value = "0.0", message = "Total square footage must be positive")
    @DecimalMax(value = "999999.99", message = "Total square footage is too large")
    private BigDecimal totalSqft;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    @Max(value = 20, message = "Too many bedrooms")
    private Integer bedrooms;

    @DecimalMin(value = "0.0", message = "Bathrooms cannot be negative")
    @DecimalMax(value = "20.0", message = "Too many bathrooms")
    private BigDecimal bathrooms;

    @DecimalMin(value = "0.0", message = "Half bathrooms cannot be negative")
    @DecimalMax(value = "10.0", message = "Too many half bathrooms")
    private BigDecimal halfBathrooms;

    @Size(max = 50, message = "Kitchen type must not exceed 50 characters")
    private String kitchenType;

    @Size(max = 100, message = "Living room size must not exceed 100 characters")
    private String livingRoomSize;

    @Size(max = 100, message = "Dining room size must not exceed 100 characters")
    private String diningRoomSize;

    @Size(max = 500, message = "Bedroom sizes must not exceed 500 characters")
    private String bedroomSizes;

    private Boolean walkInClosets;
    private Boolean builtInStorage;

    @Size(max = 50, message = "Ceiling height must not exceed 50 characters")
    private String ceilingHeight;

    @Size(max = 50, message = "Natural light must not exceed 50 characters")
    private String naturalLight;

    @Size(max = 200, message = "Window orientation must not exceed 200 characters")
    private String windowOrientation;

    @Size(max = 200, message = "Flooring types must not exceed 200 characters")
    private String flooringTypes;

    @Size(max = 1000, message = "Appliances included must not exceed 1000 characters")
    private String appliancesIncluded;

    @Size(max = 100, message = "Outdoor space must not exceed 100 characters")
    private String outdoorSpace;

    @Size(max = 100, message = "Outdoor space size must not exceed 100 characters")
    private String outdoorSpaceSize;

    @Size(max = 10, message = "Energy efficiency rating must not exceed 10 characters")
    private String energyEfficiencyRating;

    @Size(max = 100, message = "Heating type must not exceed 100 characters")
    private String heatingType;

    @Size(max = 100, message = "Cooling type must not exceed 100 characters")
    private String coolingType;

    private Boolean airConditioning;

    @Min(value = 0, message = "Heating system age cannot be negative")
    @Max(value = 100, message = "Heating system age is too large")
    private Integer heatingSystemAge;

    @Min(value = 0, message = "Cooling system age cannot be negative")
    @Max(value = 100, message = "Cooling system age is too large")
    private Integer coolingSystemAge;

    @Min(value = 0, message = "Roof age cannot be negative")
    @Max(value = 200, message = "Roof age is too large")
    private Integer roofAge;

    @Min(value = 0, message = "Foundation age cannot be negative")
    @Max(value = 200, message = "Foundation age is too large")
    private Integer foundationAge;

    @Size(max = 100, message = "Pest control frequency must not exceed 100 characters")
    private String pestControlFrequency;

    @Min(value = 0, message = "Fireplace count cannot be negative")
    @Max(value = 10, message = "Too many fireplaces")
    private Integer fireplaceCount;

    @Size(max = 50, message = "Fireplace type must not exceed 50 characters")
    private String fireplaceType;

    @Min(value = 0, message = "Garage spaces cannot be negative")
    @Max(value = 20, message = "Too many garage spaces")
    private Integer garageSpaces;

    @Min(value = 0, message = "Covered parking spaces cannot be negative")
    @Max(value = 20, message = "Too many covered parking spaces")
    private Integer coveredParkingSpaces;

    @Min(value = 0, message = "Guest parking spaces cannot be negative")
    @Max(value = 20, message = "Too many guest parking spaces")
    private Integer guestParkingSpaces;

    @Size(max = 500, message = "Storage areas must not exceed 500 characters")
    private String storageAreas;

    private Boolean elevatorBuilding;

    @Min(value = 1800, message = "Year built must be after 1800")
    @Max(value = 2030, message = "Year built cannot be in the future")
    private Integer yearBuilt;

    @Min(value = 1800, message = "Last renovation year must be after 1800")
    @Max(value = 2030, message = "Last renovation year cannot be in the future")
    private Integer lastRenovationYear;

    @DecimalMin(value = "0.0", message = "HOA fees must be positive")
    @DecimalMax(value = "999999.99", message = "HOA fees are too high")
    private BigDecimal hoaFees;

    @Size(max = 500, message = "HOA amenities must not exceed 500 characters")
    private String hoaAmenities;

    @Size(max = 500, message = "Pet restrictions must not exceed 500 characters")
    private String petRestrictions;

    @Size(max = 200, message = "Smoking policy must not exceed 200 characters")
    private String smokingPolicy;

    @Size(max = 200, message = "Guest policy must not exceed 200 characters")
    private String guestPolicy;

    @Size(max = 200, message = "Noise policy must not exceed 200 characters")
    private String noisePolicy;

    @Size(max = 50, message = "Noise level must not exceed 50 characters")
    private String noiseLevel;

    @Size(max = 100, message = "Maintenance responsibility must not exceed 100 characters")
    private String maintenanceResponsibility;

    @Size(max = 100, message = "Utilities responsibility must not exceed 100 characters")
    private String utilitiesResponsibility;
}