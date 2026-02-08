# Schema Improvements Guide

## Overview
The Firestore schema has been improved with better structure, type safety, and additional useful fields.

## Key Improvements

### 1. **Better Type Safety**
- ✅ Replaced Drizzle ORM types with Zod schemas (works better with Firestore)
- ✅ Added `ExperienceType` enum for type safety
- ✅ Proper date handling with Firestore Timestamps

### 2. **Additional Fields**

#### Users Collection
- `email` (optional) - For future email notifications
- `updatedAt` - Track when user data was last modified

#### Businesses Collection
- `description` (optional) - Business description
- `address` (optional) - Physical address
- `phone` (optional) - Contact phone number
- `website` (optional) - Business website URL
- `updatedAt` - Track when business was last modified
- `totalScans` - Cached count of QR code scans
- `totalReviews` - Cached count of reviews (auto-updated)
- `averageRating` (optional) - Average rating if ratings are provided

#### Reviews Collection
- `rating` (optional) - 1-5 star rating if user provides it
- `customerEmail` (optional) - For follow-up communications
- `ipAddress` (optional) - For rate limiting (should be hashed)
- `userAgent` (optional) - Device/browser info for analytics

### 3. **Better Data Organization**
- ✅ Proper Timestamp handling (Firestore native)
- ✅ Automatic `updatedAt` tracking on updates
- ✅ Better slug generation (handles edge cases)
- ✅ Auto-incrementing review counts on businesses

### 4. **Performance Optimizations**

#### Required Firestore Indexes
Create these composite indexes in Firebase Console for optimal query performance:

**businesses collection:**
1. `ownerId` (Ascending) + `createdAt` (Descending)
   - Used for: Getting user's businesses sorted by newest
2. `slug` (Ascending)
   - Used for: Quick lookups by slug (unique)

**reviews collection:**
1. `businessId` (Ascending) + `createdAt` (Descending)
   - Used for: Getting reviews for a business, newest first
2. `businessId` (Ascending) + `experienceType` (Ascending)
   - Used for: Filtering reviews by type (great/concern)

**users collection:**
1. `username` (Ascending)
   - Used for: Quick username lookups (unique)

### 5. **Code Improvements**
- ✅ Better error handling
- ✅ Automatic business review count updates
- ✅ Proper undefined value handling (Firestore doesn't support undefined)
- ✅ Type-safe schemas throughout

## Migration Steps

### 1. Update Existing Documents (Optional)
If you have existing data, you can add the new optional fields:

```javascript
// Example: Add updatedAt to existing businesses
const businesses = await db.collection('businesses').get();
const batch = db.batch();
businesses.docs.forEach(doc => {
  if (!doc.data().updatedAt) {
    batch.update(doc.ref, { updatedAt: doc.data().createdAt || Timestamp.now() });
  }
});
await batch.commit();
```

### 2. Create Firestore Indexes
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Create each index listed above

### 3. Update Your Code
The schema changes are backward compatible. Existing code will continue to work, but you can now:
- Use new optional fields when creating/updating businesses
- Track review counts automatically
- Add ratings to reviews
- Use better type safety

## Example Usage

### Creating a Business with New Fields
```typescript
const business = await storage.createBusiness({
  ownerId: 1,
  name: "My Restaurant",
  category: "Restaurant",
  googleReviewUrl: "https://g.page/r/example",
  focusAreas: ["Food Quality", "Service"],
  description: "A great place to eat", // NEW
  address: "123 Main St", // NEW
  phone: "+1234567890", // NEW
  website: "https://myrestaurant.com", // NEW
});
```

### Creating a Review with Rating
```typescript
const review = await storage.createReview({
  businessId: 1,
  experienceType: "great",
  selectedTags: ["Food Quality"],
  content: "Amazing food!",
  rating: 5, // NEW
  customerEmail: "customer@example.com", // NEW
});
```

## Benefits

1. **Better Analytics**: Track scans, reviews, and ratings
2. **Type Safety**: Zod schemas catch errors at compile time
3. **Performance**: Proper indexes for fast queries
4. **Scalability**: Better structure for future features
5. **Maintainability**: Clear schema definitions

## Next Steps

1. ✅ Code is already updated
2. ⏳ Create Firestore indexes (see above)
3. ⏳ (Optional) Migrate existing data to add new fields
4. ✅ Start using new optional fields in your UI
