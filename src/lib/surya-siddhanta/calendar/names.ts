/**
 * Astrological Nomenclature and Canonical Names
 * ============================================
 * 
 * Provides the authoritative Sanskrit terminology for all Panchanga 
 * elements as defined in the Surya-Siddhanta and its commentaries.
 */

/** 
 * [Ch. VIII, v.2-6] The 27 Lunar Mansions (Nakshatras).
 * These are equal 13° 20' divisions used for planetary longitudes.
 */
export const NAKSHATRA_NAMES = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

/** 
 * The 28-Nakshatra system (Muhurta).
 * Includes the intercalary star 'Abhijit' inserted between 
 * Uttara Ashadha and Shravana.
 */
export const NAKSHATRA_NAMES_28 = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Abhijit", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

/** 
 * [Ch. XIV, v.17] The 60-year Jupiter cycle (Samvatsara).
 * These names follow the Barhaspatya Mana (Jupiter Motion).
 */
export const SAMVATSARA_NAMES = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", 
  "Shrimukha", "Bhava", "Yuva", "Dhata", "Ishvara", "Bahudhanya", 
  "Pramathi", "Vikrama", "Vrisha", "Chitrabhanu", "Svabhanu", "Tarana", 
  "Parthiva", "Vyaya", "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", 
  "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi", 
  "Hemalamba", "Vilamba", "Vikari", "Sharvari", "Plava", "Shubhakrit", 
  "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", 
  "Saumya", "Sadharana", "Virodhakrit", "Paridhavi", "Pramadin", "Ananda", 
  "Rakshasa", "Anala (Nala)", "Pingala", "Kalayukta", "Siddharthi", "Raudra", 
  "Durmati", "Dundubhi", "Rudhirodgari", "Raktaksha", "Krodhana", "Akshaya (Kshaya)"
];

/** 
 * The 28 Anandadi Yogas (Muhurta).
 * Determined by the daily combination of Weekday and Star.
 */
export const ANANDADI_YOGA_NAMES = [
  "Ananda", "Kaladanda", "Dhumra", "Prajapati", "Saumya", "Dhvanksha", 
  "Dhvaja", "Shrivatsa", "Vajra", "Mudgara", "Chatra", "Mitra", "Manasa", 
  "Padma", "Lumbaka", "Utpata", "Mrityu", "Kana", "Siddhi", "Shubha", 
  "Amrita", "Musala", "Gada", "Matanga", "Rakshasa", "Chara", "Sthira", 
  "Pravardhamana"
];

/** 
 * [Ch. I, v.13] The 12 Lunar Months.
 */
export const MONTH_NAMES = [
  "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Karttika", "Margashirsha", "Pausha", "Magha", "Phalguna", "Chaitra"
];

/** 
 * [Ch. II, v.66] The 30 Lunar Days (Tithis).
 */
export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi", "Amavasya"
];

/** 
 * [Ch. II, v.65] The 27 Astrological Yogas.
 */
export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

