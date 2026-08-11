export interface ProcessedQuery {
  originalQuery: string;
  title?: string | undefined;
  technicalTerms: string[];
  technicalPhrases: string[];
  components: string[];
  mechanisms: string[];
  normalizedQuery: string;
}

/**
 * Domain-agnostic query preprocessor service for prior-art patent retrieval.
 * Extracts technical phrases, components, mechanisms, and normalized lexical tokens
 * without hardcoding domain-specific rules.
 */
export class QueryPreprocessorService {
  private static readonly PATENT_STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'of', 'for', 'in', 'on', 'with', 'by', 'at', 'to', 'from',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'which', 'that', 'this', 'these', 'those', 'such', 'more', 'most', 'other', 'some',
    'system', 'systems', 'method', 'methods', 'apparatus', 'apparatuses', 'device', 'devices',
    'assembly', 'comprising', 'comprises', 'comprised', 'wherein', 'plurality', 'said',
    'configured', 'operating', 'operates', 'used', 'using', 'includes', 'including', 'disclosed',
    'present', 'invention', 'disclosure', 'embodiment', 'embodiments', 'relates', 'relating',
  ]);

  private static readonly COMPONENT_KEYWORDS = new Set([
    'sensor', 'sensors', 'cable', 'cables', 'module', 'modules', 'valve', 'valves',
    'transducer', 'transducers', 'unit', 'units', 'device', 'devices', 'array', 'arrays',
    'material', 'materials', 'circuit', 'circuits', 'detector', 'detectors', 'housing',
    'vehicle', 'vehicles', 'drone', 'drones', 'fiber', 'fibers', 'fiber-optic', 'microcapsule',
    'microcapsules', 'transmitter', 'receiver', 'antenna', 'battery', 'capacitor', 'switch',
    'nanoparticle', 'nanoparticles', 'pipe', 'pipeline', 'conduit', 'probe', 'actuator', 'transistor',
  ]);

  private static readonly MECHANISM_KEYWORDS = new Set([
    'control', 'maintenance', 'sensing', 'telemetry', 'inspection', 'repair', 'fusion',
    'monitoring', 'detection', 'cooling', 'heating', 'management', 'storage', 'transmission',
    'processing', 'tracking', 'optimization', 'regulation', 'automation', 'estimation',
    'recovery', 'harvesting', 'balancing', 'diagnostic', 'diagnostics',
  ]);

  /**
   * Processes raw user invention query text into a structured, domain-agnostic representation.
   */
  public process(queryText: string): ProcessedQuery {
    const raw = queryText ? queryText.trim() : '';
    if (!raw) {
      return {
        originalQuery: '',
        technicalTerms: [],
        technicalPhrases: [],
        components: [],
        mechanisms: [],
        normalizedQuery: '',
      };
    }

    // 1. Title Extraction (from headers or first line/sentence)
    let title: string | undefined = undefined;
    const headerMatch = raw.match(/(?:title|invention title|project title)\s*:\s*(.+?)(?:\r?\n|$)/i);
    if (headerMatch && headerMatch[1]) {
      title = headerMatch[1].trim();
    } else {
      const firstLine = raw.split(/\r?\n/)[0]?.trim();
      if (firstLine && firstLine.length > 0 && firstLine.length <= 120) {
        title = firstLine.replace(/^["'\s]+|["'\s]+$/g, '');
      }
    }

    // Clean text for NLP parsing
    const cleanedText = raw.replace(/[\r\n\t]+/g, ' ');

    // 2. Extract Technical Phrases (2-word to 4-word contiguous terms, hyphenated terms, alphanumeric codes)
    const technicalPhrases: string[] = [];
    const componentsSet = new Set<string>();
    const mechanismsSet = new Set<string>();

    // Hyphenated technical terms (e.g., "fiber-optic", "phase-change", "microcapsule-based", "UV-C", "RS-485")
    const hyphenatedMatches = cleanedText.match(/\b[a-zA-Z0-9]+-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)?\b/g) || [];
    hyphenatedMatches.forEach((h) => {
      const lower = h.toLowerCase();
      if (!this.isStopWord(lower) && lower.length > 3) {
        if (!technicalPhrases.includes(lower)) technicalPhrases.push(lower);
      }
    });

    // Extract contiguous multi-word phrases (2 to 4 words)
    const words = cleanedText.split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9\-]/g, '')).filter(Boolean);

    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const slice = words.slice(i, i + len);
        const phrase = slice.join(' ').toLowerCase();

        // Ensure first and last words are non-stopwords and phrase contains meaningful content
        if (
          !this.isStopWord(slice[0]) &&
          !this.isStopWord(slice[slice.length - 1]) &&
          phrase.length >= 6
        ) {
          if (!technicalPhrases.includes(phrase)) {
            technicalPhrases.push(phrase);
          }

          // Categorize into components vs mechanisms
          const lastWord = slice[slice.length - 1].toLowerCase();
          if (QueryPreprocessorService.COMPONENT_KEYWORDS.has(lastWord)) {
            componentsSet.add(phrase);
          } else if (
            QueryPreprocessorService.MECHANISM_KEYWORDS.has(lastWord) ||
            lastWord.endsWith('ing')
          ) {
            mechanismsSet.add(phrase);
          }
        }
      }
    }

    // 3. Extract Single Technical Terms
    const technicalTerms: string[] = [];
    words.forEach((w) => {
      const lower = w.toLowerCase();
      if (!this.isStopWord(lower) && lower.length > 2 && !/^\d+$/.test(lower)) {
        if (!technicalTerms.includes(lower)) {
          technicalTerms.push(lower);
        }
        if (QueryPreprocessorService.COMPONENT_KEYWORDS.has(lower)) {
          componentsSet.add(lower);
        } else if (QueryPreprocessorService.MECHANISM_KEYWORDS.has(lower) || lower.endsWith('ing')) {
          mechanismsSet.add(lower);
        }
      }
    });

    const components = Array.from(componentsSet);
    const mechanisms = Array.from(mechanismsSet);

    // 4. Construct Normalized Query for Lexical BM25 Search
    const parts: string[] = [];
    if (title) parts.push(title);
    if (technicalPhrases.length > 0) parts.push(technicalPhrases.join(' '));
    if (technicalTerms.length > 0) parts.push(technicalTerms.join(' '));

    const normalizedQuery = parts.join(' ').trim() || raw;

    return {
      originalQuery: raw,
      title,
      technicalTerms,
      technicalPhrases,
      components,
      mechanisms,
      normalizedQuery,
    };
  }

  private isStopWord(word: string): boolean {
    return QueryPreprocessorService.PATENT_STOP_WORDS.has(word.toLowerCase());
  }
}
