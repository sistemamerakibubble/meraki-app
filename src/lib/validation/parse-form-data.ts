import type { z } from 'zod';

export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      const existing = obj[arrayKey];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[arrayKey] = [value];
      }
    } else if (key in obj) {
      const existing = obj[key];
      obj[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

export function parseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData,
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  return schema.safeParse(formDataToObject(formData));
}
