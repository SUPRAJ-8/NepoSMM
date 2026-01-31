# Service Name Sanitization System

## Overview
This system automatically removes provider branding from service and category names during sync, ensuring your customers only see clean, professional names without competitor branding.

## How It Works

### 1. Database Schema
We store **4 versions** of each name:

| Field | Purpose | Example |
|-------|---------|---------|
| `original_name` | Raw from API (never shown) | "GlobalSMM - Instagram Followers" |
| `display_name` | Cleaned version (shown to users) | "Instagram Followers" |
| `name` | Backward compatibility | Same as original_name |
| `original_category` | Raw category from API | "GlobalSMM Instagram" |
| `display_category` | Cleaned category | "Instagram" |
| `category` | Backward compatibility | Same as original_category |

### 2. Sanitization Logic (`utils/sanitize.ts`)

The `sanitizeServiceName()` function:
1. **Removes provider branding** (e.g., "GlobalSMM", "Global SMM", "GLOBALSMM")
2. **Removes symbols** (|, -, _, /)
3. **Cleans whitespace**
4. **Preserves original if cleaning fails**

```typescript
sanitizeServiceName("GlobalSMM | Instagram Followers", "GlobalSMM")
// Returns: "Instagram Followers"
```

### 3. Sync Process

**When syncing services:**
1. Fetch raw data from provider API
2. Generate provider aliases (GlobalSMM, Global-SMM, GLOBALSMM, etc.)
3. Clean the name ONCE using `sanitizeServiceName()`
4. Store BOTH original and cleaned versions
5. For updates: preserve user's manual renames

**For NEW services:**
```sql
INSERT INTO services (
    original_name,  -- "GlobalSMM Instagram Followers"
    display_name,   -- "Instagram Followers" (auto-cleaned)
    ...
)
```

**For EXISTING services:**
- If user manually renamed → keep their custom name
- If not manually renamed → update with new cleaned name

### 4. Frontend Display

The API automatically returns `display_name` and `display_category`:

```typescript
// Backend query uses COALESCE
SELECT COALESCE(s.display_name, s.name) as name
```

**Result:** Frontend always receives clean names, no additional processing needed.

## Benefits

✅ **Clean Once**: Sanitization happens during sync, not on every page load
✅ **Preserve Customization**: Manual renames are never overwritten
✅ **No Frontend Logic**: UI components don't need to know about cleaning
✅ **Backward Compatible**: Old `name` field still exists
✅ **Provider Agnostic**: Works with any provider's naming convention

## API Endpoints

### Get Services (Returns cleaned names)
```
GET /api/services
Response: [{ name: "Instagram Followers", category: "Instagram", ... }]
```

### Update Service Display Name (Manual rename)
```
PATCH /api/services/:id
Body: { display_name: "My Custom Name" }
```

## Example Flow

1. **Provider API returns:**
   ```json
   {
     "name": "GlobalSMM | Instagram Followers | Fast",
     "category": "GlobalSMM - Instagram"
   }
   ```

2. **After sync (stored in DB):**
   ```json
   {
     "original_name": "GlobalSMM | Instagram Followers | Fast",
     "display_name": "Instagram Followers Fast",
     "original_category": "GlobalSMM - Instagram",
     "display_category": "Instagram"
   }
   ```

3. **User sees:**
   ```
   Service: Instagram Followers Fast
   Category: Instagram
   ```

## Maintenance

To update sanitization rules, edit `backend/src/utils/sanitize.ts`:
- Add more symbols to remove
- Adjust whitespace handling
- Add special cases for specific providers

No database changes or frontend updates needed!
