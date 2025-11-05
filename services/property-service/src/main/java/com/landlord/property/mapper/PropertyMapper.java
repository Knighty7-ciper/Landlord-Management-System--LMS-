package com.landlord.property.mapper;

import com.landlord.property.dto.*;
import com.landlord.property.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PropertyMapper {

    PropertyMapper INSTANCE = Mappers.getMapper(PropertyMapper.class);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "ownerId", source = "ownerId"),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "createdBy", ignore = true),
        @Mapping(target = "updatedBy", ignore = true),
        @Mapping(target = "deletedAt", ignore = true),
        @Mapping(target = "deletedBy", ignore = true),
        @Mapping(target = "version", ignore = true),
        @Mapping(target = "viewCount", ignore = true),
        @Mapping(target = "inquiryCount", ignore = true),
        @Mapping(target = "favoriteCount", ignore = true)
    })
    Property createDtoToEntity(PropertyCreateDto dto, String ownerId);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "ownerId", ignore = true),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "createdBy", ignore = true),
        @Mapping(target = "updatedBy", ignore = true),
        @Mapping(target = "deletedAt", ignore = true),
        @Mapping(target = "deletedBy", ignore = true),
        @Mapping(target = "version", ignore = true),
        @Mapping(target = "viewCount", ignore = true),
        @Mapping(target = "inquiryCount", ignore = true),
        @Mapping(target = "favoriteCount", ignore = true)
    })
    Property updateDtoToEntity(PropertyUpdateDto dto);

    @Mappings({
        @Mapping(target = "id", source = "id"),
        @Mapping(target = "ownerId", source = "ownerId"),
        @Mapping(target = "name", source = "name"),
        @Mapping(target = "description", source = "description"),
        @Mapping(target = "propertyType", source = "propertyType"),
        @Mapping(target = "status", source = "status"),
        @Mapping(target = "address", source = "address"),
        @Mapping(target = "details", source = "details"),
        @Mapping(target = "listingPrice", source = "listingPrice"),
        @Mapping(target = "monthlyRent", source = "monthlyRent"),
        @Mapping(target = "securityDeposit", source = "securityDeposit"),
        @Mapping(target = "petDeposit", source = "petDeposit"),
        @Mapping(target = "utilitiesIncluded", source = "utilitiesIncluded"),
        @Mapping(target = "petFriendly", source = "petFriendly"),
        @Mapping(target = "furnished", source = "furnished"),
        @Mapping(target = "parkingAvailable", source = "parkingAvailable"),
        @Mapping(target = "smokeFree", source = "smokeFree"),
        @Mapping(target = "availableFrom", source = "availableFrom"),
        @Mapping(target = "leaseMinMonths", source = "leaseMinMonths"),
        @Mapping(target = "leaseMaxMonths", source = "leaseMaxMonths"),
        @Mapping(target = "backgroundCheckRequired", source = "backgroundCheckRequired"),
        @Mapping(target = "creditScoreMinimum", source = "creditScoreMinimum"),
        @Mapping(target = "incomeMultiple", source = "incomeMultiple"),
        @Mapping(target = "applicationFee", source = "applicationFee"),
        @Mapping(target = "viewCount", source = "viewCount"),
        @Mapping(target = "inquiryCount", source = "inquiryCount"),
        @Mapping(target = "favoriteCount", source = "favoriteCount"),
        @Mapping(target = "isFeatured", source = "isFeatured"),
        @Mapping(target = "featuredUntil", source = "featuredUntil"),
        @Mapping(target = "latitude", source = "latitude"),
        @Mapping(target = "longitude", source = "longitude"),
        @Mapping(target = "googleMapsUrl", source = "googleMapsUrl"),
        @Mapping(target = "isAvailable", source = "isAvailable"),
        @Mapping(target = "metaData", source = "metaData"),
        @Mapping(target = "notes", source = "notes"),
        @Mapping(target = "createdAt", source = "createdAt"),
        @Mapping(target = "updatedAt", source = "updatedAt")
    })
    PropertyResponseDto entityToResponseDto(Property entity);

    List<PropertyResponseDto> entitiesToResponseDtos(List<Property> entities);

    // Address mapping
    Address addressDtoToEntity(AddressDto dto);
    AddressDto addressEntityToDto(Address entity);

    // Property details mapping
    PropertyDetails propertyDetailsDtoToEntity(PropertyDetailsDto dto);
    PropertyDetailsDto propertyDetailsEntityToDto(PropertyDetails entity);

    // MetaData mapping (JSON as String)
    default String mapMetaData(Map<String, Object> metaData) {
        if (metaData == null || metaData.isEmpty()) {
            return null;
        }
        try {
            // In production, use ObjectMapper to convert to JSON string
            return metaData.toString();
        } catch (Exception e) {
            return null;
        }
    }

    default Map<String, Object> mapMetaData(String metaDataJson) {
        if (metaDataJson == null || metaDataJson.trim().isEmpty()) {
            return new java.util.HashMap<>();
        }
        try {
            // In production, use ObjectMapper to parse JSON string
            return new java.util.HashMap<>();
        } catch (Exception e) {
            return new java.util.HashMap<>();
        }
    }
}