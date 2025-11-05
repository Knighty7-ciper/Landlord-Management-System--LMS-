package com.landlord.property.mapper;

import com.landlord.property.dto.PropertyImageUploadDto;
import com.landlord.property.dto.PropertyResponseDto.PropertyImageDto;
import com.landlord.property.model.PropertyImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PropertyImageMapper {

    PropertyImageMapper INSTANCE = Mappers.getMapper(PropertyImageMapper.class);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "propertyId", source = "propertyId"),
        @Mapping(target = "unitId", source = "unitId"),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "createdBy", ignore = true),
        @Mapping(target = "updatedBy", ignore = true),
        @Mapping(target = "deletedAt", ignore = true),
        @Mapping(target = "deletedBy", ignore = true),
        @Mapping(target = "version", ignore = true)
    })
    PropertyImage uploadDtoToEntity(PropertyImageUploadDto dto, String propertyId, String unitId);

    @Mappings({
        @Mapping(target = "id", source = "id"),
        @Mapping(target = "imageUrl", source = "imageUrl"),
        @Mapping(target = "thumbnailUrl", source = "thumbnailUrl"),
        @Mapping(target = "altText", source = "altText"),
        @Mapping(target = "description", source = "description"),
        @Mapping(target = "imageType", source = "imageType"),
        @Mapping(target = "displayOrder", source = "displayOrder"),
        @Mapping(target = "isPrimary", source = "isPrimary"),
        @Mapping(target = "isFeatured", source = "isFeatured"),
        @Mapping(target = "is360Degree", source = "is360Degree"),
        @Mapping(target = "roomType", source = "roomType"),
        @Mapping(target = "fileSizeBytes", source = "fileSizeBytes"),
        @Mapping(target = "widthPixels", source = "widthPixels"),
        @Mapping(target = "heightPixels", source = "heightPixels"),
        @Mapping(target = "format", source = "format")
    })
    PropertyImageDto entityToDto(PropertyImage entity);

    List<PropertyImageDto> entitiesToDtos(List<PropertyImage> entities);

    // JSON mapping for metadata
    default String mapMetadata(java.util.Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        try {
            // In production, use ObjectMapper to convert to JSON string
            return metadata.toString();
        } catch (Exception e) {
            return null;
        }
    }

    default java.util.Map<String, Object> mapMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.trim().isEmpty()) {
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