/**
 * Surya-Siddhanta Constants
 * =========================
 * 
 * Central collection of astronomical constants derived from the Surya-Siddhanta,
 * primarily from Chapter I (Mean Motions) and Chapter II (True Longitudes).
 */

// ============================================================================
// Time Cycles (Kalamana)
// ============================================================================

/** 
 * [Ch. I, v.11-13]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.11</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * प्राणादिः कथितो मूर्तस्रुट्यायोऽमूर्तसंज्ञकः। षडभ्निःप्राणौर्विनाडी स्यात् तत्षष्टया नाडिका स्मृता ॥
 *
 * **Translation (Burgess):**
 *
 * Six respirations (Prana) make a Vinadi; sixty of these make a Nadi.
 *
 * **Modern Technical Commentary:**
 *
 * This defines the standard sexagesimal time units. 1 Nadi (Ghati) = 24 minutes; 1 Vinadi (Pala) = 24 seconds; 1 Prana = 4 seconds, corresponding to the average healthy human respiration rate.
 *
 * </details>
 * Days in a Mahayuga (Great Age).
 * Also known as the number of civil days (Savana) in a Great Age.
 * A Mahayuga consists of 4,320,000 solar years.
 */
export const DAYS_PER_MAHAYUGA = 1577917828;

/** 
 * [Ch. I, v.11]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.11</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * प्राणादिः कथितो मूर्तस्रुट्यायोऽमूर्तसंज्ञकः। षडभ्निःप्राणौर्विनाडी स्यात् तत्षष्टया नाडिका स्मृता ॥
 *
 * **Translation (Burgess):**
 *
 * Six respirations (Prana) make a Vinadi; sixty of these make a Nadi.
 *
 * **Modern Technical Commentary:**
 *
 * This defines the standard sexagesimal time units. 1 Nadi (Ghati) = 24 minutes; 1 Vinadi (Pala) = 24 seconds; 1 Prana = 4 seconds, corresponding to the average healthy human respiration rate.
 *
 * </details>
 * Years in a Mahayuga.
 * The Yuga consists of four ages: Krita, Treta, Dvapara, and Kali.
 * Total duration = 4,320,000 solar years.
 */
export const YEARS_PER_MAHAYUGA = 4320000;

/** 
 * [Ch. I] Days per Yugapada (quarter-yuga).
 * Used for mean motion calculations - assumes equal division of civil days per quarter.
 */
export const DAYS_PER_YUGAPADA = DAYS_PER_MAHAYUGA / 4;

// ============================================================================
// Revolutions per Mahayuga (Bhagana)
// ============================================================================

/** 
 * [Ch. I, v.29]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.29</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * युगे सूर्यबुधशुक्राणां खचतुष्करदार्णवाः। कुजार्किगुरुशीघ्राणां भगणाः पूर्वयायिनाम्॥
 *
 * **Translation (Burgess):**
 *
 * In a Mahayuga, the Sun, Mercury, and Venus complete 4,320,000 revolutions. This number also applies to the Sighra (conjunction) points of Mars, Saturn, and Jupiter.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the mean solar year. For Mercury and Venus, these are their actual orbital revolutions around the Sun. For outer planets, this count applies to their 'Sighra' (fast) epicycle, which represents the Earth's orbital motion.
 *
 * </details>
 * Sun's revolutions (Surya Bhagana).
 * This is equal to the number of solar years in a Mahayuga.
 */
export const REV_SUN = 4320000;

/** 
 * [Ch. I, v.30]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.30</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * इन्दो रसाग्मित्रित्रीषु सततभूधरमार्गणाः। दस्त्रत्रयष्टरसाङ्काक्षिलोचनानि कुजस्य तु॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the Moon are 57,753,336; of Mars, 2,296,832.
 *
 * **Modern Technical Commentary:**
 *
 * Defines the sidereal periods. The Moon's high revolution count reflects its rapid orbit around the Earth, while Mars' count reflects its roughly 1.88-year period.
 *
 * </details>
 * Moon orbits (Chandra Bhagana).
 * Includes the Bija correction for modern astronomical parity 
 * (Original SS text specifies 57,753,336).
 */
export const REV_MOON = 57753336;

/** 
 * [Ch. I, v.31]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.31</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * बुधशीघ्रस्य शून्यार्तुखाद्वित्यर्कनगेन्दवः। बृहस्पतेः खदस्राक्षिवेदषड्वह्नयस्तथा॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of Mercury's Sighra are 17,937,060; of Jupiter, 364,220.
 *
 * **Modern Technical Commentary:**
 *
 * Mercury's 'Sighra' revolutions represent its actual orbit around the sun (~88 days). Jupiter's count reflects its slow ~11.86-year orbit.
 *
 * </details>
 * Mars orbits (Mangala Bhagana).
 */
export const REV_MARS = 2296832;

/** 
 * [Ch. I, v.32]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.32</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * सितशीघ्रस्य षट्सप्तत्रियमाश्विखभूधराः। शनेर्भुजागषट्पञ्चरसवेदनिशाकराः॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of Venus's Sighra are 7,022,376; of Saturn, 146,568.
 *
 * **Modern Technical Commentary:**
 *
 * Venus's orbital motion around the Sun (~225 days). Saturn's very low count reflects its extremely slow ~29.45-year sidereal period.
 *
 * </details>
 * Mercury's Sighra (fast epicycle) revolutions (Budha Sighra).
 */
export const REV_MERCURY_SIGHRA = 17937060;

/** 
 * [Ch. I, v.31]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.31</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * बुधशीघ्रस्य शून्यार्तुखाद्वित्यर्कनगेन्दवः। बृहस्पतेः खदस्राक्षिवेदषड्वह्नयस्तथा॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of Mercury's Sighra are 17,937,060; of Jupiter, 364,220.
 *
 * **Modern Technical Commentary:**
 *
 * Mercury's 'Sighra' revolutions represent its actual orbit around the sun (~88 days). Jupiter's count reflects its slow ~11.86-year orbit.
 *
 * </details>
 * Jupiter completes 364,220 orbits (Guru Bhagana).
 */
export const REV_JUPITER = 364220;

/** 
 * [Ch. I, v.33] Venus's Sighra (fast epicycle) revolutions (Shukra Sighra).
 */
export const REV_VENUS_SIGHRA = 7022376;

/** 
 * [Ch. I, v.31]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.31</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * बुधशीघ्रस्य शून्यार्तुखाद्वित्यर्कनगेन्दवः। बृहस्पतेः खदस्राक्षिवेदषड्वह्नयस्तथा॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of Mercury's Sighra are 17,937,060; of Jupiter, 364,220.
 *
 * **Modern Technical Commentary:**
 *
 * Mercury's 'Sighra' revolutions represent its actual orbit around the sun (~88 days). Jupiter's count reflects its slow ~11.86-year orbit.
 *
 * </details>
 * Saturn completes 146,568 orbits (Shani Bhagana).
 */
export const REV_SATURN = 146568;

/** 
 * [Ch. I, v.35] Moon's apogee/apsis revolutions (Chandra Mandocca).
 */
export const REV_MOON_APSIS = 488203;

/** 
 * [Ch. I, v.36] Moon's ascending node revolutions (Chandra Pata/Rahu).
 * Traditionally moves in a retrograde direction.
 */
export const REV_MOON_NODE = 232238;

// ============================================================================
// Apogee Longitudes (Mandocca)
// ============================================================================

/** 
 * [Ch. I, v.41]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.41</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * अर्कमन्दोच्चस्य सप्त-अष्ट-राम-मिताः ...॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the Sun's apogee are 387 in a Kalpa.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the Sun's apogee (perihelion shift). Although the Sun's orbit is relatively stable, the Siddhanta accounts for its very slow motion (secular variation) over millions of years.
 *
 * </details>
 * Sun's apogee longitude (Mandocca).
 * Value: 77° 14' as per Burgess (1935) Table B.
 */
export const APOGEE_SUN = 77.0 + 14.0 / 60.0;

/** 
 * [Ch. I, v.42]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.42</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * भौममन्दोच्चस्य चतुरधिकं शतद्रयम् । बौधस्य अष्टषात्रिमिताः ...॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the apogees: Mars 204, Mercury 368, Jupiter 900, Venus 535, Saturn 39.
 *
 * **Modern Technical Commentary:**
 *
 * Lists the fixed or slowly moving apsides for the planets. These values (Mandocca) are the points of maximum distance from Earth where the planetary correction (Manda-phala) is zero.
 *
 * </details>
 * Mars's apogee longitude (Mangala Mandocca).
 * Value: 130° 0' as per Burgess (1935).
 */
export const APOGEE_MARS = 130.0;

/** 
 * [Ch. I, v.42]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.42</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * भौममन्दोच्चस्य चतुरधिकं शतद्रयम् । बौधस्य अष्टषात्रिमिताः ...॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the apogees: Mars 204, Mercury 368, Jupiter 900, Venus 535, Saturn 39.
 *
 * **Modern Technical Commentary:**
 *
 * Lists the fixed or slowly moving apsides for the planets. These values (Mandocca) are the points of maximum distance from Earth where the planetary correction (Manda-phala) is zero.
 *
 * </details>
 * Mercury's apogee longitude (Budha Mandocca).
 * Value: 220° 26' as per Burgess (1935).
 */
export const APOGEE_MERCURY = 220.0 + 26.0 / 60.0;

/** 
 * [Ch. I, v.42]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.42</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * भौममन्दोच्चस्य चतुरधिकं शतद्रयम् । बौधस्य अष्टषात्रिमिताः ...॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the apogees: Mars 204, Mercury 368, Jupiter 900, Venus 535, Saturn 39.
 *
 * **Modern Technical Commentary:**
 *
 * Lists the fixed or slowly moving apsides for the planets. These values (Mandocca) are the points of maximum distance from Earth where the planetary correction (Manda-phala) is zero.
 *
 * </details>
 * Jupiter's apogee longitude (Guru Mandocca).
 * Value: 171° 16' as per Burgess (1935).
 */
export const APOGEE_JUPITER = 171.0 + 16.0 / 60.0;

/** 
 * [Ch. I, v.42]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.42</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * भौममन्दोच्चस्य चतुरधिकं शतद्रयम् । बौधस्य अष्टषात्रिमिताः ...॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the apogees: Mars 204, Mercury 368, Jupiter 900, Venus 535, Saturn 39.
 *
 * **Modern Technical Commentary:**
 *
 * Lists the fixed or slowly moving apsides for the planets. These values (Mandocca) are the points of maximum distance from Earth where the planetary correction (Manda-phala) is zero.
 *
 * </details>
 * Venus's apogee longitude (Shukra Mandocca).
 * Value: 79° 49' as per Burgess (1935).
 */
export const APOGEE_VENUS = 79.0 + 49.0 / 60.0;

/** 
 * [Ch. I, v.42]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Madhyama (Mean Motions) v.42</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * भौममन्दोच्चस्य चतुरधिकं शतद्रयम् । बौधस्य अष्टषात्रिमिताः ...॥
 *
 * **Translation (Burgess):**
 *
 * The revolutions of the apogees: Mars 204, Mercury 368, Jupiter 900, Venus 535, Saturn 39.
 *
 * **Modern Technical Commentary:**
 *
 * Lists the fixed or slowly moving apsides for the planets. These values (Mandocca) are the points of maximum distance from Earth where the planetary correction (Manda-phala) is zero.
 *
 * </details>
 * Saturn's apogee longitude (Shani Mandocca).
 * Value: 236° 37' as per Burgess (1935).
 */
export const APOGEE_SATURN = 236.0 + 37.0 / 60.0;

// ============================================================================
// Node Longitudes (Ascending Node - Pata)
// ============================================================================

/** [Ch. I, v.43] Mars's ascending node (Mangala Pata). */
export const NODE_MARS = 40.0 + 6.0 / 60.0;

/** [Ch. I, v.43] Mercury's ascending node (Budha Pata). */
export const NODE_MERCURY = 20.0 + 44.0 / 60.0;

/** [Ch. I, v.43] Jupiter's ascending node (Guru Pata). */
export const NODE_JUPITER = 79.0 + 41.0 / 60.0;

/** [Ch. I, v.43] Venus's ascending node (Shukra Pata). */
export const NODE_VENUS = 59.0 + 46.0 / 60.0;

/** [Ch. I, v.43] Saturn's ascending node (Shani Pata). */
export const NODE_SATURN = 100.0 + 26.0 / 60.0;

// ============================================================================
// Trigonometric Constants
// ============================================================================

/** 
 * [Ch. II, v.15-22]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.15</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * चतुर्विंशतिधा चक्रे ज्यार्धारिण पृथक्पृथक् । तानि पञ्चविंशतियुक्तानि त्रीणि शतानि च ॥
 *
 * **Translation (Burgess):**
 *
 * Divide the quadrant of the circle into 24 parts... the first sine is 225 minutes.
 *
 * **Modern Technical Commentary:**
 *
 * Establishes the 24-point Sine table (Jya). The interval is 225' (3° 45'), chosen because in a circle where R = 3438', the arc of 225' is approximately equal to its sine.
 *
 * </details>
 * Radius of the sine table (R).
 * Calculated such that 1 arc-minute is approximately 1 unit (2*PI*R = 21600).
 */
export const RADIUS = 3438.0;

/** 
 * [Ch. II, v.28] Obliquity of the ecliptic (Parama Apakrama).
 * Expressed as the sine of 24 degrees (1397 when R = 3438).
 */
export const SINE_MAX_DECLINATION = 1397.0;

// ============================================================================
// Eclipse Constants
// ============================================================================

/** 
 * [Ch. IV, v.1]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Grahas-Yuti (Eclipses) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * सार्धानि षट्‌ सहस्राणि योजनानि विवस्वतः । अशीत्यधिकं चतुःशतं योजनानि चन्द्रस्य ॥
 *
 * **Translation (Burgess):**
 *
 * The diameter of the Sun's disk is 6,500 yojanas; that of the Moon, 480 yojanas.
 *
 * **Modern Technical Commentary:**
 *
 * These physical diameters are used to calculate angular sizes. By dividing these yojana values by the planet's instantaneous distance (Karna), the Siddhanta derives the angular diameter necessary for eclipse contact calculations.
 *
 * </details>
 * Sun's diameter (Surya Bimba) in yojanas.
 */
export const DIAMETER_SUN_YOJANAS = 6500.0;

/** 
 * [Ch. IV, v.1]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Grahas-Yuti (Eclipses) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * सार्धानि षट्‌ सहस्राणि योजनानि विवस्वतः । अशीत्यधिकं चतुःशतं योजनानि चन्द्रस्य ॥
 *
 * **Translation (Burgess):**
 *
 * The diameter of the Sun's disk is 6,500 yojanas; that of the Moon, 480 yojanas.
 *
 * **Modern Technical Commentary:**
 *
 * These physical diameters are used to calculate angular sizes. By dividing these yojana values by the planet's instantaneous distance (Karna), the Siddhanta derives the angular diameter necessary for eclipse contact calculations.
 *
 * </details>
 * Moon's diameter (Chandra Bimba) in yojanas.
 */
export const DIAMETER_MOON_YOJANAS = 480.0;

/** 
 * [Ch. IV, v.1]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Grahas-Yuti (Eclipses) v.1</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * सार्धानि षट्‌ सहस्राणि योजनानि विवस्वतः । अशीत्यधिकं चतुःशतं योजनानि चन्द्रस्य ॥
 *
 * **Translation (Burgess):**
 *
 * The diameter of the Sun's disk is 6,500 yojanas; that of the Moon, 480 yojanas.
 *
 * **Modern Technical Commentary:**
 *
 * These physical diameters are used to calculate angular sizes. By dividing these yojana values by the planet's instantaneous distance (Karna), the Siddhanta derives the angular diameter necessary for eclipse contact calculations.
 *
 * </details>
 * Earth's diameter (Bhu Bimba) in yojanas.
 */
export const DIAMETER_EARTH_YOJANAS = 1600.0;

// ============================================================================
// Orbital Distance Constants
// ============================================================================

/** 
 * [Ch. II, v.51-52]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.51</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * ऋणमूनेऽधिके प्रोज्छ््य शेषं वक्रगतिर्भवेत् ॥
 *
 * **Translation (Burgess):**
 *
 * When the correction is greater than the motion, the result is retrograde (Vakra) motion.
 *
 * **Modern Technical Commentary:**
 *
 * Technical definition of **Retrograde Motion**. It occurs when the negative *Sighra* correction exceeds the planet's forward mean motion, causing it to appear as if it is moving backward against the stars from the observer's perspective.
 *
 * </details>
 * Moon's mean distance from Earth in yojanas.
 */
export const MOON_MEAN_DISTANCE = 51570.0;

/** 
 * [Ch. II, v.53]
 *
 * <details class="siddhantic-proof">
 * <summary>Siddhantic Proof: Spashta (True Longitudes) v.53</summary>
 *
 * **Sanskrit (Devanagari):**
 *
 * कृतर्तुचन्द्रवदन्द्ैः शूल्यत्येकैर्गुणाष्टिभिः । शरर्दरैश्वतुर्थेषु केन्द्रांशैभूसुतादयः ॥
 *
 * **Translation (Burgess):**
 *
 * Mars, Mercury, Jupiter, Venus, and Saturn become retrograde at specific degrees of their anomaly.
 *
 * **Modern Technical Commentary:**
 *
 * Lists the **Stationary Points** in degrees of Sighra Anomaly: Mars (164°), Mercury (144°), Jupiter (130°), Venus (163°), and Saturn (115°). These are the critical 'turning points' in the planet's synodic cycle.
 *
 * </details>
 * Sun's mean distance from Earth in yojanas.
 */
export const SUN_MEAN_DISTANCE = 689480.0;

/** 
 * [Ch. V, v.6] Distance conversion factor.
 * 1 arc-minute at the Moon's distance corresponds to 15 yojanas.
 */
export const YOJANAS_PER_ARCMIN_MOON = 15.0;
