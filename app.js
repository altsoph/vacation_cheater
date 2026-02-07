// ===================================================================
// Vacation Cheater — Vacation Day Optimizer
// Pure client-side calendar with dual public-holiday API integration
// Primary: OpenHolidaysAPI (more precise, subdivision-aware)
// Secondary: Nager.Date (wider country coverage, cross-reference)
// ===================================================================

(function () {
  'use strict';

  // ===== Constants =====

  const NAGER_API = 'https://date.nager.at/api/v3';
  const OPENHOLIDAYS_API = 'https://openholidaysapi.org';

  // Countries supported by OpenHolidaysAPI (from their /Countries endpoint)
  const OPENHOLIDAYS_COUNTRIES = new Set([
    'AD', 'AL', 'AT', 'BE', 'BG', 'BR', 'BY', 'CH', 'CZ', 'DE',
    'EE', 'ES', 'FR', 'HR', 'HU', 'IE', 'IT', 'LI', 'LT', 'LU',
    'LV', 'MC', 'MD', 'MT', 'MX', 'NL', 'PL', 'PT', 'RO', 'RS',
    'SE', 'SI', 'SK', 'SM', 'VA', 'ZA'
  ]);

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Countries supported by Nager.Date API (comprehensive list)
  const COUNTRIES = [
    { code: 'AD', name: 'Andorra' },
    { code: 'AL', name: 'Albania' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AT', name: 'Austria' },
    { code: 'AU', name: 'Australia' },
    { code: 'AX', name: 'Åland Islands' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BZ', name: 'Belize' },
    { code: 'CA', name: 'Canada' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'DE', name: 'Germany' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EE', name: 'Estonia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'ES', name: 'Spain' },
    { code: 'FI', name: 'Finland' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GR', name: 'Greece' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HR', name: 'Croatia' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HU', name: 'Hungary' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IT', name: 'Italy' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'LV', name: 'Latvia' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MD', name: 'Moldova' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'MT', name: 'Malta' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'PA', name: 'Panama' },
    { code: 'PE', name: 'Peru' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'RO', name: 'Romania' },
    { code: 'RS', name: 'Serbia' },
    { code: 'RU', name: 'Russia' },
    { code: 'SE', name: 'Sweden' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SM', name: 'San Marino' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'ZW', name: 'Zimbabwe' }
  ];

  // Subdivisions for countries with regional holidays
  const SUBDIVISIONS = {
    DE: [
      { code: 'DE-BW', name: 'Baden-Württemberg', short: 'BW' },
      { code: 'DE-BY', name: 'Bayern', short: 'BY' },
      { code: 'DE-BE', name: 'Berlin', short: 'BE' },
      { code: 'DE-BB', name: 'Brandenburg', short: 'BB' },
      { code: 'DE-HB', name: 'Bremen', short: 'HB' },
      { code: 'DE-HH', name: 'Hamburg', short: 'HH' },
      { code: 'DE-HE', name: 'Hessen', short: 'HE' },
      { code: 'DE-MV', name: 'Mecklenburg-Vorpommern', short: 'MV' },
      { code: 'DE-NI', name: 'Niedersachsen', short: 'NI' },
      { code: 'DE-NW', name: 'Nordrhein-Westfalen', short: 'NW' },
      { code: 'DE-RP', name: 'Rheinland-Pfalz', short: 'RP' },
      { code: 'DE-SL', name: 'Saarland', short: 'SL' },
      { code: 'DE-SN', name: 'Sachsen', short: 'SN' },
      { code: 'DE-ST', name: 'Sachsen-Anhalt', short: 'ST' },
      { code: 'DE-SH', name: 'Schleswig-Holstein', short: 'SH' },
      { code: 'DE-TH', name: 'Thüringen', short: 'TH' }
    ],
    AT: [
      { code: 'AT-1', name: 'Burgenland', short: '1' },
      { code: 'AT-2', name: 'Kärnten', short: '2' },
      { code: 'AT-3', name: 'Niederösterreich', short: '3' },
      { code: 'AT-4', name: 'Oberösterreich', short: '4' },
      { code: 'AT-5', name: 'Salzburg', short: '5' },
      { code: 'AT-6', name: 'Steiermark', short: '6' },
      { code: 'AT-7', name: 'Tirol', short: '7' },
      { code: 'AT-8', name: 'Vorarlberg', short: '8' },
      { code: 'AT-9', name: 'Wien', short: '9' }
    ],
    CH: [
      { code: 'CH-AG', name: 'Aargau', short: 'AG' },
      { code: 'CH-AI', name: 'Appenzell Innerrhoden', short: 'AI' },
      { code: 'CH-AR', name: 'Appenzell Ausserrhoden', short: 'AR' },
      { code: 'CH-BE', name: 'Bern', short: 'BE' },
      { code: 'CH-BL', name: 'Basel-Landschaft', short: 'BL' },
      { code: 'CH-BS', name: 'Basel-Stadt', short: 'BS' },
      { code: 'CH-FR', name: 'Fribourg', short: 'FR' },
      { code: 'CH-GE', name: 'Genève', short: 'GE' },
      { code: 'CH-GL', name: 'Glarus', short: 'GL' },
      { code: 'CH-GR', name: 'Graubünden', short: 'GR' },
      { code: 'CH-JU', name: 'Jura', short: 'JU' },
      { code: 'CH-LU', name: 'Luzern', short: 'LU' },
      { code: 'CH-NE', name: 'Neuchâtel', short: 'NE' },
      { code: 'CH-NW', name: 'Nidwalden', short: 'NW' },
      { code: 'CH-OW', name: 'Obwalden', short: 'OW' },
      { code: 'CH-SG', name: 'St. Gallen', short: 'SG' },
      { code: 'CH-SH', name: 'Schaffhausen', short: 'SH' },
      { code: 'CH-SO', name: 'Solothurn', short: 'SO' },
      { code: 'CH-SZ', name: 'Schwyz', short: 'SZ' },
      { code: 'CH-TG', name: 'Thurgau', short: 'TG' },
      { code: 'CH-TI', name: 'Ticino', short: 'TI' },
      { code: 'CH-UR', name: 'Uri', short: 'UR' },
      { code: 'CH-VD', name: 'Vaud', short: 'VD' },
      { code: 'CH-VS', name: 'Valais', short: 'VS' },
      { code: 'CH-ZG', name: 'Zug', short: 'ZG' },
      { code: 'CH-ZH', name: 'Zürich', short: 'ZH' }
    ],
    AU: [
      { code: 'AU-ACT', name: 'Australian Capital Territory', short: 'ACT' },
      { code: 'AU-NSW', name: 'New South Wales', short: 'NSW' },
      { code: 'AU-NT', name: 'Northern Territory', short: 'NT' },
      { code: 'AU-QLD', name: 'Queensland', short: 'QLD' },
      { code: 'AU-SA', name: 'South Australia', short: 'SA' },
      { code: 'AU-TAS', name: 'Tasmania', short: 'TAS' },
      { code: 'AU-VIC', name: 'Victoria', short: 'VIC' },
      { code: 'AU-WA', name: 'Western Australia', short: 'WA' }
    ],
    CA: [
      { code: 'CA-AB', name: 'Alberta', short: 'AB' },
      { code: 'CA-BC', name: 'British Columbia', short: 'BC' },
      { code: 'CA-MB', name: 'Manitoba', short: 'MB' },
      { code: 'CA-NB', name: 'New Brunswick', short: 'NB' },
      { code: 'CA-NL', name: 'Newfoundland and Labrador', short: 'NL' },
      { code: 'CA-NS', name: 'Nova Scotia', short: 'NS' },
      { code: 'CA-ON', name: 'Ontario', short: 'ON' },
      { code: 'CA-PE', name: 'Prince Edward Island', short: 'PE' },
      { code: 'CA-QC', name: 'Québec', short: 'QC' },
      { code: 'CA-SK', name: 'Saskatchewan', short: 'SK' }
    ],
    US: [
      { code: 'US-AL', name: 'Alabama', short: 'AL' },
      { code: 'US-AK', name: 'Alaska', short: 'AK' },
      { code: 'US-AZ', name: 'Arizona', short: 'AZ' },
      { code: 'US-AR', name: 'Arkansas', short: 'AR' },
      { code: 'US-CA', name: 'California', short: 'CA' },
      { code: 'US-CO', name: 'Colorado', short: 'CO' },
      { code: 'US-CT', name: 'Connecticut', short: 'CT' },
      { code: 'US-DE', name: 'Delaware', short: 'DE' },
      { code: 'US-FL', name: 'Florida', short: 'FL' },
      { code: 'US-GA', name: 'Georgia', short: 'GA' },
      { code: 'US-HI', name: 'Hawaii', short: 'HI' },
      { code: 'US-ID', name: 'Idaho', short: 'ID' },
      { code: 'US-IL', name: 'Illinois', short: 'IL' },
      { code: 'US-IN', name: 'Indiana', short: 'IN' },
      { code: 'US-IA', name: 'Iowa', short: 'IA' },
      { code: 'US-KS', name: 'Kansas', short: 'KS' },
      { code: 'US-KY', name: 'Kentucky', short: 'KY' },
      { code: 'US-LA', name: 'Louisiana', short: 'LA' },
      { code: 'US-ME', name: 'Maine', short: 'ME' },
      { code: 'US-MD', name: 'Maryland', short: 'MD' },
      { code: 'US-MA', name: 'Massachusetts', short: 'MA' },
      { code: 'US-MI', name: 'Michigan', short: 'MI' },
      { code: 'US-MN', name: 'Minnesota', short: 'MN' },
      { code: 'US-MS', name: 'Mississippi', short: 'MS' },
      { code: 'US-MO', name: 'Missouri', short: 'MO' },
      { code: 'US-MT', name: 'Montana', short: 'MT' },
      { code: 'US-NE', name: 'Nebraska', short: 'NE' },
      { code: 'US-NV', name: 'Nevada', short: 'NV' },
      { code: 'US-NH', name: 'New Hampshire', short: 'NH' },
      { code: 'US-NJ', name: 'New Jersey', short: 'NJ' },
      { code: 'US-NM', name: 'New Mexico', short: 'NM' },
      { code: 'US-NY', name: 'New York', short: 'NY' },
      { code: 'US-NC', name: 'North Carolina', short: 'NC' },
      { code: 'US-ND', name: 'North Dakota', short: 'ND' },
      { code: 'US-OH', name: 'Ohio', short: 'OH' },
      { code: 'US-OK', name: 'Oklahoma', short: 'OK' },
      { code: 'US-OR', name: 'Oregon', short: 'OR' },
      { code: 'US-PA', name: 'Pennsylvania', short: 'PA' },
      { code: 'US-RI', name: 'Rhode Island', short: 'RI' },
      { code: 'US-SC', name: 'South Carolina', short: 'SC' },
      { code: 'US-SD', name: 'South Dakota', short: 'SD' },
      { code: 'US-TN', name: 'Tennessee', short: 'TN' },
      { code: 'US-TX', name: 'Texas', short: 'TX' },
      { code: 'US-UT', name: 'Utah', short: 'UT' },
      { code: 'US-VT', name: 'Vermont', short: 'VT' },
      { code: 'US-VA', name: 'Virginia', short: 'VA' },
      { code: 'US-WA', name: 'Washington', short: 'WA' },
      { code: 'US-WV', name: 'West Virginia', short: 'WV' },
      { code: 'US-WI', name: 'Wisconsin', short: 'WI' },
      { code: 'US-WY', name: 'Wyoming', short: 'WY' },
      { code: 'US-DC', name: 'District of Columbia', short: 'DC' }
    ]
  };

  // Default subdivisions per country
  const DEFAULT_SUBDIVISION = {
    DE: 'DE-BE',
    AT: 'AT-9',
    CH: 'CH-ZH',
    AU: 'AU-NSW',
    CA: 'CA-ON',
    US: 'US-NY'
  };

  // ===== Application State =====

  const state = {
    year: new Date().getFullYear(),
    country: 'DE',
    subdivision: 'DE-BE',
    vacationDays: 20,
    consecutiveDays: 0,
    countWeekends: false,
    theme: 'dark',

    // Raw API results
    openHolidays: [],   // from OpenHolidaysAPI (primary)
    nagerHolidays: [],  // from Nager.Date (secondary)

    // Processed maps: dateStr -> { holidays: [...], source: 'confirmed'|'nager-only' }
    holidayMap: new Map(),

    // Warnings for Nager-only holidays
    warnings: [],

    // Vacation editor
    vacationDates: new Set(), // set of 'YYYY-MM-DD' strings
    startDate: null           // Date object — optimizer start date
  };

  // ===== DOM References =====

  const dom = {
    yearInput: null,
    countrySelect: null,
    stateGroup: null,
    stateSelect: null,
    vacationDays: null,
    consecutiveDays: null,
    countWeekends: null,
    calendarGrid: null,
    themeToggle: null,
    themeLabel: null,
    loadingIndicator: null,
    holidayInfo: null,
    warningBanner: null,
    legendUnconfirmed: null,
    vacationCounter: null,
    vacationUsed: null,
    vacationTotal: null,
    startDateInput: null,
    btnOptimize: null,
    btnClear: null,
    btnExport: null,
    optimizerStats: null
  };

  // ===== Initialization =====

  function init() {
    cacheDom();
    loadTheme();
    populateCountries();
    setupEventListeners();

    // Set defaults
    dom.yearInput.value = state.year;
    dom.countrySelect.value = state.country;
    updateSubdivisions();
    updateVacationCounter();
    setDefaultStartDate();

    // Fetch holidays and render
    fetchHolidaysAndRender();
  }

  function cacheDom() {
    dom.yearInput = document.getElementById('year-input');
    dom.countrySelect = document.getElementById('country-select');
    dom.stateGroup = document.getElementById('state-group');
    dom.stateSelect = document.getElementById('state-select');
    dom.vacationDays = document.getElementById('vacation-days');
    dom.consecutiveDays = document.getElementById('consecutive-days');
    dom.countWeekends = document.getElementById('count-weekends');
    dom.calendarGrid = document.getElementById('calendar-grid');
    dom.themeToggle = document.getElementById('theme-toggle');
    dom.themeLabel = document.getElementById('theme-label');
    dom.loadingIndicator = document.getElementById('loading-indicator');
    dom.holidayInfo = document.getElementById('holiday-info');
    dom.warningBanner = document.getElementById('warning-banner');
    dom.legendUnconfirmed = document.getElementById('legend-unconfirmed');
    dom.vacationCounter = document.getElementById('vacation-counter');
    dom.vacationUsed = document.getElementById('vacation-used');
    dom.vacationTotal = document.getElementById('vacation-total');
    dom.startDateInput = document.getElementById('start-date');
    dom.btnOptimize = document.getElementById('btn-optimize');
    dom.btnClear = document.getElementById('btn-clear');
    dom.btnExport = document.getElementById('btn-export');
    dom.optimizerStats = document.getElementById('optimizer-stats');
  }

  // ===== Theme Management =====

  function loadTheme() {
    const saved = localStorage.getItem('vacationcheater-theme');
    if (saved === 'light' || saved === 'dark') {
      state.theme = saved;
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        state.theme = 'light';
      }
    }
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (dom.themeLabel) {
      dom.themeLabel.textContent = state.theme === 'dark' ? 'DARK' : 'LIGHT';
    }
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = state.theme === 'dark' ? '#00ff00' : '#2d6a4f';
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('vacationcheater-theme', state.theme);
    applyTheme();
  }

  // ===== Country / Subdivision Selectors =====

  function populateCountries() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < COUNTRIES.length; i++) {
      var c = COUNTRIES[i];
      var opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.name + ' (' + c.code + ')';
      frag.appendChild(opt);
    }
    dom.countrySelect.appendChild(frag);
  }

  function updateSubdivisions() {
    var subs = SUBDIVISIONS[state.country];
    if (subs && subs.length > 0) {
      dom.stateGroup.style.display = '';
      dom.stateSelect.innerHTML = '';

      var allOpt = document.createElement('option');
      allOpt.value = '';
      allOpt.textContent = 'All (national only)';
      dom.stateSelect.appendChild(allOpt);

      var frag = document.createDocumentFragment();
      for (var i = 0; i < subs.length; i++) {
        var s = subs[i];
        var opt = document.createElement('option');
        opt.value = s.code;
        opt.textContent = s.name + ', ' + s.short;
        frag.appendChild(opt);
      }
      dom.stateSelect.appendChild(frag);

      var defaultSub = DEFAULT_SUBDIVISION[state.country] || '';
      state.subdivision = defaultSub;
      dom.stateSelect.value = defaultSub;
    } else {
      dom.stateGroup.style.display = 'none';
      state.subdivision = '';
    }
  }

  // ===== Holiday API Fetching =====

  /**
   * Fetch from OpenHolidaysAPI (primary, more precise).
   * Returns array of { date, localName, name } or empty on failure.
   */
  async function fetchOpenHolidays() {
    if (!OPENHOLIDAYS_COUNTRIES.has(state.country)) {
      return []; // not supported
    }

    var params = 'countryIsoCode=' + state.country +
      '&validFrom=' + state.year + '-01-01' +
      '&validTo=' + state.year + '-12-31' +
      '&languageIsoCode=EN';

    if (state.subdivision) {
      params += '&subdivisionCode=' + state.subdivision;
    }

    var url = OPENHOLIDAYS_API + '/PublicHolidays?' + params;

    try {
      var response = await fetch(url);
      if (!response.ok) throw new Error('OpenHolidays returned ' + response.status);
      var raw = await response.json();

      // Normalize to our format
      return raw.map(function (h) {
        // Extract name: prefer the first name entry
        var nameText = '';
        if (h.name && h.name.length > 0) {
          nameText = h.name[0].text;
        }

        // Determine if nationwide or filter to national-only when no subdivision
        var isNational = h.nationwide === true;

        return {
          date: h.startDate,
          localName: nameText,
          name: nameText,
          nationwide: isNational
        };
      }).filter(function (h) {
        // When no subdivision selected, only include national holidays
        if (!state.subdivision) {
          return h.nationwide;
        }
        // When subdivision is selected, the API already filters for us
        return true;
      });
    } catch (err) {
      console.warn('OpenHolidaysAPI fetch failed:', err);
      return [];
    }
  }

  /**
   * Fetch from Nager.Date API (secondary, wider coverage).
   * Returns the raw Nager response array or empty on failure.
   */
  async function fetchNagerHolidays() {
    var url = NAGER_API + '/PublicHolidays/' + state.year + '/' + state.country;

    try {
      var response = await fetch(url);
      if (!response.ok) throw new Error('Nager returned ' + response.status);
      return await response.json();
    } catch (err) {
      console.warn('Nager.Date fetch failed:', err);
      return [];
    }
  }

  /**
   * Filter Nager holidays by the selected subdivision.
   * Returns only holidays applicable to the current subdivision.
   */
  function filterNagerBySubdivision(nagerRaw) {
    return nagerRaw.filter(function (h) {
      if (state.subdivision) {
        // Include if global or our subdivision is listed
        return !h.counties || h.counties.length === 0 || h.counties.indexOf(state.subdivision) !== -1;
      } else {
        // National only
        return !h.counties || h.counties.length === 0;
      }
    });
  }

  /**
   * Main fetch: get both APIs in parallel, cross-reference, build holiday map.
   */
  async function fetchHolidaysAndRender() {
    dom.loadingIndicator.classList.add('active');
    dom.holidayInfo.textContent = '';

    // Fetch both APIs in parallel
    var results = await Promise.all([
      fetchOpenHolidays(),
      fetchNagerHolidays()
    ]);

    state.openHolidays = results[0];
    state.nagerHolidays = results[1];

    // Clear vacation selections when holidays change
    state.vacationDates.clear();

    buildHolidayMap();
    setDefaultStartDate();
    renderCalendar();
    updateHolidayInfo();
    updateWarnings();
    updateVacationCounter();
    hideOptimizerStats();

    dom.loadingIndicator.classList.remove('active');
  }

  /**
   * Build the unified holiday map by cross-referencing both APIs.
   * - Holidays in OpenHolidays → confirmed
   * - Holidays in Nager only → nager-only (with warning)
   * - Holidays in OpenHolidays only → confirmed (OpenHolidays is authoritative)
   */
  function buildHolidayMap() {
    state.holidayMap.clear();
    state.warnings = [];

    var openDates = new Set();
    var useOpenHolidays = OPENHOLIDAYS_COUNTRIES.has(state.country) && state.openHolidays.length > 0;

    // Step 1: Add all OpenHolidays entries as confirmed
    if (useOpenHolidays) {
      for (var i = 0; i < state.openHolidays.length; i++) {
        var oh = state.openHolidays[i];
        openDates.add(oh.date);

        if (!state.holidayMap.has(oh.date)) {
          state.holidayMap.set(oh.date, { holidays: [], source: 'confirmed' });
        }
        state.holidayMap.get(oh.date).holidays.push({
          date: oh.date,
          localName: oh.localName,
          name: oh.name
        });
      }
    }

    // Step 2: Process Nager holidays (filtered by subdivision)
    var filteredNager = filterNagerBySubdivision(state.nagerHolidays);

    for (var j = 0; j < filteredNager.length; j++) {
      var nh = filteredNager[j];
      var dateStr = nh.date;

      if (useOpenHolidays) {
        if (openDates.has(dateStr)) {
          // Already in OpenHolidays — enrich with Nager's localName if available
          var entry = state.holidayMap.get(dateStr);
          // Prefer Nager's localName since it gives the native-language name
          if (nh.localName && entry.holidays.length > 0) {
            entry.holidays[0].localName = nh.localName;
            entry.holidays[0].name = nh.name;
          }
        } else {
          // Nager-only: not in OpenHolidays → mark as unconfirmed
          if (!state.holidayMap.has(dateStr)) {
            state.holidayMap.set(dateStr, { holidays: [], source: 'nager-only' });
          }
          state.holidayMap.get(dateStr).holidays.push({
            date: nh.date,
            localName: nh.localName,
            name: nh.name
          });

          // Add warning
          state.warnings.push({
            date: nh.date,
            localName: nh.localName,
            name: nh.name
          });
        }
      } else {
        // No OpenHolidays data — use Nager as sole source (no warnings)
        if (!state.holidayMap.has(dateStr)) {
          state.holidayMap.set(dateStr, { holidays: [], source: 'confirmed' });
        }
        state.holidayMap.get(dateStr).holidays.push({
          date: nh.date,
          localName: nh.localName,
          name: nh.name
        });
      }
    }
  }

  function updateWarnings() {
    if (state.warnings.length === 0) {
      dom.warningBanner.classList.remove('active');
      dom.legendUnconfirmed.style.display = 'none';
      return;
    }

    // Sort warnings by date
    state.warnings.sort(function (a, b) { return a.date.localeCompare(b.date); });

    dom.legendUnconfirmed.style.display = '';

    var html = '<div class="warning-banner-title">' +
      '&#9888; ' + state.warnings.length + ' holiday' +
      (state.warnings.length !== 1 ? 's' : '') +
      ' found only in Nager.Date API (not confirmed by OpenHolidaysAPI):' +
      '</div><ul>';

    for (var i = 0; i < state.warnings.length; i++) {
      var w = state.warnings[i];
      var d = new Date(w.date + 'T00:00:00');
      var dateLabel = MONTH_NAMES[d.getMonth()] + ' ' + d.getDate();
      var name = w.localName || w.name;
      html += '<li>' + dateLabel + ' — ' + escapeHtml(name);
      if (w.localName && w.name && w.localName !== w.name) {
        html += ' (' + escapeHtml(w.name) + ')';
      }
      html += '</li>';
    }

    html += '</ul>';
    dom.warningBanner.innerHTML = html;
    dom.warningBanner.classList.add('active');
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function updateHolidayInfo() {
    var confirmedCount = 0;
    var unconfirmedCount = 0;
    var weekdayHolidays = 0;

    state.holidayMap.forEach(function (entry, dateStr) {
      if (entry.source === 'confirmed') {
        confirmedCount++;
      } else {
        unconfirmedCount++;
      }
      var d = new Date(dateStr + 'T00:00:00');
      var dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        weekdayHolidays++;
      }
    });

    var totalCount = confirmedCount + unconfirmedCount;

    // Count total weekend days in the year
    var totalWeekends = 0;
    var yearStart = new Date(state.year, 0, 1);
    var yearEnd = new Date(state.year, 11, 31);
    for (var d = new Date(yearStart); d <= yearEnd; d.setDate(d.getDate() + 1)) {
      var dow = d.getDay();
      if (dow === 0 || dow === 6) totalWeekends++;
    }

    var html = '<span class="info-value">' + totalCount + '</span> public holiday' +
      (totalCount !== 1 ? 's' : '');
    if (unconfirmedCount > 0) {
      html += ' (<span class="info-value">' + unconfirmedCount + '</span> unconfirmed)';
    }
    html += ' &middot; <span class="info-value">' + weekdayHolidays + '</span> on weekdays' +
      ' &middot; <span class="info-value">' + totalWeekends + '</span> weekend days';

    dom.holidayInfo.innerHTML = html;
  }

  // ===== Calendar Rendering =====

  function renderCalendar() {
    dom.calendarGrid.innerHTML = '';

    var today = new Date();
    var todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    var frag = document.createDocumentFragment();

    for (var month = 0; month < 12; month++) {
      frag.appendChild(createMonthCell(month, todayStr));
    }

    dom.calendarGrid.appendChild(frag);
  }

  function createMonthCell(month, todayStr) {
    var cell = document.createElement('div');
    cell.className = 'month-cell';

    var title = document.createElement('div');
    title.className = 'month-title';
    title.textContent = MONTH_NAMES[month];
    cell.appendChild(title);

    var table = document.createElement('table');
    table.className = 'month-table';

    // Header row
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    for (var d = 0; d < 7; d++) {
      var th = document.createElement('th');
      th.textContent = DAY_HEADERS[d];
      if (d >= 5) th.className = 'th-weekend';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    var tbody = document.createElement('tbody');
    var daysInMonth = new Date(state.year, month + 1, 0).getDate();

    var firstDayRaw = new Date(state.year, month, 1).getDay(); // 0=Sun
    var firstDay = (firstDayRaw + 6) % 7; // Mon=0 ... Sun=6

    var currentDay = 1;
    var totalCells = firstDay + daysInMonth;
    var totalRows = Math.ceil(totalCells / 7);

    for (var row = 0; row < totalRows; row++) {
      var tr = document.createElement('tr');
      for (var col = 0; col < 7; col++) {
        var td = document.createElement('td');
        var cellIndex = row * 7 + col;

        if (cellIndex < firstDay || currentDay > daysInMonth) {
          td.className = 'day-empty';
        } else {
          var dayNum = currentDay;
          var dateStr = state.year + '-' +
            String(month + 1).padStart(2, '0') + '-' +
            String(dayNum).padStart(2, '0');

          td.textContent = dayNum;
          td.className = 'day';

          var isWeekend = col >= 5;
          var entry = state.holidayMap.get(dateStr);
          var isHoliday = entry && entry.holidays.length > 0;
          var isUnconfirmed = entry && entry.source === 'nager-only';
          var isToday = dateStr === todayStr;
          var isVacation = state.vacationDates.has(dateStr);

          if (isHoliday) {
            if (isUnconfirmed) {
              td.classList.add('day-unconfirmed');
            } else {
              td.classList.add('day-holiday');
            }
            // Build tooltip
            var names = entry.holidays.map(function (h) {
              var label = h.localName || h.name;
              if (isUnconfirmed) {
                label += ' [unconfirmed]';
              }
              return label;
            }).join(', ');
            td.title = names;
          }

          if (isWeekend) {
            td.classList.add('day-weekend');
          }

          // Vacation day styling
          if (isVacation) {
            td.classList.add('day-vacation');
            if (!isHoliday) {
              td.title = 'Vacation day (click to remove)';
            }
          }

          // Make working days clickable (not holidays, not weekends — unless vacation toggle is on those)
          // Allow clicking weekdays that are not holidays, AND any existing vacation day (to unselect)
          if ((!isWeekend && !isHoliday) || isVacation) {
            td.classList.add('day-clickable');
            td.dataset.date = dateStr;
            td.addEventListener('click', onDayClick);
          }

          if (isToday) {
            td.classList.add('day-today');
          }

          currentDay++;
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    cell.appendChild(table);

    return cell;
  }

  // ===== Vacation Editor =====

  function formatDateStr(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function setDefaultStartDate() {
    var today = new Date();
    var start;
    if (state.year === today.getFullYear()) {
      start = today;
    } else if (state.year > today.getFullYear()) {
      start = new Date(state.year, 0, 1);
    } else {
      start = new Date(state.year, 0, 1);
    }
    state.startDate = start;
    if (dom.startDateInput) {
      dom.startDateInput.value = formatDateStr(start);
    }
  }

  function onDayClick(e) {
    var dateStr = e.currentTarget.dataset.date;
    if (!dateStr) return;
    toggleVacation(dateStr);
  }

  function toggleVacation(dateStr) {
    if (state.vacationDates.has(dateStr)) {
      // Remove vacation day
      state.vacationDates.delete(dateStr);
    } else {
      // Check budget
      if (state.vacationDates.size >= state.vacationDays) {
        // At limit — briefly flash the counter to show it's full
        if (dom.vacationCounter) {
          dom.vacationCounter.classList.add('over-budget');
          setTimeout(function () {
            dom.vacationCounter.classList.remove('over-budget');
          }, 600);
        }
        return;
      }
      state.vacationDates.add(dateStr);
    }

    updateVacationCounter();
    renderCalendar(); // re-render to update visual state
  }

  function updateVacationCounter() {
    var used = state.vacationDates.size;
    var total = state.vacationDays;

    if (dom.vacationUsed) dom.vacationUsed.textContent = used;
    if (dom.vacationTotal) dom.vacationTotal.textContent = total;

    // Over-budget visual (if user lowered the limit after selecting)
    if (dom.vacationCounter) {
      if (used > total) {
        dom.vacationCounter.classList.add('over-budget');
      } else {
        dom.vacationCounter.classList.remove('over-budget');
      }
    }
  }

  // ===== Optimizer =====

  /**
   * Greedy vacation optimizer:
   * 1. Scan dates from startDate to Dec 31
   * 2. Find gaps (consecutive working days) between free days (weekends/holidays)
   * 3. Sort gaps by length (shortest first) — these are bridge-day opportunities
   * 4. Fill gaps < 5 days (most efficient) while budget allows
   * 5. If budget remains, fill shortest remaining gaps (full weeks) that maximize
   *    connected free time, picking those adjacent to the longest free blocks first
   * 6. Stop when out of days
   */
  function runOptimizer() {
    state.vacationDates.clear();

    var budget = state.vacationDays;
    if (budget <= 0) {
      renderCalendar();
      updateVacationCounter();
      hideOptimizerStats();
      return;
    }

    var startD = new Date(state.startDate);
    var endD = new Date(state.year, 11, 31);

    // Build day list: array of { date: string, free: bool }
    var days = [];
    for (var d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      var dateStr = formatDateStr(d);
      var dow = d.getDay(); // 0=Sun, 6=Sat
      var isWeekend = dow === 0 || dow === 6;
      var isHoliday = state.holidayMap.has(dateStr);
      days.push({ date: dateStr, free: isWeekend || isHoliday });
    }

    if (days.length === 0) {
      renderCalendar();
      updateVacationCounter();
      hideOptimizerStats();
      return;
    }

    // Find gaps: consecutive runs of non-free days
    var gaps = [];
    var currentGap = [];
    // Track adjacent free block lengths for priority scoring
    var lastFreeBlockLen = 0;

    for (var i = 0; i < days.length; i++) {
      if (days[i].free) {
        if (currentGap.length > 0) {
          // Count free block after this gap
          var freeAfter = 0;
          for (var k = i; k < days.length && days[k].free; k++) {
            freeAfter++;
          }
          gaps.push({
            dates: currentGap.slice(),
            length: currentGap.length,
            freeBefore: lastFreeBlockLen,
            freeAfter: freeAfter
          });
          currentGap = [];
        }
        // Count this free block
        lastFreeBlockLen = 0;
        for (var j = i; j < days.length && days[j].free; j++) {
          lastFreeBlockLen++;
        }
      } else {
        currentGap.push(days[i].date);
      }
    }
    // Trailing gap — no free block after it, less valuable
    if (currentGap.length > 0) {
      gaps.push({
        dates: currentGap.slice(),
        length: currentGap.length,
        freeBefore: lastFreeBlockLen,
        freeAfter: 0
      });
    }

    // Phase 1: Fill bridge gaps (< 5 days), sorted by length then by best adjacent free blocks
    var bridgeGaps = gaps.filter(function (g) { return g.length < 5; });
    bridgeGaps.sort(function (a, b) {
      if (a.length !== b.length) return a.length - b.length;
      // Same length: prefer the one with more adjacent free days (higher payoff)
      var payoffA = a.freeBefore + a.freeAfter;
      var payoffB = b.freeBefore + b.freeAfter;
      return payoffB - payoffA;
    });

    for (var g1 = 0; g1 < bridgeGaps.length; g1++) {
      var gap1 = bridgeGaps[g1];
      if (budget < gap1.length) continue;
      for (var d1 = 0; d1 < gap1.dates.length; d1++) {
        state.vacationDates.add(gap1.dates[d1]);
      }
      budget -= gap1.length;
    }

    // Phase 2: If budget remains, fill remaining gaps (>= 5 days) sorted by total
    // payoff (adjacent free days / cost), so we get the most connected time off
    if (budget > 0) {
      var longGaps = gaps.filter(function (g) { return g.length >= 5; });
      longGaps.sort(function (a, b) {
        // Efficiency: total connected free time per vacation day spent
        var effA = (a.freeBefore + a.freeAfter + a.length) / a.length;
        var effB = (b.freeBefore + b.freeAfter + b.length) / b.length;
        if (effA !== effB) return effB - effA;
        return a.length - b.length;
      });

      for (var g2 = 0; g2 < longGaps.length; g2++) {
        var gap2 = longGaps[g2];
        if (budget < gap2.length) continue;
        for (var d2 = 0; d2 < gap2.dates.length; d2++) {
          state.vacationDates.add(gap2.dates[d2]);
        }
        budget -= gap2.length;
      }
    }

    renderCalendar();
    updateVacationCounter();
    showOptimizerStats();
  }

  function clearVacation() {
    state.vacationDates.clear();
    renderCalendar();
    updateVacationCounter();
    hideOptimizerStats();
  }

  /**
   * Compute and display statistics about the current vacation plan.
   */
  /**
   * Compute vacation stats: blocks containing at least one vacation day.
   * Returns { used, blocks, longest, totalDaysOff, efficiency } or null if no vacation.
   */
  function computeVacationStats() {
    var used = state.vacationDates.size;
    if (used === 0) return null;

    var allDays = [];
    var startD = new Date(state.year, 0, 1);
    var endD = new Date(state.year, 11, 31);
    for (var d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      var dateStr = formatDateStr(d);
      var dow = d.getDay();
      var isWeekend = dow === 0 || dow === 6;
      var isHoliday = state.holidayMap.has(dateStr);
      var isVacation = state.vacationDates.has(dateStr);
      allDays.push({ date: dateStr, free: isWeekend || isHoliday || isVacation });
    }

    // Find free blocks that contain at least one vacation day
    var blocks = [];
    var current = [];
    var currentHasVacation = false;
    for (var i = 0; i < allDays.length; i++) {
      if (allDays[i].free) {
        current.push(allDays[i].date);
        if (state.vacationDates.has(allDays[i].date)) {
          currentHasVacation = true;
        }
      } else {
        if (current.length > 0 && currentHasVacation) {
          blocks.push(current.slice());
        }
        current = [];
        currentHasVacation = false;
      }
    }
    if (current.length > 0 && currentHasVacation) {
      blocks.push(current.slice());
    }

    var longest = 0;
    var totalDaysOff = 0;
    for (var b = 0; b < blocks.length; b++) {
      if (blocks[b].length > longest) longest = blocks[b].length;
      totalDaysOff += blocks[b].length;
    }

    return {
      used: used,
      blocks: blocks.length,
      longest: longest,
      totalDaysOff: totalDaysOff,
      efficiency: used > 0 ? (totalDaysOff / used).toFixed(1) : '0'
    };
  }

  function showOptimizerStats() {
    if (!dom.optimizerStats) return;
    var stats = computeVacationStats();
    if (!stats) {
      hideOptimizerStats();
      return;
    }

    var html = '<span class="stat">Vacation days used: <span class="stat-val">' + stats.used + '</span></span>' +
      '<span class="stat">Vacation streaks: <span class="stat-val">' + stats.blocks + '</span></span>' +
      '<span class="stat">Longest streak: <span class="stat-val">' + stats.longest + ' days</span></span>' +
      '<span class="stat">Total days off: <span class="stat-val">' + stats.totalDaysOff + '</span></span>' +
      '<span class="stat">Efficiency: <span class="stat-val">' + stats.efficiency + 'x</span> (days off per vacation day)</span>';

    dom.optimizerStats.innerHTML = html;
    dom.optimizerStats.classList.add('active');
  }

  function hideOptimizerStats() {
    if (dom.optimizerStats) {
      dom.optimizerStats.classList.remove('active');
    }
  }

  // ===== PNG Export =====

  function exportPNG() {
    if (typeof html2canvas === 'undefined') {
      alert('html2canvas is still loading. Please try again in a moment.');
      return;
    }

    var EXPORT_WIDTH = 1200; // px, target width

    // Build a temporary off-screen container with only:
    // title + legend + calendar + copyright
    var container = document.createElement('div');
    container.setAttribute('data-theme', state.theme);
    // Position off-screen but with a fixed width so layout is constrained
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + EXPORT_WIDTH + 'px;z-index:-1;';

    // Copy theme styles
    var style = document.createElement('style');
    var allStyles = document.querySelector('style');
    if (allStyles) style.textContent = allStyles.textContent;
    container.appendChild(style);

    // Wrapper with background — FIXED width, not min-width
    var wrapper = document.createElement('div');
    wrapper.style.cssText =
      'width:' + EXPORT_WIDTH + 'px;' +
      'background:var(--bg-primary);color:var(--text-primary);' +
      'font-family:Courier New,Consolas,Liberation Mono,monospace;font-size:16px;' +
      'padding:24px 28px;overflow:hidden;';

    // Title
    var title = document.createElement('div');
    title.style.cssText = 'font-size:22px;font-weight:bold;color:var(--accent-primary);' +
      'letter-spacing:3px;text-shadow:var(--glow);margin-bottom:18px;text-align:center;';
    title.textContent = '> VACATION CHEATER \u2014 ' + state.year;
    wrapper.appendChild(title);

    // Legend — rebuild manually to avoid cloning issues
    var legend = document.createElement('div');
    legend.style.cssText =
      'display:flex;align-items:center;gap:18px;flex-wrap:wrap;' +
      'padding:10px 0;margin-bottom:18px;' +
      'border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color);font-size:12px;';

    var legendItems = [
      { cls: 'swatch-weekend', label: 'Weekend' },
      { cls: 'swatch-holiday', label: 'Public Holiday' },
      { cls: 'swatch-vacation', label: 'Vacation Day' }
    ];
    // Include unconfirmed only if there are warnings
    if (state.warnings && state.warnings.length > 0) {
      legendItems.push({ cls: 'swatch-unconfirmed', label: 'Unconfirmed' });
    }
    legendItems.push({ cls: 'swatch-today', label: 'Today' });

    for (var li = 0; li < legendItems.length; li++) {
      var item = document.createElement('div');
      item.className = 'legend-item';
      item.style.cssText = 'display:flex;align-items:center;gap:6px;color:var(--text-secondary);';
      var sw = document.createElement('div');
      sw.className = 'legend-swatch ' + legendItems[li].cls;
      sw.style.cssText = 'width:14px;height:14px;border-radius:2px;border:1px solid var(--border-color);flex-shrink:0;';
      item.appendChild(sw);
      item.appendChild(document.createTextNode(legendItems[li].label));
      legend.appendChild(item);
    }

    // Add vacation counter to legend
    var vacInfo = document.createElement('div');
    vacInfo.style.cssText = 'margin-left:auto;font-size:13px;font-weight:bold;color:var(--text-muted);letter-spacing:1px;';
    vacInfo.innerHTML = 'VACATION: <span style="color:var(--accent-primary);text-shadow:var(--glow);">' +
      state.vacationDates.size + '</span> / <span style="color:var(--accent-primary);text-shadow:var(--glow);">' +
      state.vacationDays + '</span>';
    legend.appendChild(vacInfo);
    wrapper.appendChild(legend);

    // Calendar grid — deep clone with explicit grid layout
    var calSrc = document.querySelector('.calendar-grid');
    if (calSrc) {
      var cal = calSrc.cloneNode(true);
      // Force 4-column grid with fixed dimensions
      cal.style.cssText =
        'display:grid;grid-template-columns:repeat(4,1fr);gap:14px;' +
        'width:100%;max-width:none;margin:0;';
      // Ensure month cells don't overflow
      var monthCells = cal.querySelectorAll('.month-cell');
      for (var mc = 0; mc < monthCells.length; mc++) {
        monthCells[mc].style.cssText += 'overflow:hidden;';
      }
      wrapper.appendChild(cal);
    }

    // Stats line (if vacation days are selected)
    var stats = computeVacationStats();
    if (stats) {
      var statsEl = document.createElement('div');
      statsEl.style.cssText =
        'display:flex;gap:20px;flex-wrap:wrap;justify-content:center;' +
        'margin-top:14px;padding:10px 0;font-size:12px;color:var(--text-secondary);' +
        'border-top:1px solid var(--border-color);';
      var items = [
        'Vacation days used: <span style="color:var(--accent-primary);font-weight:bold;text-shadow:var(--glow);">' + stats.used + '</span>',
        'Vacation streaks: <span style="color:var(--accent-primary);font-weight:bold;text-shadow:var(--glow);">' + stats.blocks + '</span>',
        'Longest streak: <span style="color:var(--accent-primary);font-weight:bold;text-shadow:var(--glow);">' + stats.longest + ' days</span>',
        'Total days off: <span style="color:var(--accent-primary);font-weight:bold;text-shadow:var(--glow);">' + stats.totalDaysOff + '</span>',
        'Efficiency: <span style="color:var(--accent-primary);font-weight:bold;text-shadow:var(--glow);">' + stats.efficiency + 'x</span>'
      ];
      for (var si = 0; si < items.length; si++) {
        var sp = document.createElement('span');
        sp.innerHTML = items[si];
        statsEl.appendChild(sp);
      }
      wrapper.appendChild(statsEl);
    }

    // Copyright line
    var copy = document.createElement('div');
    copy.style.cssText = 'margin-top:14px;font-size:12px;color:var(--text-muted);text-align:center;';
    copy.innerHTML = '\u00A9 altsoph, <span style="color:var(--accent-primary);text-shadow:var(--glow);">altsoph.com/pp/vc</span>';
    wrapper.appendChild(copy);

    container.appendChild(wrapper);
    document.body.appendChild(container);

    // Use scale 1 since we're already at 1200px — output will be 1200 x height
    html2canvas(wrapper, {
      backgroundColor: null,
      scale: 2,
      width: EXPORT_WIDTH,
      useCORS: true,
      logging: false
    }).then(function (canvas) {
      document.body.removeChild(container);

      // Try clipboard first
      canvas.toBlob(function (blob) {
        if (blob && navigator.clipboard && navigator.clipboard.write) {
          var item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(function () {
            flashExportButton('Copied!');
          }).catch(function () {
            openInNewTab(canvas);
          });
        } else {
          openInNewTab(canvas);
        }
      }, 'image/png');
    }).catch(function (err) {
      document.body.removeChild(container);
      console.error('Export failed:', err);
      alert('Export failed. See console for details.');
    });
  }

  function openInNewTab(canvas) {
    var dataUrl = canvas.toDataURL('image/png');
    var win = window.open('');
    if (win) {
      win.document.write(
        '<html><head><title>Vacation Cheater Export</title>' +
        '<style>body{margin:0;background:#111;display:flex;justify-content:center;padding:20px;}' +
        'img{max-width:100%;height:auto;}</style></head>' +
        '<body><img src="' + dataUrl + '"></body></html>'
      );
      win.document.close();
      flashExportButton('Opened!');
    }
  }

  function flashExportButton(text) {
    if (!dom.btnExport) return;
    var orig = dom.btnExport.textContent;
    dom.btnExport.textContent = text;
    dom.btnExport.style.borderColor = 'var(--accent-primary)';
    dom.btnExport.style.color = 'var(--accent-primary)';
    setTimeout(function () {
      dom.btnExport.textContent = orig;
      dom.btnExport.style.borderColor = '';
      dom.btnExport.style.color = '';
    }, 1500);
  }

  // ===== Event Listeners =====

  function setupEventListeners() {
    // Theme toggle
    dom.themeToggle.addEventListener('click', toggleTheme);
    dom.themeToggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Year change
    dom.yearInput.addEventListener('change', function () {
      var val = parseInt(dom.yearInput.value, 10);
      if (val >= 2000 && val <= 2100) {
        state.year = val;
        fetchHolidaysAndRender();
      }
    });

    // Country change
    dom.countrySelect.addEventListener('change', function () {
      state.country = dom.countrySelect.value;
      updateSubdivisions();
      fetchHolidaysAndRender();
    });

    // State/subdivision change — re-fetch OpenHolidays (it takes subdivision param)
    dom.stateSelect.addEventListener('change', function () {
      state.subdivision = dom.stateSelect.value;
      fetchHolidaysAndRender();
    });

    // Vacation days — update budget and counter
    dom.vacationDays.addEventListener('change', function () {
      state.vacationDays = parseInt(dom.vacationDays.value, 10) || 0;
      updateVacationCounter();
    });

    // Consecutive days (for future use)
    dom.consecutiveDays.addEventListener('change', function () {
      state.consecutiveDays = parseInt(dom.consecutiveDays.value, 10) || 0;
    });

    // Count weekends (for future use)
    dom.countWeekends.addEventListener('change', function () {
      state.countWeekends = dom.countWeekends.checked;
    });

    // Start date
    dom.startDateInput.addEventListener('change', function () {
      var val = dom.startDateInput.value;
      if (val) {
        var parts = val.split('-');
        state.startDate = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
      }
    });

    // Optimizer buttons
    dom.btnOptimize.addEventListener('click', runOptimizer);
    dom.btnClear.addEventListener('click', clearVacation);

    // Export
    dom.btnExport.addEventListener('click', exportPNG);
  }

  // ===== Start =====

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
