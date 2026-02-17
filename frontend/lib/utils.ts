import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Region {
  name: string
  shortCode: string
}

export interface CountryRegion {
  countryName: string
  countryShortCode: string
  regions: Region[]
}

/**
 * Filter countries based on whitelist, blacklist, and priority options
 */
export function filterCountries(
  countries: CountryRegion[],
  priorityOptions: string[] = [],
  whitelist: string[] = [],
  blacklist: string[] = []
): CountryRegion[] {
  let filteredCountries = [...countries]

  // Apply whitelist
  if (whitelist.length > 0) {
    filteredCountries = filteredCountries.filter((country) =>
      whitelist.includes(country.countryShortCode)
    )
  }

  // Apply blacklist
  if (blacklist.length > 0) {
    filteredCountries = filteredCountries.filter(
      (country) => !blacklist.includes(country.countryShortCode)
    )
  }

  // Apply priority options (move to front)
  if (priorityOptions.length > 0) {
    const priorityCountries = filteredCountries.filter((country) =>
      priorityOptions.includes(country.countryShortCode)
    )
    const nonPriorityCountries = filteredCountries.filter(
      (country) => !priorityOptions.includes(country.countryShortCode)
    )
    filteredCountries = [...priorityCountries, ...nonPriorityCountries]
  }

  return filteredCountries
}
