package com.landlord.property.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDetails {

    @Column(name = "total_sqft")
    private BigDecimal totalSqft;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private BigDecimal bathrooms;

    @Column(name = "half_bathrooms")
    private BigDecimal halfBathrooms;

    @Column(name = "kitchen_type", length = 50)
    private String kitchenType; // OPEN, GALLEY, U_SHAPED, L_SHAPED

    @Column(name = "living_room_size", length = 100)
    private String livingRoomSize;

    @Column(name = "dining_room_size", length = 100)
    private String diningRoomSize;

    @Column(name = "bedroom_sizes", length = 500)
    private String bedroomSizes; // JSON array or comma-separated

    @Column(name = "walk_in_closets")
    private Boolean walkInClosets;

    @Column(name = "built_in_storage")
    private Boolean builtInStorage;

    @Column(name = "ceiling_height", length = 50)
    private String ceilingHeight;

    @Column(name = "natural_light", length = 50)
    private String naturalLight; // EXCELLENT, GOOD, AVERAGE, POOR

    @Column(name = "window_orientation", length = 200)
    private String windowOrientation;

    @Column(name = "flooring_types", length = 200)
    private String flooringTypes; // HARDWOOD, CARPET, TILE, LAMINATE, VINYL

    @Column(name = "appliances_included")
    private String appliancesIncluded; // JSON array

    @Column(name = "outdoor_space", length = 100)
    private String outdoorSpace; // BALCONY, TERRACE, GARDEN, DECK, NONE

    @Column(name = "outdoor_space_size", length = 100)
    private String outdoorSpaceSize;

    @Column(name = "energy_efficiency_rating", length = 10)
    private String energyEfficiencyRating; // A, B, C, D, E, F, G

    @Column(name = "heating_type", length = 100)
    private String heatingType;

    @Column(name = "cooling_type", length = 100)
    private String coolingType;

    @Column(name = "air_conditioning")
    private Boolean airConditioning;

    @Column(name = "heating_system_age")
    private Integer heatingSystemAge;

    @Column(name = "cooling_system_age")
    private Integer coolingSystemAge;

    @Column(name = "roof_age")
    private Integer roofAge;

    @Column(name = "foundation_age")
    private Integer foundationAge;

    @Column(name = "pest_control_frequency", length = 100)
    private String pestControlFrequency;

    @Column(name = "fireplace_count")
    private Integer fireplaceCount;

    @Column(name = "fireplace_type", length = 50)
    private String fireplaceType;

    @Column(name = "garage_spaces")
    private Integer garageSpaces;

    @Column(name = "covered_parking_spaces")
    private Integer coveredParkingSpaces;

    @Column(name = "guest_parking_spaces")
    private Integer guestParkingSpaces;

    @Column(name = "storage_areas", length = 500)
    private String storageAreas; // JSON array or comma-separated

    @Column(name = "elevator_building")
    private Boolean elevatorBuilding;

    @Column(name = "building_year_built")
    private Integer yearBuilt;

    @Column(name = "last_renovation_year")
    private Integer lastRenovationYear;

    @Column(name = "hoa_fees", precision = 10, scale = 2)
    private BigDecimal hoaFees;

    @Column(name = "hoa_amenities", length = 500)
    private String hoaAmenities;

    @Column(name = "pet_restrictions", length = 500)
    private String petRestrictions;

    @Column(name = "smoking_policy", length = 200)
    private String smokingPolicy;

    @Column(name = "guest_policy", length = 200)
    private String guestPolicy;

    @Column(name = "noise_policy", length = 200)
    private String noisePolicy;

    @Column(name = "noise_level", length = 50)
    private String noiseLevel; // QUIET, MODERATE, BUSY

    @Column(name = "maintenance_responsibility", length = 100)
    private String maintenanceResponsibility;

    @Column(name = "utilities_responsibility", length = 100)
    private String utilitiesResponsibility;
}