package com.landlord.property.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "properties", indexes = {
    @Index(name = "idx_properties_owner_id", columnList = "owner_id"),
    @Index(name = "idx_properties_status", columnList = "status"),
    @Index(name = "idx_properties_type", columnList = "property_type"),
    @Index(name = "idx_properties_city", columnList = "city"),
    @Index(name = "idx_properties_zip_code", columnList = "zip_code"),
    @Index(name = "idx_properties_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
public class Property extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PropertyStatus status;

    @Embedded
    private Address address;

    @Embedded
    private PropertyDetails details;

    @Column(name = "listing_price", precision = 12, scale = 2)
    private BigDecimal listingPrice;

    @Column(name = "monthly_rent", precision = 12, scale = 2)
    private BigDecimal monthlyRent;

    @Column(name = "security_deposit", precision = 12, scale = 2)
    private BigDecimal securityDeposit;

    @Column(name = "pet_deposit", precision = 12, scale = 2)
    private BigDecimal petDeposit;

    @Column(name = "utilities_included")
    private Boolean utilitiesIncluded;

    @Column(name = "pet_friendly")
    private Boolean petFriendly;

    @Column(name = "furnished")
    private Boolean furnished;

    @Column(name = "parking_available")
    private Boolean parkingAvailable;

    @Column(name = "smoke_free")
    private Boolean smokeFree;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "lease_min_months")
    private Integer leaseMinMonths;

    @Column(name = "lease_max_months")
    private Integer leaseMaxMonths;

    @Column(name = "background_check_required")
    private Boolean backgroundCheckRequired;

    @Column(name = "credit_score_minimum")
    private Integer creditScoreMinimum;

    @Column(name = "income_multiple")
    private BigDecimal incomeMultiple;

    @Column(name = "application_fee", precision = 8, scale = 2)
    private BigDecimal applicationFee;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "inquiry_count", nullable = false)
    private Integer inquiryCount = 0;

    @Column(name = "favorite_count", nullable = false)
    private Integer favoriteCount = 0;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "featured_until")
    private LocalDateTime featuredUntil;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "google_maps_url", length = 1000)
    private String googleMapsUrl;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "meta_data", columnDefinition = "jsonb")
    private String metaData; // JSONB for flexible metadata

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PropertyType {
        APARTMENT,
        HOUSE,
        CONDO,
        TOWNHOUSE,
        STUDIO,
        DUPLEX,
        TRIPLEX,
        FOURPLEX,
        COMMERCIAL,
        OFFICE_SPACE,
        RETAIL_SPACE,
        WAREHOUSE,
        MIXED_USE
    }

    public enum PropertyStatus {
        DRAFT,
        PUBLISHED,
        RENTED,
        MAINTENANCE,
        UNDER_REVIEW,
        ARCHIVED
    }
}