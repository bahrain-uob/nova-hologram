const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Define valid file categories
const VALID_CATEGORIES = ['bookings', 'journal', 'general'];

// Helper function to extract metadata from file key and S3 metadata
const extractFileMetadata = (file, headData) => {
  try {
    const keyParts = file.Key.split('/');
    const category = keyParts[0] || 'unknown';
    const userId = keyParts[1] || 'unknown';
    const fileNameWithTimestamp = keyParts[keyParts.length - 1];
    const dashIndex = fileNameWithTimestamp.indexOf('-');
    const fileName = dashIndex > 0 ? fileNameWithTimestamp.substring(dashIndex + 1) : fileNameWithTimestamp;
    const timestamp = dashIndex > 0 ? fileNameWithTimestamp.substring(0, dashIndex) : null;
    
    // Base metadata
    const metadata = {
      key: file.Key,
      fileName: fileName,
      size: file.Size,
      lastModified: file.LastModified,
      category: category,
      userId: userId,
      contentType: headData.ContentType,
      uploadDate: headData.Metadata['upload-date'] || null
    };
    
    // Add category-specific metadata
    if (category === 'bookings') {
      metadata.bookingDate = headData.Metadata['booking-date'] || null;
      metadata.bookingReference = headData.Metadata['booking-reference'] || null;
      metadata.bookingType = headData.Metadata['booking-type'] || 'standard';
    } else if (category === 'journal') {
      metadata.journalTitle = headData.Metadata['journal-title'] || null;
      metadata.author = headData.Metadata['author'] || null;
      metadata.publicationDate = headData.Metadata['publication-date'] || null;
    }
    
    // Add any other metadata from S3
    Object.keys(headData.Metadata).forEach(key => {
      if (!metadata[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())]) {
        metadata[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = headData.Metadata[key];
      }
    });
    
    return metadata;
  } catch (err) {
    console.error(`Error extracting metadata for ${file.Key}:`, err);
    return {
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      error: 'Failed to extract complete metadata'
    };
  }
};

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  
  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const fileKey = queryParams.key;
    const userId = queryParams.userId;
    const fileCategory = queryParams.category;
    const listFiles = queryParams.list === 'true';
    const metadataFilter = queryParams.filter; // For filtering by metadata fields
    const sortBy = queryParams.sortBy || 'lastModified'; // Default sort by last modified
    const sortOrder = queryParams.sortOrder || 'desc'; // Default sort order descending
    
    // If list parameter is true, list files instead of getting a specific file
    if (listFiles) {
      let prefix = '';
      
      // Validate category if provided
      if (fileCategory && !VALID_CATEGORIES.includes(fileCategory)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Invalid file category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
            allowedCategories: VALID_CATEGORIES
          })
        };
      }
      
      // Build prefix based on provided parameters
      if (fileCategory) {
        prefix = fileCategory + '/';
        if (userId) {
          prefix += userId + '/';
        }
      } else if (userId) {
        // If only userId is provided, search across all categories
        prefix = '';
      }
      
      const listParams = {
        Bucket: 'ReadingMaterialsBucket',
        Prefix: prefix,
        MaxKeys: 1000
      };
      
      const listedObjects = await s3.listObjectsV2(listParams).promise();
      
      // Filter results by userId if provided without category
      let files = listedObjects.Contents || [];
      if (userId && !fileCategory) {
        files = files.filter(file => file.Key.includes(`/${userId}/`));
      }
      
      // Format the response
      const formattedFiles = await Promise.all(files.map(async (file) => {
        // Get object metadata
        const headParams = {
          Bucket: 'ReadingMaterialsBucket',
          Key: file.Key
        };
        
        try {
          const headData = await s3.headObject(headParams).promise();
          return extractFileMetadata(file, headData);
        } catch (err) {
          console.error(`Error getting metadata for ${file.Key}:`, err);
          return {
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            error: 'Failed to retrieve complete metadata'
          };
        }
      }));
      
      // Apply metadata filtering if specified
      let filteredFiles = formattedFiles;
      if (metadataFilter) {
        try {
          const filterObj = JSON.parse(metadataFilter);
          filteredFiles = formattedFiles.filter(file => {
            // Check if file matches all filter criteria
            return Object.keys(filterObj).every(key => {
              // Handle special case for date ranges
              if (key.endsWith('Date') && typeof filterObj[key] === 'object') {
                const fileDate = new Date(file[key] || '1970-01-01');
                const fromDate = filterObj[key].from ? new Date(filterObj[key].from) : new Date(0);
                const toDate = filterObj[key].to ? new Date(filterObj[key].to) : new Date(8640000000000000);
                return fileDate >= fromDate && fileDate <= toDate;
              }
              
              // Regular equality check
              return file[key] === filterObj[key] || 
                     (file[key] && file[key].toString().toLowerCase().includes(filterObj[key].toString().toLowerCase()));
            });
          });
        } catch (err) {
          console.error('Error parsing metadata filter:', err);
          // If filter parsing fails, return the unfiltered results
        }
      }
      
      // Sort the results
      filteredFiles.sort((a, b) => {
        // Handle different data types for sorting
        if (sortBy.endsWith('Date')) {
          const dateA = new Date(a[sortBy] || '1970-01-01').getTime();
          const dateB = new Date(b[sortBy] || '1970-01-01').getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (typeof a[sortBy] === 'string') {
          return sortOrder === 'asc' 
            ? a[sortBy].localeCompare(b[sortBy] || '') 
            : b[sortBy].localeCompare(a[sortBy] || '');
        } else {
          const valA = a[sortBy] || 0;
          const valB = b[sortBy] || 0;
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
      });
      
      // Prepare category-specific summary if a category is specified
      let categorySummary = null;
      if (fileCategory) {
        if (fileCategory === 'bookings') {
          // Get summary stats for bookings
          const bookingDates = filteredFiles
            .filter(file => file.bookingDate)
            .map(file => new Date(file.bookingDate));
          
          categorySummary = {
            totalBookings: filteredFiles.length,
            earliestBooking: bookingDates.length > 0 ? new Date(Math.min(...bookingDates)) : null,
            latestBooking: bookingDates.length > 0 ? new Date(Math.max(...bookingDates)) : null,
            bookingTypes: [...new Set(filteredFiles.map(file => file.bookingType || 'standard'))]
          };
        } else if (fileCategory === 'journal') {
          // Get summary stats for journals
          const authors = [...new Set(filteredFiles.map(file => file.author).filter(Boolean))];
          const titles = [...new Set(filteredFiles.map(file => file.journalTitle).filter(Boolean))];
          
          categorySummary = {
            totalJournals: filteredFiles.length,
            uniqueAuthors: authors.length,
            uniqueTitles: titles.length,
            authors: authors
          };
        }
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          files: filteredFiles,
          count: filteredFiles.length,
          category: fileCategory || 'all',
          summary: categorySummary,
          filters: metadataFilter ? JSON.parse(metadataFilter) : null,
          sortBy: sortBy,
          sortOrder: sortOrder
        })
      };
    }
    
    // If no file key is provided, return an error
    if (!fileKey) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'File key is required for retrieving a specific file'
        })
      };
    }
    
    // Get the file from S3
    const getParams = {
      Bucket: 'ReadingMaterialsBucket',
      Key: fileKey
    };
    
    // Get the file metadata first
    const headData = await s3.headObject(getParams).promise();
    
    // Get the file content
    const fileData = await s3.getObject(getParams).promise();
    
    // Determine if we should return a signed URL or the file content
    const generateUrl = queryParams.url === 'true';
    
    if (generateUrl) {
      // Generate a signed URL for direct access
      const signedUrlExpireSeconds = 60 * 5; // 5 minutes
      
      const url = s3.getSignedUrl('getObject', {
        Bucket: 'ReadingMaterialsBucket',
        Key: fileKey,
        Expires: signedUrlExpireSeconds
      });
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          url: url,
          expiresIn: signedUrlExpireSeconds,
          contentType: headData.ContentType,
          metadata: headData.Metadata
        })
      };
    } else {
      // Return the file content directly
      return {
        statusCode: 200,
        headers: {
          'Content-Type': headData.ContentType,
          'Content-Disposition': `attachment; filename="${fileKey.split('/').pop()}"`,
          'Access-Control-Allow-Origin': '*'
        },
        body: fileData.Body.toString('base64'),
        isBase64Encoded: true
      };
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    
    // Handle case where file doesn't exist
    if (error.code === 'NoSuchKey') {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'File not found',
          error: error.message
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Error retrieving file',
        error: error.message
      })
    };
  }
}