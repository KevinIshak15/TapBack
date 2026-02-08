# Firebase Firestore Integration

## Setup Complete ✅

The application has been migrated from PostgreSQL to Firebase Firestore.

## Configuration

The Firebase configuration is set up in `server/db.ts` with your project:
- **Project ID**: `tapback-232a1`

## Authentication Options

The Firebase Admin SDK supports multiple authentication methods (checked in order):

### Option 1: Service Account JSON File (✅ Currently Configured)
The app automatically looks for `firebase-service-account.json` in the project root.
**Your service account file has been saved and configured!**

### Option 2: Environment Variable (GOOGLE_APPLICATION_CREDENTIALS)
Set the path to your service account JSON file:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### Option 3: Service Account as Environment Variable (FIREBASE_SERVICE_ACCOUNT)
Set the service account JSON as a string in environment variable:
```bash
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### Option 4: Default Credentials (Firebase Cloud Functions)
If running on Firebase Cloud Functions or Google Cloud, it will automatically use default credentials.

### Option 5: Project ID Only (Fallback)
As a last resort, the app will try to use the project ID directly. This may require:
- Google Cloud SDK installed and authenticated
- Or running in an environment with default credentials

## Firestore Collections

The following collections are used:
- `users` - User accounts
- `businesses` - Business profiles
- `reviews` - Customer reviews

## Migration Notes

- Document IDs are numeric strings (e.g., "1", "2", "3")
- Timestamps are stored as Firestore Timestamps and converted to JavaScript Dates
- All existing API endpoints remain unchanged
- Session storage uses memory store (Firestore sessions would require additional setup)

## Testing

Run the seed script to populate test data:
```bash
npm run seed  # If you have a seed script, or run: tsx server/seed.ts
```

## Next Steps

1. Set up Firebase Authentication rules in Firestore Console
2. Configure Firestore security rules
3. (Optional) Set up service account for production deployment
