package com.landlord.property.mapper;

import com.landlord.property.dto.PropertyUnitCreateDto;
import com.landlord.property.dto.PropertyResponseDto.PropertyUnitResponseDto;
import com.landlord.property.model.PropertyUnit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PropertyUnitMapper {

    PropertyUnitMapper INSTANCE = Mappers.getMapper(PropertyUnitMapper.class);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "propertyId", source = "propertyId"),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "createdBy", ignore = true),
        @Mapping(target = "updatedBy", ignore = true),
        @Mapping(target = "deletedAt", ignore = true),
        @Mapping(target = "deletedBy", ignore = true),
        @Mapping(target = "version", ignore = true)
    })
    PropertyUnit createDtoToEntity(PropertyUnitCreateDto dto, String propertyId);

    @Mappings({
        @Mapping(target = "id", source = "id"),
        @Mapping(target = "propertyId", source = "propertyId"),
        @Mapping(target = "unitNumber", source = "unitNumber"),
        @Mapping(target = "floorNumber", source = "floorNumber"),
        @Mapping(target = "buildingSection", source = "buildingSection"),
        @Mapping(target = "sqft", source = "sqft"),
        @Mapping(target = "bedrooms", source = "bedrooms"),
        @Mapping(target = "bathrooms", source = "bathrooms"),
        @Mapping(target = "halfBathrooms", source = "halfBathrooms"),
        @Mapping(target = "monthlyRent", source = "monthlyRent"),
        @Mapping(target = "securityDeposit", source = "securityDeposit"),
        @Mapping(target = "petDeposit", source = "petDeposit"),
        @Mapping(target = "utilitiesIncluded", source = "utilitiesIncluded"),
        @Mapping(target = "petFriendly", source = "petFriendly"),
        @Mapping(target = "furnished", source = "furnished"),
        @Mapping(target = "parkingAssigned", source = "parkingAssigned"),
        @Mapping(target = "storageAssigned", source = "storageAssigned"),
        @Mapping(target = "balcony", source = "balcony"),
        @Mapping(target = "terrace", source = "terrace"),
        @Mapping(target = "gardenAccess", source = "gardenAccess"),
        @Mapping(target = "viewType", source = "viewType"),
        @Mapping(target = "windowOrientation", source = "windowOrientation"),
        @Mapping(target = "appliancesIncluded", source = "appliancesIncluded"),
        @Mapping(target = "specialFeatures", source = "specialFeatures"),
        @Mapping(target = "accessibilityFeatures", source = "accessibilityFeatures"),
        @Mapping(target = "availableFrom", source = "availableFrom"),
        @Mapping(target = "minimumLeaseMonths", source = "minimumLeaseMonths"),
        @Mapping(target = "maximumLeaseMonths", source = "maximumLeaseMonths"),
        @Mapping(target = "backgroundCheckRequired", source = "backgroundCheckRequired"),
        @Mapping(target = "creditScoreMinimum", source = "creditScoreMinimum"),
        @Mapping(target = "incomeMultipleRequired", source = "incomeMultipleRequired"),
        @Mapping(target = "applicationFee", source = "applicationFee"),
        @Mapping(target = "holdDeposit", source = "holdDeposit"),
        @Mapping(target = "isAvailable", source = "isAvailable"),
        @Mapping(target = "isPremium", source = "isPremium"),
        @Mapping(target = "premiumUntil", source = "premiumUntil"),
        @Mapping(target = "notes", source = "notes"),
        @Mapping(target = "leaseTerms", source = "leaseTerms"),
        @Mapping(target = "restrictions", source = "restrictions"),
        @Mapping(target = "status", source = "status"),
        @Mapping(target = "createdAt", source = "createdAt"),
        @Mapping(target = "updatedAt", source = "updatedAt")
    })
    PropertyUnitResponseDto entityToResponseDto(PropertyUnit entity);

    List<PropertyUnitResponseDto> entitiesToResponseDtos(List<PropertyUnit> entities);

    // JSON mapping methods
    default String mapAppliancesIncluded(List<String> appliances) {
        if (appliances == null || appliances.isEmpty()) {
            return null;
        }
        try {
            // In production, use ObjectMapper to convert to JSON string
            return String.join(", ", appliances);
        } catch (Exception e) {
            return null;
        }
    }

    default List<String> mapAppliancesIncluded(String appliancesJson) {
        if (appliancesJson == null || appliancesJson.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        try {
            // Split by comma for now, in production use proper JSON parsing
            String[] parts = appliancesJson.split(",");
            java.util.List<String> list = new java.util.ArrayList<>();
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    list.add(trimmed);
                }
            }
            return list;
        } catch (Exception e) {
            return new java.util.ArrayList<>();
        }
    }

    default String mapSpecialFeatures(List<String> features) {
        if (features == null || features.isEmpty()) {
            return null;
        }
        try {
            return String.join(", ", features);
        } catch (Exception e) {
            return null;
        }
    }

    default List<String> mapSpecialFeatures(String featuresJson) {
        if (featuresJson == null || featuresJson.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        try {
            String[] parts = featuresJson.split(",");
            java.util.List<String> list = new java.util.ArrayList<>();
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    list.add(trimmed);
                }
            }
            return list;
        } catch (Exception e) {
            return new java.util.ArrayList<>();
        }
    }
}