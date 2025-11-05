package com.landlord.property.service;

import com.landlord.property.dto.*;
import com.landlord.property.exception.PropertyNotFoundException;
import com.landlord.property.exception.UnauthorizedPropertyAccessException;
import com.landlord.property.mapper.PropertyImageMapper;
import com.landlord.property.mapper.PropertyMapper;
import com.landlord.property.mapper.PropertyUnitMapper;
import com.landlord.property.model.Property;
import com.landlord.property.model.PropertyImage;
import com.landlord.property.repository.PropertyImageRepository;
import com.landlord.property.repository.PropertyRepository;
import com.landlord.property.repository.PropertyUnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private PropertyUnitRepository propertyUnitRepository;

    @Mock
    private PropertyImageRepository propertyImageRepository;

    @Mock
    private PropertyMapper propertyMapper;

    @Mock
    private PropertyUnitMapper propertyUnitMapper;

    @Mock
    private PropertyImageMapper propertyImageMapper;

    @Mock
    private FileUploadService fileUploadService;

    @InjectMocks
    private PropertyService propertyService;

    private Property testProperty;
    private PropertyCreateDto createDto;
    private PropertyUpdateDto updateDto;
    private PropertyResponseDto responseDto;
    private String testPropertyId = "property-123";
    private String testOwnerId = "owner-456";

    @BeforeEach
    void setUp() {
        testProperty = createTestProperty();
        createDto = createTestCreateDto();
        updateDto = createTestUpdateDto();
        responseDto = createTestResponseDto();
    }

    @Test
    void createProperty_ShouldCreatePropertySuccessfully() {
        // Arrange
        when(propertyMapper.createDtoToEntity(createDto, testOwnerId)).thenReturn(testProperty);
        when(propertyRepository.save(testProperty)).thenReturn(testProperty);
        when(propertyMapper.entityToResponseDto(testProperty)).thenReturn(responseDto);

        // Act
        PropertyResponseDto result = propertyService.createProperty(createDto, testOwnerId);

        // Assert
        assertNotNull(result);
        verify(propertyRepository).save(testProperty);
        verify(propertyMapper).createDtoToEntity(createDto, testOwnerId);
    }

    @Test
    void createProperty_WithUnits_ShouldCreatePropertyAndUnits() {
        // Arrange
        PropertyUnitCreateDto unitDto = createTestUnitDto();
        createDto.setUnits(Arrays.asList(unitDto));
        
        when(propertyMapper.createDtoToEntity(createDto, testOwnerId)).thenReturn(testProperty);
        when(propertyRepository.save(testProperty)).thenReturn(testProperty);
        when(propertyUnitMapper.createDtoToEntity(unitDto, testPropertyId)).thenReturn(createTestUnit());
        when(propertyUnitRepository.save(any())).thenReturn(createTestUnit());
        when(propertyUnitMapper.entityToResponseDto(any())).thenReturn(createTestUnitResponseDto());

        // Act
        PropertyResponseDto result = propertyService.createProperty(createDto, testOwnerId);

        // Assert
        assertNotNull(result);
        verify(propertyRepository).save(testProperty);
        verify(propertyUnitRepository).save(any());
    }

    @Test
    void updateProperty_ShouldUpdatePropertySuccessfully() {
        // Arrange
        when(propertyRepository.findById(testPropertyId)).thenReturn(Optional.of(testProperty));
        when(propertyRepository.save(testProperty)).thenReturn(testProperty);
        when(propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(testPropertyId)).thenReturn(Collections.emptyList());
        when(propertyUnitMapper.entitiesToResponseDtos(Collections.emptyList())).thenReturn(Collections.emptyList());
        when(propertyUnitRepository.getOccupancyRateByPropertyId(testPropertyId)).thenReturn(85.0);
        when(propertyUnitRepository.getTotalMonthlyRevenueByPropertyId(testPropertyId)).thenReturn(2500.0);
        when(propertyMapper.entityToResponseDto(testProperty)).thenReturn(responseDto);

        // Act
        PropertyResponseDto result = propertyService.updateProperty(testPropertyId, testOwnerId, updateDto);

        // Assert
        assertNotNull(result);
        verify(propertyRepository).save(testProperty);
        verify(propertyRepository).findById(testPropertyId);
    }

    @Test
    void getProperty_ShouldReturnPropertySuccessfully() {
        // Arrange
        when(propertyRepository.findById(testPropertyId)).thenReturn(Optional.of(testProperty));
        when(propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(testPropertyId)).thenReturn(Collections.emptyList());
        when(propertyUnitMapper.entitiesToResponseDtos(Collections.emptyList())).thenReturn(Collections.emptyList());
        when(propertyUnitRepository.getOccupancyRateByPropertyId(testPropertyId)).thenReturn(85.0);
        when(propertyUnitRepository.getTotalMonthlyRevenueByPropertyId(testPropertyId)).thenReturn(2500.0);
        when(propertyMapper.entityToResponseDto(testProperty)).thenReturn(responseDto);

        // Act
        PropertyResponseDto result = propertyService.getProperty(testPropertyId, testOwnerId);

        // Assert
        assertNotNull(result);
        verify(propertyRepository).findById(testPropertyId);
        verify(propertyRepository).save(testProperty); // For view count increment
    }

    @Test
    void getProperty_WithUnauthorizedOwner_ShouldThrowException() {
        // Arrange
        Property unauthorizedProperty = createTestProperty();
        unauthorizedProperty.setOwnerId("different-owner");
        when(propertyRepository.findById(testPropertyId)).thenReturn(Optional.of(unauthorizedProperty));

        // Act & Assert
        assertThrows(PropertyNotFoundException.class, () -> {
            propertyService.getProperty(testPropertyId, testOwnerId);
        });
    }

    @Test
    void deleteProperty_ShouldDeletePropertySuccessfully() {
        // Arrange
        when(propertyRepository.findById(testPropertyId)).thenReturn(Optional.of(testProperty));
        when(propertyRepository.softDeleteById(testPropertyId)).thenReturn(1);
        when(propertyImageRepository.softDeleteByPropertyId(testPropertyId)).thenReturn(2);
        when(propertyUnitRepository.findByPropertyIdAndDeletedAtIsNull(testPropertyId)).thenReturn(Arrays.asList(createTestUnit()));

        // Act
        propertyService.deleteProperty(testPropertyId, testOwnerId);

        // Assert
        verify(propertyRepository).softDeleteById(testPropertyId);
        verify(propertyImageRepository).softDeleteByPropertyId(testPropertyId);
        verify(propertyUnitRepository).findByPropertyIdAndDeletedAtIsNull(testPropertyId);
    }

    @Test
    void searchProperties_ShouldReturnPropertiesPage() {
        // Arrange
        PropertySearchCriteriaDto criteria = new PropertySearchCriteriaDto();
        PaginationDto pagination = new PaginationDto(1, 20, "createdAt", "desc");
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<Property> propertiesPage = new PageImpl<>(Arrays.asList(testProperty), pageable, 1);
        when(propertyRepository.advancedSearch(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), eq(pageable)))
            .thenReturn(propertiesPage);
        when(propertyImageRepository.findByPropertyIdAndDeletedAtIsNull(testPropertyId)).thenReturn(Collections.emptyList());
        when(propertyUnitMapper.entitiesToResponseDtos(Collections.emptyList())).thenReturn(Collections.emptyList());
        when(propertyUnitRepository.getOccupancyRateByPropertyId(testPropertyId)).thenReturn(85.0);
        when(propertyUnitRepository.getTotalMonthlyRevenueByPropertyId(testPropertyId)).thenReturn(2500.0);
        when(propertyMapper.entityToResponseDto(testProperty)).thenReturn(responseDto);

        // Act
        Page<PropertyResponseDto> result = propertyService.searchProperties(criteria, pagination);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(propertyRepository).advancedSearch(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), eq(pageable));
    }

    @Test
    void uploadPropertyImage_ShouldUploadImageSuccessfully() {
        // Arrange
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("test-image.jpg");
        when(mockFile.getContentType()).thenReturn("image/jpeg");
        when(mockFile.getSize()).thenReturn(1024000L);
        when(mockFile.isEmpty()).thenReturn(false);
        
        when(propertyRepository.findById(testPropertyId)).thenReturn(Optional.of(testProperty));
        when(fileUploadService.uploadPropertyImage(mockFile, testPropertyId, "INTERIOR")).thenReturn("https://example.com/image.jpg");
        
        PropertyImage mockImage = new PropertyImage();
        when(propertyImageRepository.save(any(PropertyImage.class))).thenReturn(mockImage);
        when(propertyImageRepository.getNextDisplayOrder(testPropertyId)).thenReturn(1);

        // Act
        String result = propertyService.uploadPropertyImage(testPropertyId, testOwnerId, mockFile, "INTERIOR", false);

        // Assert
        assertNotNull(result);
        assertEquals("https://example.com/image.jpg", result);
        verify(propertyRepository).findById(testPropertyId);
        verify(fileUploadService).uploadPropertyImage(mockFile, testPropertyId, "INTERIOR");
        verify(propertyImageRepository).save(any(PropertyImage.class));
    }

    @Test
    void createUnit_ShouldCreateUnitSuccessfully() {
        // Arrange
        PropertyUnitCreateDto unitDto = createTestUnitDto();
        PropertyUnit testUnit = createTestUnit();
        PropertyResponseDto.PropertyUnitResponseDto unitResponse = createTestUnitResponseDto();
        
        when(propertyRepository.findById(testPropertyId)).thenReturn(Optional.of(testProperty));
        when(propertyUnitMapper.createDtoToEntity(unitDto, testPropertyId)).thenReturn(testUnit);
        when(propertyUnitRepository.save(testUnit)).thenReturn(testUnit);
        when(propertyUnitMapper.entityToResponseDto(testUnit)).thenReturn(unitResponse);

        // Act
        PropertyResponseDto.PropertyUnitResponseDto result = propertyService.createUnit(testPropertyId, testOwnerId, unitDto);

        // Assert
        assertNotNull(result);
        verify(propertyUnitRepository).save(testUnit);
        verify(propertyUnitMapper).createDtoToEntity(unitDto, testPropertyId);
    }

    @Test
    void getPropertyStatistics_ShouldReturnStatistics() {
        // Arrange
        when(propertyRepository.countByOwnerIdAndStatus(testOwnerId, Property.PropertyStatus.PUBLISHED)).thenReturn(5L);
        when(propertyRepository.countByOwnerIdAndStatus(testOwnerId, Property.PropertyStatus.DRAFT)).thenReturn(2L);
        when(propertyRepository.countByOwnerIdAndStatus(testOwnerId, Property.PropertyStatus.RENTED)).thenReturn(3L);
        when(propertyRepository.countByOwnerIdAndStatus(testOwnerId, Property.PropertyStatus.MAINTENANCE)).thenReturn(1L);
        when(propertyRepository.getTotalMonthlyRevenueByOwnerAndStatus(testOwnerId, Property.PropertyStatus.RENTED)).thenReturn(7500.0);
        
        List<Property> properties = Arrays.asList(testProperty);
        when(propertyRepository.findByOwnerIdAndIsDeletedFalse(testOwnerId, any(Pageable.class))).thenReturn(new PageImpl<>(properties));
        when(propertyUnitRepository.getOccupancyRateByPropertyId(testPropertyId)).thenReturn(85.0);

        // Act
        Map<String, Object> result = propertyService.getPropertyStatistics(testOwnerId);

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.get("totalProperties"));
        assertEquals(2L, result.get("draftProperties"));
        assertEquals(3L, result.get("rentedProperties"));
        assertEquals(1L, result.get("maintenanceProperties"));
        assertEquals(7500.0, result.get("totalMonthlyRevenue"));
    }

    // Helper methods

    private Property createTestProperty() {
        Property property = new Property();
        property.setId(testPropertyId);
        property.setOwnerId(testOwnerId);
        property.setName("Test Property");
        property.setDescription("Test Description");
        property.setPropertyType(Property.PropertyType.APARTMENT);
        property.setStatus(Property.PropertyStatus.PUBLISHED);
        property.setMonthlyRent(BigDecimal.valueOf(2500.00));
        property.setViewCount(0);
        property.setInquiryCount(0);
        property.setFavoriteCount(0);
        property.setIsAvailable(true);
        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());
        return property;
    }

    private PropertyCreateDto createTestCreateDto() {
        PropertyCreateDto dto = new PropertyCreateDto();
        dto.setName("Test Property");
        dto.setDescription("Test Description");
        dto.setPropertyType(Property.PropertyType.APARTMENT);
        dto.setStatus(Property.PropertyStatus.PUBLISHED);
        dto.setAddress(createTestAddressDto());
        dto.setMonthlyRent(BigDecimal.valueOf(2500.00));
        return dto;
    }

    private PropertyUpdateDto createTestUpdateDto() {
        PropertyUpdateDto dto = new PropertyUpdateDto();
        dto.setName("Updated Test Property");
        dto.setMonthlyRent(BigDecimal.valueOf(2700.00));
        return dto;
    }

    private AddressDto createTestAddressDto() {
        AddressDto address = new AddressDto();
        address.setStreetAddress("123 Main St");
        address.setCity("New York");
        address.setState("NY");
        address.setZipCode("10001");
        address.setCountry("United States");
        return address;
    }

    private PropertyUnitCreateDto createTestUnitDto() {
        PropertyUnitCreateDto dto = new PropertyUnitCreateDto();
        dto.setUnitNumber("1A");
        dto.setFloorNumber(1);
        dto.setBedrooms(2);
        dto.setBathrooms(BigDecimal.valueOf(1.5));
        dto.setMonthlyRent(BigDecimal.valueOf(2500.00));
        dto.setStatus(com.landlord.property.model.PropertyUnit.UnitStatus.AVAILABLE);
        return dto;
    }

    private com.landlord.property.model.PropertyUnit createTestUnit() {
        com.landlord.property.model.PropertyUnit unit = new com.landlord.property.model.PropertyUnit();
        unit.setId("unit-123");
        unit.setPropertyId(testPropertyId);
        unit.setUnitNumber("1A");
        unit.setFloorNumber(1);
        unit.setBedrooms(2);
        unit.setBathrooms(BigDecimal.valueOf(1.5));
        unit.setMonthlyRent(BigDecimal.valueOf(2500.00));
        unit.setStatus(com.landlord.property.model.PropertyUnit.UnitStatus.AVAILABLE);
        return unit;
    }

    private PropertyResponseDto createTestResponseDto() {
        return PropertyResponseDto.builder()
                .id(testPropertyId)
                .name("Test Property")
                .description("Test Description")
                .propertyType(Property.PropertyType.APARTMENT)
                .status(Property.PropertyStatus.PUBLISHED)
                .monthlyRent(BigDecimal.valueOf(2500.00))
                .isAvailable(true)
                .viewCount(0)
                .inquiryCount(0)
                .favoriteCount(0)
                .build();
    }

    private PropertyResponseDto.PropertyUnitResponseDto createTestUnitResponseDto() {
        return PropertyResponseDto.PropertyUnitResponseDto.builder()
                .id("unit-123")
                .unitNumber("1A")
                .floorNumber(1)
                .bedrooms(2)
                .bathrooms(BigDecimal.valueOf(1.5))
                .monthlyRent(BigDecimal.valueOf(2500.00))
                .status(com.landlord.property.model.PropertyUnit.UnitStatus.AVAILABLE)
                .build();
    }
}