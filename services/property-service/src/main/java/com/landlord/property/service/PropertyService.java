package com.landlord.property.service;

import com.landlord.property.dto.*;
import com.landlord.property.exception.*;
import com.landlord.property.mapper.PropertyImageMapper;
import com.landlord.property.mapper.PropertyMapper;
import com.landlord.property.mapper.PropertyUnitMapper;
import com.landlord.property.model.*;
import com.landlord.property.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyUnitRepository propertyUnitRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyMapper propertyMapper;
    private final PropertyUnitMapper propertyUnitMapper;
    private final PropertyImageMapper propertyImageMapper;
    private final FileUploadService fileUploadService;

    @Autowired
    public PropertyService(PropertyRepository propertyRepository,
                          PropertyUnitRepository propertyUnitRepository,
                          PropertyImageRepository propertyImageRepository,
                          PropertyMapper propertyMapper,
                          PropertyUnitMapper propertyUnitMapper,
                          PropertyImageMapper propertyImageMapper,
                          FileUploadService fileUploadService) {
        this.propertyRepository = propertyRepository;
        this.propertyUnitRepository = propertyUnitRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.propertyMapper = propertyMapper;
        this.propertyUnitMapper = propertyUnitMapper;
        this.propertyImageMapper = propertyImageMapper;
        this.fileUploadService = fileUploadService;
    }

    // Property CRUD Operations

    public PropertyResponseDto createProperty(PropertyCreateDto createDto, String ownerId) {
        log.info("Creating property for owner: {}", ownerId);
        
        try {
            Property property = propertyMapper.createDtoToEntity(createDto, ownerId);
            property.setViewCount(0);
            property.setInquiryCount(0);
            property.setFavoriteCount(0);
            
            // Set default metadata if not provided
            if (createDto.getMetaData() != null) {
                property.setMetaData(propertyMapper.mapMetaData(createDto.getMetaData()));
            }
            
            Property savedProperty = propertyRepository.save(property);
            log.info("Property created successfully with ID: {}", savedProperty.getId());
            
            // Create units if provided
            List<PropertyUnitResponseDto> createdUnits = new ArrayList<>();
            if (createDto.getUnits() != null && !createDto.getUnits().isEmpty()) {
                for (PropertyUnitCreateDto unitDto : createDto.getUnits()) {
                    PropertyUnitResponseDto unit = createUnitInternal(savedProperty.getId(), unitDto);
                    createdUnits.add(unit);
                }
            }
            
            // Upload images if provided
            if (createDto.getImages() != null && !createDto.getImages().isEmpty()) {
                uploadPropertyImages(savedProperty.getId(), null, createDto.getImages());
            }
            
            // Calculate occupancy rate and total revenue for response
            Double occupancyRate = calculateOccupancyRate(savedProperty.getId());
            BigDecimal totalRevenue = calculateTotalMonthlyRevenue(savedProperty.getId());
            
            return PropertyResponseDto.fromEntityWithImages(savedProperty, 
                Collections.emptyList(), createdUnits, occupancyRate, totalRevenue);
            
        } catch (Exception e) {
            log.error("Error creating property: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to create property: " + e.getMessage(), e);
        }
    }

    public PropertyResponseDto updateProperty(String propertyId, String ownerId, PropertyUpdateDto updateDto) {
        log.info("Updating property: {} for owner: {}", propertyId, ownerId);
        
        Property property = findPropertyByIdAndOwner(propertyId, ownerId);
        
        try {
            // Update properties
            Property updatedData = propertyMapper.updateDtoToEntity(updateDto);
            
            // Update fields if they are not null
            if (updateDto.getName() != null) property.setName(updateDto.getName());
            if (updateDto.getDescription() != null) property.setDescription(updateDto.getDescription());
            if (updateDto.getPropertyType() != null) property.setPropertyType(updateDto.getPropertyType());
            if (updateDto.getStatus() != null) property.setStatus(updateDto.getStatus());
            if (updateDto.getAddress() != null) property.setAddress(propertyMapper.addressDtoToEntity(updateDto.getAddress()));
            if (updateDto.getDetails() != null) property.setDetails(propertyMapper.propertyDetailsDtoToEntity(updateDto.getDetails()));
            if (updateDto.getListingPrice() != null) property.setListingPrice(updateDto.getListingPrice());
            if (updateDto.getMonthlyRent() != null) property.setMonthlyRent(updateDto.getMonthlyRent());
            if (updateDto.getSecurityDeposit() != null) property.setSecurityDeposit(updateDto.getSecurityDeposit());
            if (updateDto.getPetDeposit() != null) property.setPetDeposit(updateDto.getPetDeposit());
            if (updateDto.getUtilitiesIncluded() != null) property.setUtilitiesIncluded(updateDto.getUtilitiesIncluded());
            if (updateDto.getPetFriendly() != null) property.setPetFriendly(updateDto.getPetFriendly());
            if (updateDto.getFurnished() != null) property.setFurnished(updateDto.getFurnished());
            if (updateDto.getParkingAvailable() != null) property.setParkingAvailable(updateDto.getParkingAvailable());
            if (updateDto.getSmokeFree() != null) property.setSmokeFree(updateDto.getSmokeFree());
            if (updateDto.getAvailableFrom() != null) property.setAvailableFrom(updateDto.getAvailableFrom());
            if (updateDto.getLeaseMinMonths() != null) property.setLeaseMinMonths(updateDto.getLeaseMinMonths());
            if (updateDto.getLeaseMaxMonths() != null) property.setLeaseMaxMonths(updateDto.getLeaseMaxMonths());
            if (updateDto.getBackgroundCheckRequired() != null) property.setBackgroundCheckRequired(updateDto.getBackgroundCheckRequired());
            if (updateDto.getCreditScoreMinimum() != null) property.setCreditScoreMinimum(updateDto.getCreditScoreMinimum());
            if (updateDto.getIncomeMultiple() != null) property.setIncomeMultiple(updateDto.getIncomeMultiple());
            if (updateDto.getApplicationFee() != null) property.setApplicationFee(updateDto.getApplicationFee());
            if (updateDto.getIsFeatured() != null) property.setIsFeatured(updateDto.getIsFeatured());
            if (updateDto.getFeaturedUntil() != null) property.setFeaturedUntil(updateDto.getFeaturedUntil());
            if (updateDto.getLatitude() != null) property.setLatitude(updateDto.getLatitude());
            if (updateDto.getLongitude() != null) property.setLongitude(updateDto.getLongitude());
            if (updateDto.getGoogleMapsUrl() != null) property.setGoogleMapsUrl(updateDto.getGoogleMapsUrl());
            if (updateDto.getNotes() != null) property.setNotes(updateDto.getNotes());
            if (updateDto.getMetaData() != null) property.setMetaData(propertyMapper.mapMetaData(updateDto.getMetaData()));
            
            // Handle counter updates
            if (Boolean.TRUE.equals(updateDto.getIncrementViewCount())) {
                property.setViewCount(property.getViewCount() + 1);
            }
            if (Boolean.TRUE.equals(updateDto.getIncrementInquiryCount())) {
                property.setInquiryCount(property.getInquiryCount() + 1);
            }
            if (Boolean.TRUE.equals(updateDto.getIncrementFavoriteCount())) {
                property.setFavoriteCount(property.getFavoriteCount() + 1);
            }
            if (Boolean.TRUE.equals(updateDto.getDecrementViewCount()) && property.getViewCount() > 0) {
                property.setViewCount(property.getViewCount() - 1);
            }
            if (Boolean.TRUE.equals(updateDto.getDecrementInquiryCount()) && property.getInquiryCount() > 0) {
                property.setInquiryCount(property.getInquiryCount() - 1);
            }
            if (Boolean.TRUE.equals(updateDto.getDecrementFavoriteCount()) && property.getFavoriteCount() > 0) {
                property.setFavoriteCount(property.getFavoriteCount() - 1);
            }
            
            Property savedProperty = propertyRepository.save(property);
            log.info("Property updated successfully: {}", propertyId);
            
            // Get related data for response
            List<PropertyImage> images = propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(propertyId);
            List<PropertyUnitResponseDto> units = getUnitsForProperty(propertyId);
            Double occupancyRate = calculateOccupancyRate(propertyId);
            BigDecimal totalRevenue = calculateTotalMonthlyRevenue(propertyId);
            
            return PropertyResponseDto.fromEntityWithImages(savedProperty, images, units, occupancyRate, totalRevenue);
            
        } catch (Exception e) {
            log.error("Error updating property: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to update property: " + e.getMessage(), e);
        }
    }

    public PropertyResponseDto getProperty(String propertyId, String ownerId) {
        log.debug("Getting property: {} for owner: {}", propertyId, ownerId);
        
        Property property = findPropertyByIdAndOwner(propertyId, ownerId);
        
        try {
            // Increment view count
            property.setViewCount(property.getViewCount() + 1);
            propertyRepository.save(property);
            
            // Get related data
            List<PropertyImage> images = propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(propertyId);
            List<PropertyUnitResponseDto> units = getUnitsForProperty(propertyId);
            Double occupancyRate = calculateOccupancyRate(propertyId);
            BigDecimal totalRevenue = calculateTotalMonthlyRevenue(propertyId);
            
            return PropertyResponseDto.fromEntityWithImages(property, images, units, occupancyRate, totalRevenue);
            
        } catch (Exception e) {
            log.error("Error getting property: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to get property: " + e.getMessage(), e);
        }
    }

    public void deleteProperty(String propertyId, String ownerId) {
        log.info("Deleting property: {} for owner: {}", propertyId, ownerId);
        
        Property property = findPropertyByIdAndOwner(propertyId, ownerId);
        
        try {
            // Soft delete property
            int updatedRows = propertyRepository.softDeleteById(propertyId);
            if (updatedRows == 0) {
                throw new PropertyNotFoundException("Property not found or already deleted");
            }
            
            // Delete all images
            propertyImageRepository.softDeleteByPropertyId(propertyId);
            
            // Soft delete all units
            List<PropertyUnit> units = propertyUnitRepository.findByPropertyIdAndDeletedAtIsNull(propertyId);
            for (PropertyUnit unit : units) {
                propertyUnitRepository.softDeleteById(unit.getId());
                propertyImageRepository.softDeleteByPropertyId(propertyId); // Unit images are also deleted
            }
            
            log.info("Property deleted successfully: {}", propertyId);
            
        } catch (Exception e) {
            log.error("Error deleting property: {}", e.getMessage(), e);
            if (e instanceof PropertyNotFoundException) {
                throw e;
            }
            throw new DatabaseException("Failed to delete property: " + e.getMessage(), e);
        }
    }

    // Property Search and Listing

    public Page<PropertyResponseDto> searchProperties(PropertySearchCriteriaDto criteria, PaginationDto pagination) {
        log.debug("Searching properties with criteria: {}", criteria);
        
        try {
            Pageable pageable = createPageable(pagination);
            
            Page<Property> propertiesPage = propertyRepository.advancedSearch(
                criteria.getOwnerId(),
                criteria.getStatus(),
                criteria.getPropertyType(),
                criteria.getCity(),
                criteria.getState(),
                criteria.getMinRent() != null ? criteria.getMinRent().doubleValue() : null,
                criteria.getMaxRent() != null ? criteria.getMaxRent().doubleValue() : null,
                criteria.getMinBedrooms(),
                criteria.getMinBathrooms() != null ? criteria.getMinBathrooms() : null,
                criteria.getSearchKeyword(),
                pageable
            );
            
            return propertiesPage.map(property -> {
                List<PropertyImage> images = propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(property.getId());
                List<PropertyUnitResponseDto> units = getUnitsForProperty(property.getId());
                Double occupancyRate = calculateOccupancyRate(property.getId());
                BigDecimal totalRevenue = calculateTotalMonthlyRevenue(property.getId());
                
                return PropertyResponseDto.fromEntityWithImages(property, images, units, occupancyRate, totalRevenue);
            });
            
        } catch (Exception e) {
            log.error("Error searching properties: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to search properties: " + e.getMessage(), e);
        }
    }

    public Page<PropertyResponseDto> getPropertiesByOwner(String ownerId, PaginationDto pagination) {
        log.debug("Getting properties for owner: {}", ownerId);
        
        try {
            Pageable pageable = createPageable(pagination);
            Page<Property> propertiesPage = propertyRepository.findByOwnerIdAndIsDeletedFalse(ownerId, pageable);
            
            return propertiesPage.map(property -> {
                List<PropertyImage> images = propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(property.getId());
                List<PropertyUnitResponseDto> units = getUnitsForProperty(property.getId());
                Double occupancyRate = calculateOccupancyRate(property.getId());
                BigDecimal totalRevenue = calculateTotalMonthlyRevenue(property.getId());
                
                return PropertyResponseDto.fromEntityWithImages(property, images, units, occupancyRate, totalRevenue);
            });
            
        } catch (Exception e) {
            log.error("Error getting properties for owner: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to get properties: " + e.getMessage(), e);
        }
    }

    // Image Management

    public String uploadPropertyImage(String propertyId, String ownerId, MultipartFile file, String imageType, Boolean isPrimary) {
        log.info("Uploading image for property: {} of type: {}", propertyId, imageType);
        
        Property property = findPropertyByIdAndOwner(propertyId, ownerId);
        
        try {
            String imageUrl = fileUploadService.uploadPropertyImage(file, propertyId, imageType);
            
            // Create image entity
            PropertyImage image = new PropertyImage();
            image.setPropertyId(propertyId);
            image.setImageUrl(imageUrl);
            image.setImageType(PropertyImage.ImageType.valueOf(imageType.toUpperCase()));
            image.setIsPrimary(isPrimary != null ? isPrimary : false);
            image.setDisplayOrder(propertyImageRepository.getNextDisplayOrder(propertyId));
            
            PropertyImage savedImage = propertyImageRepository.save(image);
            
            // Set as primary if requested
            if (Boolean.TRUE.equals(isPrimary)) {
                propertyImageRepository.unsetOtherPrimaryImages(propertyId, savedImage.getId());
            }
            
            log.info("Image uploaded successfully: {}", savedImage.getId());
            return imageUrl;
            
        } catch (Exception e) {
            log.error("Error uploading property image: {}", e.getMessage(), e);
            throw new FileUploadException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    public void deletePropertyImage(String imageId, String propertyId, String ownerId) {
        log.info("Deleting image: {} for property: {}", imageId, propertyId);
        
        findPropertyByIdAndOwner(propertyId, ownerId);
        
        try {
            PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new PropertyImageNotFoundException("Image not found"));
            
            if (!image.getPropertyId().equals(propertyId)) {
                throw new UnauthorizedPropertyAccessException("Image does not belong to the specified property");
            }
            
            // Delete from S3
            String s3Key = extractS3KeyFromUrl(image.getImageUrl());
            fileUploadService.deleteFile(s3Key);
            
            // Soft delete from database
            propertyImageRepository.softDeleteById(imageId);
            
            log.info("Image deleted successfully: {}", imageId);
            
        } catch (Exception e) {
            log.error("Error deleting property image: {}", e.getMessage(), e);
            if (e instanceof PropertyImageNotFoundException || e instanceof UnauthorizedPropertyAccessException) {
                throw e;
            }
            throw new DatabaseException("Failed to delete image: " + e.getMessage(), e);
        }
    }

    // Unit Management

    public PropertyResponseDto.PropertyUnitResponseDto createUnit(String propertyId, String ownerId, PropertyUnitCreateDto unitDto) {
        log.info("Creating unit for property: {}", propertyId);
        
        Property property = findPropertyByIdAndOwner(propertyId, ownerId);
        
        try {
            return createUnitInternal(propertyId, unitDto);
            
        } catch (Exception e) {
            log.error("Error creating unit: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to create unit: " + e.getMessage(), e);
        }
    }

    public PropertyResponseDto.PropertyUnitResponseDto updateUnit(String unitId, String propertyId, String ownerId, PropertyUnitCreateDto unitDto) {
        log.info("Updating unit: {} for property: {}", unitId, propertyId);
        
        PropertyUnit unit = findUnitByIdAndPropertyAndOwner(unitId, propertyId, ownerId);
        
        try {
            // Update unit fields
            if (unitDto.getUnitNumber() != null) unit.setUnitNumber(unitDto.getUnitNumber());
            if (unitDto.getFloorNumber() != null) unit.setFloorNumber(unitDto.getFloorNumber());
            if (unitDto.getBuildingSection() != null) unit.setBuildingSection(unitDto.getBuildingSection());
            if (unitDto.getSqft() != null) unit.setSqft(unitDto.getSqft());
            if (unitDto.getBedrooms() != null) unit.setBedrooms(unitDto.getBedrooms());
            if (unitDto.getBathrooms() != null) unit.setBathrooms(unitDto.getBathrooms());
            if (unitDto.getHalfBathrooms() != null) unit.setHalfBathrooms(unitDto.getHalfBathrooms());
            if (unitDto.getMonthlyRent() != null) unit.setMonthlyRent(unitDto.getMonthlyRent());
            if (unitDto.getSecurityDeposit() != null) unit.setSecurityDeposit(unitDto.getSecurityDeposit());
            if (unitDto.getPetDeposit() != null) unit.setPetDeposit(unitDto.getPetDeposit());
            if (unitDto.getUtilitiesIncluded() != null) unit.setUtilitiesIncluded(unitDto.getUtilitiesIncluded());
            if (unitDto.getPetFriendly() != null) unit.setPetFriendly(unitDto.getPetFriendly());
            if (unitDto.getFurnished() != null) unit.setFurnished(unitDto.getFurnished());
            if (unitDto.getParkingAssigned() != null) unit.setParkingAssigned(unitDto.getParkingAssigned());
            if (unitDto.getStorageAssigned() != null) unit.setStorageAssigned(unitDto.getStorageAssigned());
            if (unitDto.getBalcony() != null) unit.setBalcony(unitDto.getBalcony());
            if (unitDto.getTerrace() != null) unit.setTerrace(unitDto.getTerrace());
            if (unitDto.getGardenAccess() != null) unit.setGardenAccess(unitDto.getGardenAccess());
            if (unitDto.getViewType() != null) unit.setViewType(unitDto.getViewType());
            if (unitDto.getWindowOrientation() != null) unit.setWindowOrientation(unitDto.getWindowOrientation());
            if (unitDto.getAppliancesIncluded() != null) unit.setAppliancesIncluded(unitDto.getAppliancesIncluded());
            if (unitDto.getSpecialFeatures() != null) unit.setSpecialFeatures(unitDto.getSpecialFeatures());
            if (unitDto.getAccessibilityFeatures() != null) unit.setAccessibilityFeatures(unitDto.getAccessibilityFeatures());
            if (unitDto.getAvailableFrom() != null) unit.setAvailableFrom(unitDto.getAvailableFrom());
            if (unitDto.getMinimumLeaseMonths() != null) unit.setMinimumLeaseMonths(unitDto.getMinimumLeaseMonths());
            if (unitDto.getMaximumLeaseMonths() != null) unit.setMaximumLeaseMonths(unitDto.getMaximumLeaseMonths());
            if (unitDto.getBackgroundCheckRequired() != null) unit.setBackgroundCheckRequired(unitDto.getBackgroundCheckRequired());
            if (unitDto.getCreditScoreMinimum() != null) unit.setCreditScoreMinimum(unitDto.getCreditScoreMinimum());
            if (unitDto.getIncomeMultipleRequired() != null) unit.setIncomeMultipleRequired(unitDto.getIncomeMultipleRequired());
            if (unitDto.getApplicationFee() != null) unit.setApplicationFee(unitDto.getApplicationFee());
            if (unitDto.getHoldDeposit() != null) unit.setHoldDeposit(unitDto.getHoldDeposit());
            if (unitDto.getIsAvailable() != null) unit.setIsAvailable(unitDto.getIsAvailable());
            if (unitDto.getIsPremium() != null) unit.setIsPremium(unitDto.getIsPremium());
            if (unitDto.getPremiumUntil() != null) unit.setPremiumUntil(unitDto.getPremiumUntil());
            if (unitDto.getNotes() != null) unit.setNotes(unitDto.getNotes());
            if (unitDto.getLeaseTerms() != null) unit.setLeaseTerms(unitDto.getLeaseTerms());
            if (unitDto.getRestrictions() != null) unit.setRestrictions(unitDto.getRestrictions());
            if (unitDto.getStatus() != null) unit.setStatus(unitDto.getStatus());
            
            PropertyUnit savedUnit = propertyUnitRepository.save(unit);
            return propertyUnitMapper.entityToResponseDto(savedUnit);
            
        } catch (Exception e) {
            log.error("Error updating unit: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to update unit: " + e.getMessage(), e);
        }
    }

    public PropertyResponseDto.PropertyUnitResponseDto getUnit(String unitId, String propertyId, String ownerId) {
        log.debug("Getting unit: {} for property: {}", unitId, propertyId);
        
        PropertyUnit unit = findUnitByIdAndPropertyAndOwner(unitId, propertyId, ownerId);
        return propertyUnitMapper.entityToResponseDto(unit);
    }

    public void deleteUnit(String unitId, String propertyId, String ownerId) {
        log.info("Deleting unit: {} for property: {}", unitId, propertyId);
        
        PropertyUnit unit = findUnitByIdAndPropertyAndOwner(unitId, propertyId, ownerId);
        
        try {
            // Soft delete unit
            int updatedRows = propertyUnitRepository.softDeleteById(unitId);
            if (updatedRows == 0) {
                throw new PropertyUnitNotFoundException("Unit not found or already deleted");
            }
            
            // Delete all unit images
            propertyImageRepository.softDeleteByPropertyId(unitId); // Unit images are also linked by propertyId
            
            log.info("Unit deleted successfully: {}", unitId);
            
        } catch (Exception e) {
            log.error("Error deleting unit: {}", e.getMessage(), e);
            if (e instanceof PropertyUnitNotFoundException) {
                throw e;
            }
            throw new DatabaseException("Failed to delete unit: " + e.getMessage(), e);
        }
    }

    // Utility Methods

    private Property findPropertyByIdAndOwner(String propertyId, String ownerId) {
        return propertyRepository.findById(propertyId)
            .filter(property -> property.getOwnerId().equals(ownerId))
            .filter(property -> !property.isDeleted())
            .orElseThrow(() -> new PropertyNotFoundException("Property not found or access denied"));
    }

    private PropertyUnit findUnitByIdAndPropertyAndOwner(String unitId, String propertyId, String ownerId) {
        return propertyUnitRepository.findById(unitId)
            .filter(unit -> unit.getPropertyId().equals(propertyId))
            .filter(unit -> {
                // Verify ownership through property
                return propertyRepository.findById(propertyId)
                    .map(property -> property.getOwnerId().equals(ownerId))
                    .orElse(false);
            })
            .filter(unit -> !unit.isDeleted())
            .orElseThrow(() -> new PropertyUnitNotFoundException("Unit not found or access denied"));
    }

    private Pageable createPageable(PaginationDto pagination) {
        Sort.Direction direction = "desc".equalsIgnoreCase(pagination.getOrder()) 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        Sort sort = Sort.by(direction, pagination.getSortField());
        return PageRequest.of(pagination.getPage() - 1, pagination.getLimit(), sort);
    }

    private PropertyResponseDto.PropertyUnitResponseDto createUnitInternal(String propertyId, PropertyUnitCreateDto unitDto) {
        PropertyUnit unit = propertyUnitMapper.createDtoToEntity(unitDto, propertyId);
        
        // Set default unit number if not provided
        if (unit.getUnitNumber() == null || unit.getUnitNumber().trim().isEmpty()) {
            Integer nextUnitNumber = propertyUnitRepository.getNextUnitNumber(propertyId);
            unit.setUnitNumber(String.valueOf(nextUnitNumber));
        }
        
        PropertyUnit savedUnit = propertyUnitRepository.save(unit);
        return propertyUnitMapper.entityToResponseDto(savedUnit);
    }

    private List<PropertyResponseDto.PropertyUnitResponseDto> getUnitsForProperty(String propertyId) {
        List<PropertyUnit> units = propertyUnitRepository.findByPropertyIdAndDeletedAtIsNull(propertyId);
        return propertyUnitMapper.entitiesToResponseDtos(units);
    }

    private Double calculateOccupancyRate(String propertyId) {
        return propertyUnitRepository.getOccupancyRateByPropertyId(propertyId);
    }

    private BigDecimal calculateTotalMonthlyRevenue(String propertyId) {
        Double revenue = propertyUnitRepository.getTotalMonthlyRevenueByPropertyId(propertyId);
        return revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO;
    }

    private void uploadPropertyImages(String propertyId, String unitId, List<PropertyImageUploadDto> images) {
        for (PropertyImageUploadDto imageDto : images) {
            // This would be called after actual file upload
            // For now, just create the database record
            PropertyImage image = propertyImageMapper.uploadDtoToEntity(imageDto, propertyId, unitId);
            propertyImageRepository.save(image);
        }
    }

    private String extractS3KeyFromUrl(String url) {
        // Extract S3 key from public URL
        // https://bucket.s3.region.amazonaws.com/key -> key
        String[] parts = url.split("/");
        return String.join("/", Arrays.copyOfRange(parts, 3, parts.length));
    }

    // Analytics and Statistics

    public Map<String, Object> getPropertyStatistics(String ownerId) {
        log.debug("Getting property statistics for owner: {}", ownerId);
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Property counts by status
            stats.put("totalProperties", propertyRepository.countByOwnerIdAndStatus(ownerId, Property.PropertyStatus.PUBLISHED));
            stats.put("draftProperties", propertyRepository.countByOwnerIdAndStatus(ownerId, Property.PropertyStatus.DRAFT));
            stats.put("rentedProperties", propertyRepository.countByOwnerIdAndStatus(ownerId, Property.PropertyStatus.RENTED));
            stats.put("maintenanceProperties", propertyRepository.countByOwnerIdAndStatus(ownerId, Property.PropertyStatus.MAINTENANCE));
            
            // Financial data
            Double totalRevenue = propertyRepository.getTotalMonthlyRevenueByOwnerAndStatus(ownerId, Property.PropertyStatus.RENTED);
            stats.put("totalMonthlyRevenue", totalRevenue != null ? totalRevenue : 0.0);
            
            // Calculate occupancy rate across all properties
            List<Property> properties = propertyRepository.findByOwnerIdAndIsDeletedFalse(ownerId, PageRequest.of(0, 1000)).getContent();
            if (!properties.isEmpty()) {
                double totalOccupancyRate = 0.0;
                for (Property property : properties) {
                    Double occupancyRate = calculateOccupancyRate(property.getId());
                    if (occupancyRate != null) {
                        totalOccupancyRate += occupancyRate;
                    }
                }
                stats.put("averageOccupancyRate", totalOccupancyRate / properties.size());
            }
            
            return stats;
            
        } catch (Exception e) {
            log.error("Error getting property statistics: {}", e.getMessage(), e);
            throw new DatabaseException("Failed to get property statistics: " + e.getMessage(), e);
        }
    }
}