import { z } from "zod"

import { personFieldSchemas } from "@/lib/validation/person"

// Luat "con nguoi" lay tu lib/validation/person — dong bo voi moi form khac.
export const accountSchema = z.object({
  fullName: personFieldSchemas.fullName,
  phone: personFieldSchemas.phone,
})

export const accountPersonalProfileSchema = z.object({
  dateOfBirth: personFieldSchemas.dateOfBirth,
  gender: personFieldSchemas.gender,
  address: personFieldSchemas.address,
  emergencyContact: personFieldSchemas.emergencyContact,
})

export type AccountFormValues = z.infer<typeof accountSchema>
export type AccountPersonalProfileFormValues = z.infer<typeof accountPersonalProfileSchema>
