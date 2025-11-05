package com.landlord.property.service;

import com.landlord.property.exception.FileUploadException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.CompletedUpload;
import software.amazon.awssdk.transfer.s3.model.UploadRequest;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
public class FileUploadService {

    private final S3Client s3Client;
    private final S3TransferManager transferManager;
    private final String bucketName;
    private final String region;

    public FileUploadService(
            @Value("${aws.s3.bucket-name}") String bucketName,
            @Value("${aws.region}") String region,
            @Value("${aws.access-key-id}") String accessKeyId,
            @Value("${aws.secret-access-key}") String secretAccessKey) {
        
        this.bucketName = bucketName;
        this.region = region;
        
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
                
        this.transferManager = S3TransferManager.builder()
                .s3Client(s3Client)
                .build();
    }

    /**
     * Upload property image to S3
     */
    public String uploadPropertyImage(MultipartFile file, String propertyId, String imageType) {
        validateImageFile(file);
        
        try {
            String fileName = generateFileName("property", propertyId, imageType, file.getOriginalFilename());
            String key = "properties/" + propertyId + "/images/" + fileName;
            
            // Upload original image
            uploadFileToS3(key, file.getInputStream(), file.getContentType(), file.getSize());
            
            // Generate and upload thumbnail
            String thumbnailKey = generateThumbnailKey(key);
            uploadThumbnail(file.getInputStream(), thumbnailKey, file.getContentType());
            
            // Return public URL
            return getPublicUrl(key);
            
        } catch (Exception e) {
            log.error("Failed to upload property image for property {}: {}", propertyId, e.getMessage(), e);
            throw new FileUploadException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Upload unit image to S3
     */
    public String uploadUnitImage(MultipartFile file, String propertyId, String unitId, String imageType) {
        validateImageFile(file);
        
        try {
            String fileName = generateFileName("unit", unitId, imageType, file.getOriginalFilename());
            String key = "properties/" + propertyId + "/units/" + unitId + "/images/" + fileName;
            
            // Upload original image
            uploadFileToS3(key, file.getInputStream(), file.getContentType(), file.getSize());
            
            // Generate and upload thumbnail
            String thumbnailKey = generateThumbnailKey(key);
            uploadThumbnail(file.getInputStream(), thumbnailKey, file.getContentType());
            
            // Return public URL
            return getPublicUrl(key);
            
        } catch (Exception e) {
            log.error("Failed to upload unit image for unit {}: {}", unitId, e.getMessage(), e);
            throw new FileUploadException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Upload general document to S3
     */
    public String uploadDocument(MultipartFile file, String category, String referenceId) {
        validateFile(file);
        
        try {
            String fileName = generateFileName(category, referenceId, "document", file.getOriginalFilename());
            String key = "documents/" + category + "/" + referenceId + "/" + fileName;
            
            uploadFileToS3(key, file.getInputStream(), file.getContentType(), file.getSize());
            
            return getPublicUrl(key);
            
        } catch (Exception e) {
            log.error("Failed to upload document for {}: {}", referenceId, e.getMessage(), e);
            throw new FileUploadException("Failed to upload document: " + e.getMessage(), e);
        }
    }

    /**
     * Get file from S3
     */
    public InputStream downloadFile(String key) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
                    
            ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);
            return response;
            
        } catch (Exception e) {
            log.error("Failed to download file from S3: {}", key, e);
            throw new FileUploadException("Failed to download file: " + e.getMessage(), e);
        }
    }

    /**
     * Delete file from S3
     */
    public void deleteFile(String key) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
                    
            s3Client.deleteObject(request);
            log.info("Successfully deleted file from S3: {}", key);
            
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", key, e);
            throw new FileUploadException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    /**
     * Check if file exists in S3
     */
    public boolean fileExists(String key) {
        try {
            HeadObjectRequest request = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
                    
            s3Client.headObject(request);
            return true;
            
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("Error checking file existence: {}", key, e);
            return false;
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File cannot be null or empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new FileUploadException("File must be an image");
        }
        
        // Check file size (max 10MB for images)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new FileUploadException("Image file size cannot exceed 10MB");
        }
        
        // Check supported formats
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null) {
            String extension = getFileExtension(originalFileName).toLowerCase();
            if (!"jpg".equals(extension) && !"jpeg".equals(extension) && 
                !"png".equals(extension) && !"webp".equals(extension)) {
                throw new FileUploadException("Unsupported image format. Supported formats: JPG, PNG, WebP");
            }
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File cannot be null or empty");
        }
        
        // Check file size (max 50MB for documents)
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new FileUploadException("File size cannot exceed 50MB");
        }
    }

    private void uploadFileToS3(String key, InputStream inputStream, String contentType, long fileSize) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .metadata(java.util.Map.of(
                        "original-filename", inputStream.toString(),
                        "upload-timestamp", LocalDateTime.now().toString()
                    ))
                    .build();
            
            UploadRequest uploadRequest = UploadRequest.builder()
                    .requestBody(RequestBody.fromInputStream(inputStream, fileSize))
                    .putObjectRequest(request)
                    .build();
            
            CompletedUpload upload = transferManager.upload(uploadRequest).completionFuture().join();
            log.info("Successfully uploaded file to S3: {}", key);
            
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", key, e);
            throw new FileUploadException("Failed to upload to S3: " + e.getMessage(), e);
        }
    }

    private void uploadThumbnail(InputStream originalImageStream, String thumbnailKey, String contentType) {
        try {
            // Create thumbnail
            BufferedImage originalImage = ImageIO.read(originalImageStream);
            if (originalImage == null) {
                log.warn("Could not read image for thumbnail generation");
                return;
            }
            
            // Generate thumbnail (max 400x400 pixels)
            int maxSize = 400;
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            
            double ratio = Math.min((double) maxSize / originalWidth, (double) maxSize / originalHeight);
            int thumbnailWidth = (int) (originalWidth * ratio);
            int thumbnailHeight = (int) (originalHeight * ratio);
            
            BufferedImage thumbnail = new BufferedImage(thumbnailWidth, thumbnailHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = thumbnail.createGraphics();
            g.drawImage(originalImage, 0, 0, thumbnailWidth, thumbnailHeight, null);
            g.dispose();
            
            // Convert to bytes
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(thumbnail, "jpg", baos);
            byte[] thumbnailBytes = baos.toByteArray();
            
            // Upload thumbnail
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(thumbnailKey)
                    .contentType("image/jpeg")
                    .build();
            
            UploadRequest uploadRequest = UploadRequest.builder()
                    .requestBody(RequestBody.fromBytes(thumbnailBytes))
                    .putObjectRequest(request)
                    .build();
            
            transferManager.upload(uploadRequest).completionFuture().join();
            log.info("Successfully uploaded thumbnail to S3: {}", thumbnailKey);
            
        } catch (Exception e) {
            log.warn("Failed to generate/upload thumbnail: {}", thumbnailKey, e);
            // Don't fail the entire upload if thumbnail fails
        }
    }

    private String generateFileName(String category, String id, String type, String originalFilename) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFilename);
        
        return String.format("%s_%s_%s_%s.%s", category, id, type, timestamp + uuid, extension);
    }

    private String generateThumbnailKey(String originalKey) {
        String directory = originalKey.substring(0, originalKey.lastIndexOf('/'));
        String filename = originalKey.substring(originalKey.lastIndexOf('/') + 1);
        return directory + "/thumbnails/thumb_" + filename;
    }

    private String getPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "jpg"; // default extension
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}