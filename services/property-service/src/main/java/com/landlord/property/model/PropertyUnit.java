package com.landlord.property.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "property_units", indexes = {
    @Index(name = "idx_property_units_property_id", columnList = "property_id"),
    @Index(name = "idx_property_units_unit_number", columnList = "unit_number"),
    @Index(name = "idx_property_units_status", columnList = "status")
})
public class PropertyUnit extends BaseEntity {

    @Column(name = "property_id", nullable = false)
    private String propertyId;

    @Column(name = "unit_number", nullable = false, length = 20)
    private String unitNumber;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "building_section", length = 50)
    private String buildingSection;

    @Column(name = "sqft")
    private BigDecimal sqft;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private BigDecimal bathrooms;

    @Column(name = "half_bathrooms")
    private BigDecimal halfBathrooms;

    @Column(name = "monthly_rent", precision = 10, scale = 2)
    private BigDecimal monthlyRent;

    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    @Column(name = "pet_deposit", precision = 10, scale = 2)
    private BigDecimal petDeposit;

    @Column(name = "utilities_included")
    private Boolean utilitiesIncluded;

    @Column(name = "pet_friendly")
    private Boolean petFriendly;

    @Column(name = "furnished")
    private Boolean furnished;

    @Column(name = "parking_assigned")
    private Boolean parkingAssigned;

    @Column(name = "storage_assigned")
    private Boolean storageAssigned;

    @Column(name = "balcony")
    private Boolean balcony;

    @Column(name = "terrace")
    private Boolean terrace;

    @Column(name = "garden_access")
    private Boolean gardenAccess;

    @Column(name = "view_type", length = 100)
    private String viewType;

    @Column(name = "window_orientation", length = 200)
    private String windowOrientation;

    @Column(name = "appliances_included", columnDefinition = "jsonb")
    private String appliancesIncluded;

    @Column(name = "special_features", columnDefinition = "jsonb")
    private String specialFeatures;

    @Column(name = "accessibility_features", columnDefinition = "jsonb")
    private String accessibilityFeatures;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "minimum_lease_months")
    private Integer minimumLeaseMonths;

    @Column(name = "maximum_lease_months")
    private Integer maximumLeaseMonths;

    @Column(name = "background_check_required")
    private Boolean backgroundCheckRequired;

    @Column(name = "credit_score_minimum")
    private Integer creditScoreMinimum;

    @Column(name = "income_multiple_required")
    private BigDecimal incomeMultipleRequired;

    @Column(name = "application_fee", precision = 8, scale = 2)
    private BigDecimal applicationFee;

    @Column(name = "hold_deposit", precision = 8, scale = 2)
    private BigDecimal holdDeposit;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "is_premium", nullable = false)
    private Boolean isPremium = false;

    @Column(name = "premium_until")
    private LocalDateTime premiumUntil;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "lease_terms", columnDefinition = "jsonb")
    private String leaseTerms;

    @Column(name = "restrictions", columnDefinition = "jsonb")
    private String restrictions;

    public enum UnitStatus {
        AVAILABLE,
        RENTED,
        UNDER_CONTRACT,
        MAINTENANCE,
        MODEL_UNIT,
        RESERVED,
        INACTIVE
    }

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private UnitStatus status = UnitStatus.AVAILABLE;
}