/**
 * Siddhantic Nomenclature (Panchanga-namavali)
 * ===========================================
 * 
 * Provides the authoritative Sanskrit terminology for all astronomical 
 * and calendrical entities. This glossary ensures that the library 
 * maintains linguistic and academic parity with the Surya Siddhanta.
 */

/** 
 * Siddhantic Nakshatras (Lunar Mansions).
 * 
 * [Ch. VIII, v.2-6] Defines the names of the 27 equal mathematical 
 * segments (13° 20' each) used to track the Moon's true longitude.
 */
export const NAKSHATRA_NAMES = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

/** 
 * Electional Nakshatras (28-Station System).
 * 
 * [Ch. VIII, v.18] Includes 'Abhijit' as a distinct ritual station 
 * inserted for electional (Muhurta) calculations.
 */
export const NAKSHATRA_NAMES_28 = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Abhijit", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

/** 
 * Jovian Years (Samvatsaras).
 * 
 * [Ch. XIV, v.17] Defines the 60-year Jupiter cycle (Barhaspatya Mana). 
 * These names follow the cyclical motion of Jupiter through the zodiac.
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
 * Electional Yogas (Anandadi).
 * 
 * Traditional 28-yoga cycle used to assess the qualitative energy 
 * of the solar day based on the starting Nakshatra.
 */
export const ANANDADI_YOGA_NAMES = [
  "Ananda", "Kaladanda", "Dhumra", "Prajapati", "Saumya", "Dhvanksha", 
  "Dhvaja", "Shrivatsa", "Vajra", "Mudgara", "Chatra", "Mitra", "Manasa", 
  "Padma", "Lumbaka", "Utpata", "Mrityu", "Kana", "Siddhi", "Shubha", 
  "Amrita", "Musala", "Gada", "Matanga", "Rakshasa", "Chara", "Sthira", 
  "Pravardhamana"
];

/** 
 * Siddhantic Months (Masas).
 * 
 * [Ch. I, v.13] The 12 months determined by the solar transits into 
 * the 12 signs of the zodiac (Meshadi).
 */
export const MONTH_NAMES = [
  "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Karttika", "Margashirsha", "Pausha", "Magha", "Phalguna", "Chaitra"
];

/** 
 * Siddhantic Tithis (Lunar Days).
 * 
 * [Ch. II, v.66] The 30 lunar days formed by the 12-degree increases 
 * in the angular distance between Moon and Sun.
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
 * Solar-Lunar Yogas.
 * 
 * [Ch. II, v.65] The 27 astrological yogas derived from the sum 
 * of solar and lunar longitudes.
 */
export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

