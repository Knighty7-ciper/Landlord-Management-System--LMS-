package com.landlord.property.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "property_images", indexes = {
    @Index(name = "idx_property_images_property_id", columnList = "property_id"),
    @Index(name = "idx_property_images_unit_id", columnList = "unit_id"),
    @Index(name = "idx_property_images_display_order", columnList = "display_order")
})
public class PropertyImage extends BaseEntity {

    @Column(name = "property_id", nullable = false)
    private String propertyId;

    @Column(name = "unit_id")
    private String unitId;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "image_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ImageType imageType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "width_pixels")
    private Integer widthPixels;

    @Column(name = "height_pixels")
    private Integer heightPixels;

    @Column(name = "format", length = 20)
    private String format; // jpg, png, webp, etc.

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "is_360_degree")
    private Boolean is360Degree = false;

    @Column(name = "room_type", length = 100)
    private String roomType; // living_room, bedroom, kitchen, bathroom, exterior, etc.

    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata; // Additional image metadata

    public enum ImageType {
        EXTERIOR,
        INTERIOR,
        FLOOR_PLAN,
        360_VIEW,
        VIDEO_SNAPSHOT,
        MAP_SCREENSHOT,
        THIRD_PARTY,
        OTHER
    }
}