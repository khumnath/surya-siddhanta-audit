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
 * [Ch. VIII, v.18]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Bha-graha-yuti (Stellar Conjunctions) v.18</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अभिजिद्‌ ब्रह्महृदयं स्वातिवैष्णववासवाः। अहिर्बुघन्यमुदक्स्थत्वान्न वुप्यन्तेऽर्करश्मभिः।
 *
 * **Translation (Burgess):**
 *
 * Abhijit, Brahma-hridaya, Svati, Shravana, Dhanishtha, and Uttara-Bhadrapada... are never hidden by the sun's rays.
 *
 * **Modern Technical Commentary:**
 *
 * Identifies **Abhijit** (Vega) as a primary scriptural asterism. While the ecliptic is mathematically divided into 27 equal segments for planetary motion, Abhijit is recognized here as a fixed stellar entity, forming the '28th Nakshatra' used in electional astrology (Muhurta).
 *
 * </details>
 * Includes 'Abhijit' as a distinct ritual station 
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
 * [Ch. XIV, v.17]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Manadhya (Systems of Measurement) v.17</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * षष्ट्यब्दाः पर्यायाः पञ्चाधिकैः पञ्चभिस्तथा । बृहस्पतेर्मानस्य गौरवः संवत्सरः स च ॥
 *
 * **Translation (Burgess):**
 *
 * Five revolutions of Jupiter make the cycle of sixty years... this is called the Jupiter year (Samvatsara).
 *
 * **Modern Technical Commentary:**
 *
 * This defines the Jovian cycle (Samvatsara). Five revolutions of Jupiter (approximately 60 solar years) constitute a full cycle where each year has a specific traditional name (Prabhava, Vibhava, etc.).
 *
 * </details>
 * Defines the 60-year Jupiter cycle (Barhaspatya Mana). 
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
 * [Ch. I, v.13]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.13</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * तद्द्वद्वात्रिंशता तिथिभिश्चान्द्रो मासस्तत्र ।... मासेर्द्वादशभिर्वर्षं दिव्यं तदह उच्यते ॥
 *
 * **Translation (Burgess):**
 *
 * Twelve months make a year, which is called a day and night of the gods (Devaratripa).
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the year as the fundamental solar cycle. It also introduces the 'Divine Day' concept where one human solar year corresponds to a single day for the gods, centered on the North/South poles (Meru).
 *
 * </details>
 * The 12 months determined by the solar transits into 
 * the 12 signs of the zodiac (Meshadi).
 */
export const MONTH_NAMES = [
  "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Karttika", "Margashirsha", "Pausha", "Magha", "Phalguna", "Chaitra"
];

/** 
 * Siddhantic Tithis (Lunar Days).
 * 
 * [Ch. II, v.66]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.66</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अर्कानिःसृतसश्चन्द्रः प्रत्यूहानि दिने दिने । यदर्कान्तरितो गच्छेद् द्वादशांशैः स वै तिथिः ॥
 *
 * **Translation (Burgess):**
 *
 * The period in which the Moon increases its distance from the Sun by twelve degrees is called a lunar day (Tithi).
 *
 * **Modern Technical Commentary:**
 *
 * Defines the Tithi, the primary element of the Panchanga. It is a relative angular measurement (Moon Longitude - Sun Longitude) rather than a fixed temporal duration, leading to Tithis vary in length between 19 and 26 hours.
 *
 * </details>
 * The 30 lunar days formed by the 12-degree increases 
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
 * [Ch. II, v.65]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.65</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * रवीन्दुयोगविप्ताश्च योगा भभोगभाजिताः।
 *
 * **Translation (Burgess):**
 *
 * The sum of the longitudes of the Sun and Moon, divided by the span of a Nakshatra (800'), are the Yogas (Vishkambha, etc.).
 *
 * </details>
 * The 27 astrological yogas derived from the sum 
 * of solar and lunar longitudes.
 */
export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

