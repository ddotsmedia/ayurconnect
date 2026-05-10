// First-level admin divisions for the countries our users actually live in.
// Falls back to free-text input for any country not listed here.
//
// Coverage prioritised by Kerala diaspora demographics:
//   India, GCC (UAE, SA, Qatar, Kuwait, Oman, Bahrain),
//   Anglosphere (US, UK, Canada, Australia, NZ, Ireland),
//   Singapore (small enough to not need states).
//
// Data validated against ISO 3166-2 (state-level codes). For India the canonical
// list is 28 states + 8 union territories.

export const COUNTRY_STATES: Record<string, string[]> = {
  IN: [
    // 28 states
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    // 8 union territories
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ],

  // ─── GCC ───
  AE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
  SA: [
    'Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir',
    'Tabuk', 'Hail', 'Northern Borders', 'Jazan', 'Najran', 'Al Bahah', 'Al Jouf', 'Qassim',
  ],
  QA: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Daayen', 'Al Shamal', 'Al Shahaniya'],
  KW: ['Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'],
  OM: [
    'Muscat', 'Dhofar', 'Musandam', 'Al Buraimi', 'Ad Dakhiliyah',
    'North Al Batinah', 'South Al Batinah', 'South Ash Sharqiyah', 'North Ash Sharqiyah', 'Ad Dhahirah', 'Al Wusta',
  ],
  BH: ['Capital', 'Muharraq', 'Northern', 'Southern'],

  // ─── Anglosphere ───
  US: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ],
  GB: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  CA: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
    'Northwest Territories', 'Nunavut', 'Yukon',
  ],
  AU: [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
    'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
  ],
  NZ: [
    'Northland', 'Auckland', 'Waikato', 'Bay of Plenty', 'Gisborne', "Hawke's Bay",
    'Taranaki', 'Manawatu-Whanganui', 'Wellington', 'Tasman', 'Nelson', 'Marlborough',
    'West Coast', 'Canterbury', 'Otago', 'Southland',
  ],
  IE: [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
    'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
  ],

  // ─── Other common ───
  MY: ['Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 'Negeri Sembilan',
       'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'],
  // Singapore is a city-state — no states.
  SG: [],
}

// True if the country has a known state list. False → frontend renders a free-text input.
export function hasStates(countryCode: string): boolean {
  const list = COUNTRY_STATES[countryCode]
  return Array.isArray(list) && list.length > 0
}

export function statesFor(countryCode: string): string[] {
  return COUNTRY_STATES[countryCode] ?? []
}
