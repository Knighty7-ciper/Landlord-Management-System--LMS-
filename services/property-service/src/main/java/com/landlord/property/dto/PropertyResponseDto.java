package com.landlord.property.dto;

import com.landlord.property.model.Property;
import com.landlord.property.model.PropertyImage;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponseDto {

    private String id;
    private String ownerId;
    private String name;
    private String description;
    private Property.PropertyType propertyType;
    private Property.PropertyStatus status;
    private AddressDto address;
    private PropertyDetailsDto details;
    private BigDecimal listingPrice;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private BigDecimal petDeposit;
    private Boolean utilitiesIncluded;
    private Boolean petFriendly;
    private Boolean furnished;
    private Boolean parkingAvailable;
    private Boolean smokeFree;
    private LocalDateTime availableFrom;
    private Integer leaseMinMonths;
    private Integer leaseMaxMonths;
    private Boolean backgroundCheckRequired;
    private Integer creditScoreMinimum;
    private BigDecimal incomeMultiple;
    private BigDecimal applicationFee;
    private Integer viewCount;
    private Integer inquiryCount;
    private Integer favoriteCount;
    private Boolean isFeatured;
    private LocalDateTime featuredUntil;
    private Double latitude;
    private Double longitude;
    private String googleMapsUrl;
    private Boolean isAvailable;
    private Map<String, Object> metaData;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private String fullAddress;
    private String cityStateZip;
    private List<String> imageUrls;
    private String primaryImageUrl;
    private List<PropertyImageDto> images;
    private List<PropertyUnitResponseDto> units;
    private Double occupancyRate;
    private BigDecimal totalMonthlyRevenue;
    private String addressDisplay;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PropertyImageDto {
        private String id;
        private String imageUrl;
        private String thumbnailUrl;
        private String altText;
        private String description;
        private PropertyImage.ImageType imageType;
        private Integer displayOrder;
        private Boolean isPrimary;
        private Boolean isFeatured;
        private Boolean is360Degree;
        private String roomType;
        private Long fileSizeBytes;
        private Integer widthPixels;
        private Integer heightPixels;
        private String format;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PropertyUnitResponseDto {
        private String id;
        private String propertyId;
        private String unitNumber;
        private Integer floorNumber;
        private String buildingSection;
        private BigDecimal sqft;
        private Integer bedrooms;
        private BigDecimal bathrooms;
        private BigDecimal halfBathrooms;
        private BigDecimal monthlyRent;
        private BigDecimal securityDeposit;
        private BigDecimal petDeposit;
        private Boolean utilitiesIncluded;
        private Boolean petFriendly;
        private Boolean furnished;
        private Boolean parkingAssigned;
        private Boolean storageAssigned;
        private Boolean balcony;
        private Boolean terrace;
        private Boolean gardenAccess;
        private String viewType;
        private String windowOrientation;
        private String appliancesIncluded;
        private String specialFeatures;
        private String accessibilityFeatures;
        private LocalDateTime availableFrom;
        private Integer minimumLeaseMonths;
        private Integer maximumLeaseMonths;
        private Boolean backgroundCheckRequired;
        private Integer creditScoreMinimum;
        private BigDecimal incomeMultipleRequired;
        private BigDecimal applicationFee;
        private BigDecimal holdDeposit;
        private Boolean isAvailable;
        private Boolean isPremium;
        private LocalDateTime premiumUntil;
        private String notes;
        private String leaseTerms;
        private String restrictions;
        private PropertyUnit.UnitStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Computed fields
        private String displayName;
        private List<String> imageUrls;
        private String primaryImageUrl;
        private List<PropertyImageDto> images;
    }

    public static PropertyResponseDto fromEntity(com.landlord.property.model.Property property) {
        return PropertyResponseDto.builder()
                .id(property.getId())
                .ownerId(property.getOwnerId())
                .name(property.getName())
                .description(property.getDescription())
                .propertyType(property.getPropertyType())
                .status(property.getStatus())
                .address(property.getAddress() != null ? AddressDto.fromAddress(property.getAddress()) : null)
                .details(property.getDetails() != null ? PropertyDetailsDto.fromDetails(property.getDetails()) : null)
                .listingPrice(property.getListingPrice())
                .monthlyRent(property.getMonthlyRent())
                .securityDeposit(property.getSecurityDeposit())
                .petDeposit(property.getPetDeposit())
                .utilitiesIncluded(property.getUtilitiesIncluded())
                .petFriendly(property.getPetFriendly())
                .furnished(property.getFurnished())
                .parkingAvailable(property.getParkingAvailable())
                .smokeFree(property.getSmokeFree())
                .availableFrom(property.getAvailableFrom())
                .leaseMinMonths(property.getLeaseMinMonths())
                .leaseMaxMonths(property.getLeaseMaxMonths())
                .backgroundCheckRequired(property.getBackgroundCheckRequired())
                .creditScoreMinimum(property.getCreditScoreMinimum())
                .incomeMultiple(property.getIncomeMultiple())
                .applicationFee(property.getApplicationFee())
                .viewCount(property.getViewCount())
                .inquiryCount(property.getInquiryCount())
                .favoriteCount(property.getFavoriteCount())
                .isFeatured(property.getIsFeatured())
                .featuredUntil(property.getFeaturedUntil())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .googleMapsUrl(property.getGoogleMapsUrl())
                .isAvailable(property.getIsAvailable())
                .metaData(parseMetaData(property.getMetaData()))
                .notes(property.getNotes())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    public static PropertyResponseDto fromEntityWithImages(com.landlord.property.model.Property property, 
                                                          List<com.landlord.property.model.PropertyImage> images,
                                                          List<PropertyUnitResponseDto> units,
                                                          Double occupancyRate,
                                                          BigDecimal totalMonthlyRevenue) {
        PropertyResponseDto dto = fromEntity(property);
        
        // Set computed fields
        if (property.getAddress() != null) {
            dto.setFullAddress(property.getAddress().getFullAddress());
            dto.setCityStateZip(property.getAddress().getCityStateZip());
            dto.setAddressDisplay(property.getAddress().getCity() + ", " + property.getAddress().getState());
        }
        
        // Set image information
        if (images != null && !images.isEmpty()) {
            dto.setImages(images.stream()
                    .map(PropertyImageDto::fromEntity)
                    .collect(Collectors.toList()));
            
            dto.setImageUrls(images.stream()
                    .map(com.landlord.property.model.PropertyImage::getImageUrl)
                    .collect(Collectors.toList()));
            
            // Set primary image
            dto.setPrimaryImageUrl(images.stream()
                    .filter(com.landlord.property.model.PropertyImage::getIsPrimary)
                    .map(com.landlord.property.model.PropertyImage::getImageUrl)
                    .findFirst()
                    .orElse(images.isEmpty() ? null : images.get(0).getImageUrl()));
        }
        
        // Set units
        dto.setUnits(units);
        
        // Set computed metrics
        dto.setOccupancyRate(occupancyRate);
        dto.setTotalMonthlyRevenue(totalMonthlyRevenue);
        
        return dto;
    }

    private static Map<String, Object> parseMetaData(String metaDataJson) {
        if (metaDataJson == null || metaDataJson.trim().isEmpty()) {
            return Map.of();
        }
        
        try {
            // Simple JSON parsing for metadata
            // In production, use a proper JSON library like Jackson
            return Map.of("raw", metaDataJson);
        } catch (Exception e) {
            return Map.of("raw", metaDataJson, "parseError", e.getMessage());
        }
    }
}