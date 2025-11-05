package com.landlord.property.repository;

import com.landlord.property.model.PropertyImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, String> {

    /**
     * Find all images for a property
     */
    List<PropertyImage> findByPropertyIdAndDeletedAtIsNull(String propertyId);

    /**
     * Find images for a specific unit
     */
    List<PropertyImage> findByUnitIdAndDeletedAtIsNull(String unitId);

    /**
     * Find images by property and display order
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.deletedAt IS NULL ORDER BY pi.displayOrder ASC, pi.createdAt ASC")
    List<PropertyImage> findByPropertyIdOrderByDisplayOrder(@Param("propertyId") String propertyId);

    /**
     * Find primary image for property
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.isPrimary = true AND pi.deletedAt IS NULL")
    Optional<PropertyImage> findPrimaryByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Find primary image for unit
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.unitId = :unitId AND pi.isPrimary = true AND pi.deletedAt IS NULL")
    Optional<PropertyImage> findPrimaryByUnitId(@Param("unitId") String unitId);

    /**
     * Find images by type
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.imageType = :imageType AND pi.deletedAt IS NULL")
    Page<PropertyImage> findByImageType(PropertyImage.ImageType imageType, Pageable pageable);

    /**
     * Find featured images
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.isFeatured = true AND pi.deletedAt IS NULL ORDER BY pi.displayOrder ASC")
    List<PropertyImage> findFeaturedImages();

    /**
     * Find 360 degree images for property
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.is360Degree = true AND pi.deletedAt IS NULL ORDER BY pi.displayOrder ASC")
    List<PropertyImage> find360ImagesByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Find images by room type
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.roomType = :roomType AND pi.deletedAt IS NULL ORDER BY pi.displayOrder ASC")
    Page<PropertyImage> findByRoomType(@Param("roomType") String roomType, Pageable pageable);

    /**
     * Get next display order for property
     */
    @Query("SELECT COALESCE(MAX(pi.displayOrder), 0) + 1 FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.deletedAt IS NULL")
    Integer getNextDisplayOrder(@Param("propertyId") String propertyId);

    /**
     * Get next display order for unit
     */
    @Query("SELECT COALESCE(MAX(pi.displayOrder), 0) + 1 FROM PropertyImage pi WHERE pi.unitId = :unitId AND pi.deletedAt IS NULL")
    Integer getNextDisplayOrderForUnit(@Param("unitId") String unitId);

    /**
     * Update display order for property images
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET pi.displayOrder = :newOrder WHERE pi.propertyId = :propertyId AND pi.id = :imageId AND pi.deletedAt IS NULL")
    int updateDisplayOrder(@Param("imageId") String imageId, @Param("propertyId") String propertyId, @Param("newOrder") Integer newOrder);

    /**
     * Set primary image for property (unset other primaries first)
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET pi.isPrimary = false WHERE pi.propertyId = :propertyId AND pi.id != :imageId AND pi.deletedAt IS NULL")
    int unsetOtherPrimaryImages(@Param("propertyId") String propertyId, @Param("imageId") String imageId);

    /**
     * Set primary image for unit (unset other primaries first)
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET pi.isPrimary = false WHERE pi.unitId = :unitId AND pi.id != :imageId AND pi.deletedAt IS NULL")
    int unsetOtherPrimaryImagesForUnit(@Param("unitId") String unitId, @Param("imageId") String imageId);

    /**
     * Find images by file format
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.format = :format AND pi.deletedAt IS NULL")
    Page<PropertyImage> findByFormat(@Param("format") String format, Pageable pageable);

    /**
     * Find images by minimum dimensions
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.widthPixels >= :minWidth AND pi.heightPixels >= :minHeight AND pi.deletedAt IS NULL")
    Page<PropertyImage> findByMinimumDimensions(@Param("minWidth") Integer minWidth, @Param("minHeight") Integer minHeight, Pageable pageable);

    /**
     * Find images by maximum file size (in bytes)
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.fileSizeBytes <= :maxSize AND pi.deletedAt IS NULL")
    Page<PropertyImage> findByMaxFileSize(@Param("maxSize") Long maxSize, Pageable pageable);

    /**
     * Get total image count for property
     */
    @Query("SELECT COUNT(pi) FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.deletedAt IS NULL")
    Long countByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Get total image count for unit
     */
    @Query("SELECT COUNT(pi) FROM PropertyImage pi WHERE pi.unitId = :unitId AND pi.deletedAt IS NULL")
    Long countByUnitId(@Param("unitId") String unitId);

    /**
     * Find images by property and image type
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.imageType = :imageType AND pi.deletedAt IS NULL ORDER BY pi.displayOrder ASC")
    List<PropertyImage> findByPropertyIdAndImageType(@Param("propertyId") String propertyId, @Param("imageType") PropertyImage.ImageType imageType);

    /**
     * Search images by keyword in alt text or description
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE " +
           "LOWER(pi.altText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(pi.description) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
           "pi.deletedAt IS NULL")
    Page<PropertyImage> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find recently uploaded images
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.createdAt >= :since AND pi.deletedAt IS NULL ORDER BY pi.createdAt DESC")
    Page<PropertyImage> findRecentImages(@Param("since") java.time.LocalDateTime since, Pageable pageable);

    /**
     * Find images by property and multiple types
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.imageType IN (:types) AND pi.deletedAt IS NULL ORDER BY pi.displayOrder ASC")
    List<PropertyImage> findByPropertyIdAndImageTypes(@Param("propertyId") String propertyId, @Param("types") List<PropertyImage.ImageType> types);

    /**
     * Get all image types for property
     */
    @Query("SELECT DISTINCT pi.imageType FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.deletedAt IS NULL")
    List<PropertyImage.ImageType> findImageTypesByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Find images requiring thumbnail generation
     */
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.thumbnailUrl IS NULL AND pi.deletedAt IS NULL")
    List<PropertyImage> findImagesMissingThumbnails();

    /**
     * Reorder images for property
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET " +
           "pi.displayOrder = CASE pi.id " +
           "WHEN :imageId1 THEN :order1 " +
           "WHEN :imageId2 THEN :order2 " +
           "WHEN :imageId3 THEN :order3 " +
           "WHEN :imageId4 THEN :order4 " +
           "WHEN :imageId5 THEN :order5 " +
           "END " +
           "WHERE pi.propertyId = :propertyId AND pi.id IN (:imageId1, :imageId2, :imageId3, :imageId4, :imageId5)")
    int reorderImages(
            @Param("propertyId") String propertyId,
            @Param("imageId1") String imageId1, @Param("order1") Integer order1,
            @Param("imageId2") String imageId2, @Param("order2") Integer order2,
            @Param("imageId3") String imageId3, @Param("order3") Integer order3,
            @Param("imageId4") String imageId4, @Param("order4") Integer order4,
            @Param("imageId5") String imageId5, @Param("order5") Integer order5);

    /**
     * Get storage statistics for property
     */
    @Query("SELECT " +
           "COUNT(pi) as totalImages, " +
           "COALESCE(SUM(pi.fileSizeBytes), 0) as totalSize, " +
           "COALESCE(AVG(pi.fileSizeBytes), 0) as avgSize " +
           "FROM PropertyImage pi WHERE pi.propertyId = :propertyId AND pi.deletedAt IS NULL")
    Object[] getImageStatisticsByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Soft delete image
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET pi.deletedAt = CURRENT_TIMESTAMP, pi.updatedAt = CURRENT_TIMESTAMP WHERE pi.id = :id AND pi.deletedAt IS NULL")
    int softDeleteById(@Param("id") String id);

    /**
     * Restore soft deleted image
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET pi.deletedAt = NULL, pi.updatedAt = CURRENT_TIMESTAMP WHERE pi.id = :id AND pi.deletedAt IS NOT NULL")
    int restoreById(@Param("id") String id);

    /**
     * Batch delete images by property
     */
    @Modifying
    @Transactional
    @Query("UPDATE PropertyImage pi SET pi.deletedAt = CURRENT_TIMESTAMP, pi.updatedAt = CURRENT_TIMESTAMP WHERE pi.propertyId = :propertyId AND pi.deletedAt IS NULL")
    int softDeleteByPropertyId(@Param("propertyId") String propertyId);

    /**
     * Check if property has any images
     */
    boolean existsByPropertyIdAndDeletedAtIsNull(String propertyId);
}