// lib/validators/assessment.ts
import { z } from 'zod';

export const assessmentSchema = z.object({
  demographics: z.object({
    age: z.number().min(1, "العمر مطلوب").max(120, "عمر غير صالح"),
    gender: z.enum(['male', 'female'], { required_error: "الجنس مطلوب" }),
    name: z.string().optional()
  }),
  
  symptoms: z.array(z.object({
    id: z.string(),
    severity: z.number().min(1).max(5),
    duration: z.object({
      value: z.number(),
      unit: z.enum(['days', 'weeks', 'months', 'years'])
    }),
    frequency: z.enum(['continuous', 'daily', 'weekly', 'episodic'])
  })).min(5, "يجب تحديد 5 أعراض على الأقل").max(12, "لا يمكن تحديد أكثر من 12 عرضًا"),
  
  riskAssessment: z.object({
    suicidalRisk: z.enum(['none', 'passive', 'active']),
    harmToOthers: z.boolean(),
    selfHarm: z.boolean()
  }),
  
  substanceHistory: z.object({
    currentUse: z.boolean(),
    substances: z.array(z.object({
      type: z.string(),
      frequency: z.string(),
      lastUse: z.string()
    })).optional()
  }),
  
  medications: z.object({
    current: z.boolean(),
    list: z.array(z.object({
      name: z.string(),
      dose: z.string(),
      frequency: z.string()
    })).optional()
  })
});
