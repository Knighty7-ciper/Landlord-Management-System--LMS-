package com.landlord.property.dto;

import com.landlord.property.model.PropertyImage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyImageUploadDto {

    @NotBlank(message = "Image URL is required")
    @Size(max = 1000, message = "Image URL must not exceed 1000 characters")
    private String imageUrl;

    @Size(max = 1000, message = "Thumbnail URL must not exceed 1000 characters")
    private String thumbnailUrl;

    @Size(max = 255, message = "Alt text must not exceed 255 characters")
    private String altText;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Image type is required")
    private PropertyImage.ImageType imageType;

    private Long fileSizeBytes;
    private Integer widthPixels;
    private Integer heightPixels;

    @Size(max = 20, message = "Format must not exceed 20 characters")
    private String format; // jpg, png, webp, etc.

    @NotNull(message = "Display order is required")
    private Integer displayOrder = 0;

    private Boolean isPrimary = false;
    private Boolean isFeatured = false;
    private Boolean is360Degree = false;

    @Size(max = 100, message = "Room type must not exceed 100 characters")
    private String roomType; // living_room, bedroom, kitchen, bathroom, exterior, etc.

    @Size(max = 1000, message = "Metadata must not exceed 1000 characters")
    private String metadata;
}