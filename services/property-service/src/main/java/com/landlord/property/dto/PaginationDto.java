package com.landlord.property.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationDto {

    @Min(value = 1, message = "Page number must be at least 1")
    private int page = 1;

    @Min(value = 1, message = "Limit must be at least 1")
    @Max(value = 100, message = "Limit cannot exceed 100")
    private int limit = 20;

    @Size(max = 50, message = "Sort field must not exceed 50 characters")
    private String sort = "createdAt";

    @Size(max = 10, message = "Order must not exceed 10 characters")
    private String order = "desc"; // asc or desc

    public int getOffset() {
        return (page - 1) * limit;
    }

    public String getSortField() {
        if (sort == null || sort.trim().isEmpty()) {
            return "createdAt";
        }
        return sort;
    }
}