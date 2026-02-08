/**
 * Converts Date objects to ISO strings for JSON serialization
 * This ensures dates are always strings in API responses
 */
export function serializeDates<T extends Record<string, any>>(obj: T): T {
  const serialized = { ...obj };
  
  for (const [key, value] of Object.entries(serialized)) {
    if (value instanceof Date) {
      (serialized as any)[key] = value.toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (serialized as any)[key] = serializeDates(value);
    } else if (Array.isArray(value)) {
      (serialized as any)[key] = value.map(item => 
        item instanceof Date ? item.toISOString() : 
        (item && typeof item === 'object' ? serializeDates(item) : item)
      );
    }
  }
  
  return serialized;
}
