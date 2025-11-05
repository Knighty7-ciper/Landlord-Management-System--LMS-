package com.landlord.property.controller;

import com.landlord.property.dto.*;
import com.landlord.property.service.PropertyService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/properties")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PropertyController {

    private final PropertyService propertyService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // Property CRUD Operations

    /**
     * Create a new property
     */
    @PostMapping
    public ResponseEntity<PropertyResponseDto> createProperty(
            @Valid @RequestBody PropertyCreateDto createDto,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Creating property request for user: {}", userId);
        
        try {
            PropertyResponseDto property = propertyService.createProperty(createDto, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(property);
            
        } catch (Exception e) {
            log.error("Error creating property: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get property by ID
     */
    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyResponseDto> getProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.debug("Getting property: {} for user: {}", propertyId, userId);
        
        try {
            PropertyResponseDto property = propertyService.getProperty(propertyId, userId);
            return ResponseEntity.ok(property);
            
        } catch (Exception e) {
            log.error("Error getting property: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update property
     */
    @PutMapping("/{propertyId}")
    public ResponseEntity<PropertyResponseDto> updateProperty(
            @PathVariable String propertyId,
            @Valid @RequestBody PropertyUpdateDto updateDto,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Updating property: {} for user: {}", propertyId, userId);
        
        try {
            PropertyResponseDto property = propertyService.updateProperty(propertyId, userId, updateDto);
            return ResponseEntity.ok(property);
            
        } catch (Exception e) {
            log.error("Error updating property: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete property (soft delete)
     */
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable String propertyId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Deleting property: {} for user: {}", propertyId, userId);
        
        try {
            propertyService.deleteProperty(propertyId, userId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("Error deleting property: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    // Property Search and Listing

    /**
     * Search properties with filters
     */
    @GetMapping("/search")
    public ResponseEntity<Page<PropertyResponseDto>> searchProperties(
            @Valid PropertySearchCriteriaDto criteria,
            @Valid PaginationDto pagination) {
        
        log.debug("Searching properties with criteria: {}", criteria);
        
        try {
            Page<PropertyResponseDto> properties = propertyService.searchProperties(criteria, pagination);
            return ResponseEntity.ok(properties);
            
        } catch (Exception e) {
            log.error("Error searching properties: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get properties by owner
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Page<PropertyResponseDto>> getPropertiesByOwner(
            @PathVariable String ownerId,
            @Valid PaginationDto pagination) {
        
        log.debug("Getting properties for owner: {}", ownerId);
        
        try {
            Page<PropertyResponseDto> properties = propertyService.getPropertiesByOwner(ownerId, pagination);
            return ResponseEntity.ok(properties);
            
        } catch (Exception e) {
            log.error("Error getting properties by owner: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get properties for authenticated user
     */
    @GetMapping("/my-properties")
    public ResponseEntity<Page<PropertyResponseDto>> getMyProperties(
            @Valid PaginationDto pagination,
            @RequestHeader("X-User-ID") String userId) {
        
        log.debug("Getting properties for authenticated user: {}", userId);
        
        try {
            Page<PropertyResponseDto> properties = propertyService.getPropertiesByOwner(userId, pagination);
            return ResponseEntity.ok(properties);
            
        } catch (Exception e) {
            log.error("Error getting user properties: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Image Management

    /**
     * Upload property image
     */
    @PostMapping("/{propertyId}/images")
    public ResponseEntity<Map<String, String>> uploadPropertyImage(
            @PathVariable String propertyId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "INTERIOR") String imageType,
            @RequestParam(defaultValue = "false") Boolean isPrimary,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Uploading image for property: {} of type: {}", propertyId, imageType);
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            String imageUrl = propertyService.uploadPropertyImage(propertyId, userId, file, imageType, isPrimary);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
            
        } catch (Exception e) {
            log.error("Error uploading property image: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete property image
     */
    @DeleteMapping("/{propertyId}/images/{imageId}")
    public ResponseEntity<Void> deletePropertyImage(
            @PathVariable String propertyId,
            @PathVariable String imageId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Deleting image: {} for property: {}", imageId, propertyId);
        
        try {
            propertyService.deletePropertyImage(imageId, propertyId, userId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("Error deleting property image: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Upload multiple property images
     */
    @PostMapping("/{propertyId}/images/batch")
    public ResponseEntity<Map<String, Object>> uploadPropertyImagesBatch(
            @PathVariable String propertyId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(defaultValue = "INTERIOR") String imageType,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Uploading batch images for property: {}", propertyId);
        
        try {
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
            }
            
            Map<String, String> uploadedImages = new java.util.HashMap<>();
            
            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                if (!file.isEmpty()) {
                    String imageUrl = propertyService.uploadPropertyImage(propertyId, userId, file, imageType, false);
                    uploadedImages.put("image_" + i, imageUrl);
                }
            }
            
            return ResponseEntity.ok(Map.of("uploadedImages", uploadedImages));
            
        } catch (Exception e) {
            log.error("Error uploading batch images: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Unit Management

    /**
     * Create a unit for a property
     */
    @PostMapping("/{propertyId}/units")
    public ResponseEntity<PropertyResponseDto.PropertyUnitResponseDto> createUnit(
            @PathVariable String propertyId,
            @Valid @RequestBody PropertyUnitCreateDto unitDto,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Creating unit for property: {}", propertyId);
        
        try {
            PropertyResponseDto.PropertyUnitResponseDto unit = propertyService.createUnit(propertyId, userId, unitDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(unit);
            
        } catch (Exception e) {
            log.error("Error creating unit: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a unit
     */
    @PutMapping("/{propertyId}/units/{unitId}")
    public ResponseEntity<PropertyResponseDto.PropertyUnitResponseDto> updateUnit(
            @PathVariable String propertyId,
            @PathVariable String unitId,
            @Valid @RequestBody PropertyUnitCreateDto unitDto,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Updating unit: {} for property: {}", unitId, propertyId);
        
        try {
            PropertyResponseDto.PropertyUnitResponseDto unit = propertyService.updateUnit(unitId, propertyId, userId, unitDto);
            return ResponseEntity.ok(unit);
            
        } catch (Exception e) {
            log.error("Error updating unit: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get a unit
     */
    @GetMapping("/{propertyId}/units/{unitId}")
    public ResponseEntity<PropertyResponseDto.PropertyUnitResponseDto> getUnit(
            @PathVariable String propertyId,
            @PathVariable String unitId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.debug("Getting unit: {} for property: {}", unitId, propertyId);
        
        try {
            PropertyResponseDto.PropertyUnitResponseDto unit = propertyService.getUnit(unitId, propertyId, userId);
            return ResponseEntity.ok(unit);
            
        } catch (Exception e) {
            log.error("Error getting unit: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a unit
     */
    @DeleteMapping("/{propertyId}/units/{unitId}")
    public ResponseEntity<Void> deleteUnit(
            @PathVariable String propertyId,
            @PathVariable String unitId,
            @RequestHeader("X-User-ID") String userId) {
        
        log.info("Deleting unit: {} for property: {}", unitId, propertyId);
        
        try {
            propertyService.deleteUnit(unitId, propertyId, userId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("Error deleting unit: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all units for a property
     */
    @GetMapping("/{propertyId}/units")
    public ResponseEntity<Page<PropertyResponseDto.PropertyUnitResponseDto>> getPropertyUnits(
            @PathVariable String propertyId,
            @Valid PaginationDto pagination,
            @RequestHeader("X-User-ID") String userId) {
        
        log.debug("Getting units for property: {}", propertyId);
        
        try {
            // First verify the user owns the property
            propertyService.getProperty(propertyId, userId);
            
            // Get units - this is a simplified implementation
            // In a real implementation, you'd have a proper repository method
            PropertySearchCriteriaDto criteria = new PropertySearchCriteriaDto();
            criteria.setOwnerId(userId);
            
            Page<PropertyResponseDto> properties = propertyService.searchProperties(criteria, pagination);
            
            // For now, return empty page - this would be implemented with proper unit repository
            return ResponseEntity.ok(Page.empty());
            
        } catch (Exception e) {
            log.error("Error getting property units: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    // Analytics and Statistics

    /**
     * Get property statistics for owner
     */
    @GetMapping("/owner/{ownerId}/statistics")
    public ResponseEntity<Map<String, Object>> getPropertyStatistics(@PathVariable String ownerId) {
        
        log.debug("Getting property statistics for owner: {}", ownerId);
        
        try {
            Map<String, Object> statistics = propertyService.getPropertyStatistics(ownerId);
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("Error getting property statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get property statistics for authenticated user
     */
    @GetMapping("/my-statistics")
    public ResponseEntity<Map<String, Object>> getMyPropertyStatistics(@RequestHeader("X-User-ID") String userId) {
        
        log.debug("Getting property statistics for user: {}", userId);
        
        try {
            Map<String, Object> statistics = propertyService.getPropertyStatistics(userId);
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("Error getting user property statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Health Check

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Property Service"));
    }

    /**
     * Service information
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new java.util.HashMap<>();
        info.put("service", "Property Management Service");
        info.put("version", "1.0.0");
        info.put("description", "Manages properties, units, and related operations");
        info.put("endpoints", Map.of(
            "create-property", "POST /api/v1/properties",
            "get-property", "GET /api/v1/properties/{id}",
            "update-property", "PUT /api/v1/properties/{id}",
            "delete-property", "DELETE /api/v1/properties/{id}",
            "search-properties", "GET /api/v1/properties/search",
            "upload-image", "POST /api/v1/properties/{id}/images",
            "create-unit", "POST /api/v1/properties/{id}/units"
        ));
        
        return ResponseEntity.ok(info);
    }
}