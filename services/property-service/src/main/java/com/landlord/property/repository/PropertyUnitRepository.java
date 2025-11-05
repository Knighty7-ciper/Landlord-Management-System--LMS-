package com.landlord.property.repository;

import com.landlord.property.model.PropertyUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyUnitRepository extends JpaRepository<PropertyUnit, String> {

    /**
     * Find all units for a specific property
     */
    List<PropertyUnit> findByPropertyIdAndDeletedAtIsNull(String propertyId);

    /**
     * Find units by status
     */
    Page<PropertyUnit> findByStatusAndIsDeletedFalse(PropertyUnit.UnitStatus status, Pageable pageable);

    /**
     * Find available units
     */
    Page<PropertyUnit> findByIsAvailableTrueAndIsDeletedFalse(Pageable pageable);

    /**
     * Find units by bedrooms count
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.bedrooms = :bedrooms AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByBedrooms(@Param("bedrooms") Integer bedrooms, Pageable pageable);

    /**
     * Find units by bathroom count
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.bathrooms = :bathrooms AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByBathrooms(@Param("bathrooms") Double bathrooms, Pageable pageable);

    /**
     * Find units with rent range
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.monthlyRent BETWEEN :minRent AND :maxRent AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByRentRange(@Param("minRent") Double minRent, @Param("maxRent") Double maxRent, Pageable pageable);

    /**
     * Find units by property and availability
     */
    List<PropertyUnit> findByPropertyIdAndIsAvailableAndDeletedAtIsNull(String propertyId, Boolean isAvailable);

    /**
     * Find premium units
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.isPremium = true AND pu.premiumUntil > :now AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findPremiumUnits(@Param("now") java.time.LocalDateTime now, Pageable pageable);

    /**
     * Find units available from date
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.availableFrom >= :date AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByAvailableFromAfter(@Param("date") java.time.LocalDateTime date, Pageable pageable);

    /**
     * Search units by keyword
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE " +
           "LOWER(pu.notes) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(pu.unitNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
           "pu.deletedAt IS NULL")
    Page<PropertyUnit> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find units by property and status
     */
    List<PropertyUnit> findByPropertyIdAndStatusAndDeletedAtIsNull(String propertyId, PropertyUnit.UnitStatus status);

    /**
     * Get unit count by status for property
     */
    @Query("SELECT COUNT(pu) FROM PropertyUnit pu WHERE pu.propertyId = :propertyId AND pu.status = :status AND pu.deletedAt IS NULL")
    Long countByPropertyIdAndStatus(@Param("propertyId") String propertyId, @Param("status") PropertyUnit.UnitStatus status);

    /**
     * Check if unit exists for property
     */
    boolean existsByPropertyIdAndIdAndDeletedAtIsNull(String propertyId, String id);

    /**
     * Find units with specific features
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE " +
           "(:furnished IS NULL OR pu.furnished = :furnished) AND " +
           "(:petFriendly IS NULL OR pu.petFriendly = :petFriendly) AND " +
           "(:parkingAssigned IS NULL OR pu.parkingAssigned = :parkingAssigned) AND " +
           "(:balcony IS NULL OR pu.balcony = :balcony) AND " +
           "pu.deletedAt IS NULL")
    Page<PropertyUnit> findByFeatures(
            @Param("furnished") Boolean furnished,
            @Param("petFriendly") Boolean petFriendly,
            @Param("parkingAssigned") Boolean parkingAssigned,
            @Param("balcony") Boolean balcony,
            Pageable pageable);

    /**
     * Get total rental income for property
     */
    @Query("SELECT COALESCE(SUM(pu.monthlyRent), 0) FROM PropertyUnit pu WHERE pu.propertyId = :propertyId AND pu.status = 'RENTED' AND pu.deletedAt IS NULL")
    Double getTotalMonthlyRevenueByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Find units by floor number
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.floorNumber = :floorNumber AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByFloorNumber(@Param("floorNumber") Integer floorNumber, Pageable pageable);

    /**
     * Find units by square footage range
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.sqft BETWEEN :minSqft AND :maxSqft AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findBySqftRange(@Param("minSqft") Double minSqft, @Param("maxSqft") Double maxSqft, Pageable pageable);

    /**
     * Find units with minimum lease months
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.minimumLeaseMonths >= :minMonths AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByMinimumLeaseMonthsGreaterThanEqual(@Param("minMonths") Integer minMonths, Pageable pageable);

    /**
     * Advanced unit search
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE " +
           "(:propertyId IS NULL OR pu.propertyId = :propertyId) AND " +
           "(:status IS NULL OR pu.status = :status) AND " +
           "(:bedrooms IS NULL OR pu.bedrooms = :bedrooms) AND " +
           "(:bathrooms IS NULL OR pu.bathrooms = :bathrooms) AND " +
           "(:minRent IS NULL OR pu.monthlyRent >= :minRent) AND " +
           "(:maxRent IS NULL OR pu.monthlyRent <= :maxRent) AND " +
           "(:minSqft IS NULL OR pu.sqft >= :minSqft) AND " +
           "(:maxSqft IS NULL OR pu.sqft <= :maxSqft) AND " +
           "(:furnished IS NULL OR pu.furnished = :furnished) AND " +
           "(:petFriendly IS NULL OR pu.petFriendly = :petFriendly) AND " +
           "(:parkingAssigned IS NULL OR pu.parkingAssigned = :parkingAssigned) AND " +
           "(:keyword IS NULL OR LOWER(pu.notes) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(pu.unitNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "pu.deletedAt IS NULL")
    Page<PropertyUnit> advancedSearch(
            @Param("propertyId") String propertyId,
            @Param("status") PropertyUnit.UnitStatus status,
            @Param("bedrooms") Integer bedrooms,
            @Param("bathrooms") Double bathrooms,
            @Param("minRent") Double minRent,
            @Param("maxRent") Double maxRent,
            @Param("minSqft") Double minSqft,
            @Param("maxSqft") Double maxSqft,
            @Param("furnished") Boolean furnished,
            @Param("petFriendly") Boolean petFriendly,
            @Param("parkingAssigned") Boolean parkingAssigned,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Find units requiring maintenance
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE pu.status = 'MAINTENANCE' AND pu.deletedAt IS NULL ORDER BY pu.updatedAt DESC")
    Page<PropertyUnit> findUnitsNeedingMaintenance(Pageable pageable);

    /**
     * Get occupancy rate for property
     */
    @Query("SELECT " +
           "COUNT(CASE WHEN pu.status = 'RENTED' THEN 1 END) * 100.0 / COUNT(pu) " +
           "FROM PropertyUnit pu WHERE pu.propertyId = :propertyId AND pu.deletedAt IS NULL")
    Double getOccupancyRateByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Find units with specific appliance
     */
    @Query("SELECT pu FROM PropertyUnit pu WHERE " +
           "pu.appliancesIncluded LIKE CONCAT('%', :appliance, '%') AND pu.deletedAt IS NULL")
    Page<PropertyUnit> findByAppliance(@Param("appliance") String appliance, Pageable pageable);

    /**
     * Soft delete unit
     */
    @Query("UPDATE PropertyUnit pu SET pu.deletedAt = CURRENT_TIMESTAMP, pu.updatedAt = CURRENT_TIMESTAMP WHERE pu.id = :id AND pu.deletedAt IS NULL")
    int softDeleteById(@Param("id") String id);

    /**
     * Restore soft deleted unit
     */
    @Query("UPDATE PropertyUnit pu SET pu.deletedAt = NULL, pu.updatedAt = CURRENT_TIMESTAMP WHERE pu.id = :id AND pu.deletedAt IS NOT NULL")
    int restoreById(@Param("id") String id);

    /**
     * Get next available unit number for property
     */
    @Query("SELECT COALESCE(MAX(CAST(pu.unitNumber AS INTEGER)), 0) + 1 FROM PropertyUnit pu WHERE pu.propertyId = :propertyId AND pu.deletedAt IS NULL")
    Integer getNextUnitNumber(@Param("propertyId") String propertyId);
}