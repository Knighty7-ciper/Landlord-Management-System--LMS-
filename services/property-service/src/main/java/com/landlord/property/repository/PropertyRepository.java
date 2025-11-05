package com.landlord.property.repository;

import com.landlord.property.model.Property;
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
public interface PropertyRepository extends JpaRepository<Property, String> {

    /**
     * Find all properties for a specific owner
     */
    Page<Property> findByOwnerIdAndIsDeletedFalse(String ownerId, Pageable pageable);

    /**
     * Find properties by status
     */
    Page<Property> findByStatusAndIsDeletedFalse(Property.PropertyStatus status, Pageable pageable);

    /**
     * Find properties by type
     */
    Page<Property> findByPropertyTypeAndIsDeletedFalse(Property.PropertyType type, Pageable pageable);

    /**
     * Find active properties (isAvailable = true and not deleted)
     */
    Page<Property> findByIsAvailableTrueAndIsDeletedFalse(Pageable pageable);

    /**
     * Find properties by city and state
     */
    @Query("SELECT p FROM Property p WHERE p.address.city = :city AND p.address.state = :state AND p.deletedAt IS NULL")
    Page<Property> findByAddress_CityAndAddress_State(@Param("city") String city, @Param("state") String state, Pageable pageable);

    /**
     * Search properties by keyword in name or description
     */
    @Query("SELECT p FROM Property p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.address.city) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
           "p.deletedAt IS NULL")
    Page<Property> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find properties with rent between min and max
     */
    @Query("SELECT p FROM Property p WHERE p.monthlyRent BETWEEN :minRent AND :maxRent AND p.deletedAt IS NULL")
    Page<Property> findByRentRange(@Param("minRent") Double minRent, @Param("maxRent") Double maxRent, Pageable pageable);

    /**
     * Find properties by bedroom count
     */
    @Query("SELECT p FROM Property p WHERE p.details.bedrooms = :bedrooms AND p.deletedAt IS NULL")
    Page<Property> findByBedroomCount(@Param("bedrooms") Integer bedrooms, Pageable pageable);

    /**
     * Find properties by bathroom count
     */
    @Query("SELECT p FROM Property p WHERE p.details.bathrooms = :bathrooms AND p.deletedAt IS NULL")
    Page<Property> findByBathroomCount(@Param("bathrooms") Double bathrooms, Pageable pageable);

    /**
     * Find featured properties
     */
    @Query("SELECT p FROM Property p WHERE p.isFeatured = true AND p.featuredUntil > :now AND p.deletedAt IS NULL")
    Page<Property> findFeaturedProperties(@Param("now") java.time.LocalDateTime now, Pageable pageable);

    /**
     * Find recently created properties (within last N days)
     */
    @Query("SELECT p FROM Property p WHERE p.createdAt >= :since AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    Page<Property> findRecentProperties(@Param("since") java.time.LocalDateTime since, Pageable pageable);

    /**
     * Get property count by status for owner
     */
    @Query("SELECT COUNT(p) FROM Property p WHERE p.ownerId = :ownerId AND p.status = :status AND p.deletedAt IS NULL")
    Long countByOwnerIdAndStatus(@Param("ownerId") String ownerId, @Param("status") Property.PropertyStatus status);

    /**
     * Check if property exists for owner
     */
    boolean existsByOwnerIdAndIdAndDeletedAtIsNull(String ownerId, String id);

    /**
     * Find properties with availability from date
     */
    @Query("SELECT p FROM Property p WHERE p.availableFrom >= :date AND p.deletedAt IS NULL")
    Page<Property> findByAvailableFromAfter(@Param("date") java.time.LocalDateTime date, Pageable pageable);

    /**
     * Advanced search with multiple criteria
     */
    @Query("SELECT p FROM Property p WHERE " +
           "(:ownerId IS NULL OR p.ownerId = :ownerId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
           "(:city IS NULL OR LOWER(p.address.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:state IS NULL OR p.address.state = :state) AND " +
           "(:minRent IS NULL OR p.monthlyRent >= :minRent) AND " +
           "(:maxRent IS NULL OR p.monthlyRent <= :maxRent) AND " +
           "(:bedrooms IS NULL OR p.details.bedrooms = :bedrooms) AND " +
           "(:bathrooms IS NULL OR p.details.bathrooms = :bathrooms) AND " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "p.deletedAt IS NULL")
    Page<Property> advancedSearch(
            @Param("ownerId") String ownerId,
            @Param("status") Property.PropertyStatus status,
            @Param("propertyType") Property.PropertyType propertyType,
            @Param("city") String city,
            @Param("state") String state,
            @Param("minRent") Double minRent,
            @Param("maxRent") Double maxRent,
            @Param("bedrooms") Integer bedrooms,
            @Param("bathrooms") Double bathrooms,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Find properties with high view count
     */
    @Query("SELECT p FROM Property p WHERE p.viewCount >= :minViews AND p.deletedAt IS NULL ORDER BY p.viewCount DESC")
    Page<Property> findByViewCountGreaterThanEqual(@Param("minViews") Integer minViews, Pageable pageable);

    /**
     * Get total rental income for owner
     */
    @Query("SELECT COALESCE(SUM(p.monthlyRent), 0) FROM Property p WHERE p.ownerId = :ownerId AND p.status = :status AND p.deletedAt IS NULL")
    Double getTotalMonthlyRevenueByOwnerAndStatus(@Param("ownerId") String ownerId, @Param("status") Property.PropertyStatus status);

    /**
     * Find properties that need attention (high maintenance, low occupancy)
     */
    @Query("SELECT p FROM Property p WHERE p.id IN (" +
           "SELECT DISTINCT pu.propertyId FROM PropertyUnit pu WHERE pu.status = 'MAINTENANCE'" +
           ") AND p.deletedAt IS NULL")
    Page<Property> findPropertiesNeedingAttention(Pageable pageable);

    /**
     * Soft delete property
     */
    @Query("UPDATE Property p SET p.deletedAt = CURRENT_TIMESTAMP, p.updatedAt = CURRENT_TIMESTAMP WHERE p.id = :id AND p.deletedAt IS NULL")
    int softDeleteById(@Param("id") String id);

    /**
     * Restore soft deleted property
     */
    @Query("UPDATE Property p SET p.deletedAt = NULL, p.updatedAt = CURRENT_TIMESTAMP WHERE p.id = :id AND p.deletedAt IS NOT NULL")
    int restoreById(@Param("id") String id);
}