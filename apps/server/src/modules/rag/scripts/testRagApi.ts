import { buildApp } from '../../../app.js';
import { NoveltyAnalysisPromptBuilder } from '../prompts/novelty-analysis.prompt.js';
import type { SearchResult } from '../../search/interfaces/search.interface.js';

async function runRagApiIntegrationTests() {
  console.log('\n========================================================');
  console.log('    PATENTIQ 7-SECTION NOVELTY ANALYSIS INTEGRATION TEST');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName} ${detail ? `(${detail})` : ''}`);
    }
  }

  // 1. Novelty Prompt Builder Unit Tests
  console.log('--- Novelty Prompt Builder Unit Tests ---');

  const systemPrompt = NoveltyAnalysisPromptBuilder.getSystemPrompt();
  assert(
    systemPrompt.includes('STRICT GROUNDING & ANTI-HALLUCINATION RULES') &&
      systemPrompt.includes('The retrieved patents do not provide sufficient information to determine this'),
    'PromptBuilder: Returns structured system prompt with anti-hallucination rules'
  );

  const mockPatents: SearchResult[] = [
    {
      rank: 1,
      score: 0.9128,
      patentId: 'US1234567',
      title: 'Autonomous Drone Wireless Charging Pad',
      abstract: 'Inductive charging system for unmanned aerial vehicles...',
      claims: 'Claim 1: A wireless power transmitter configured to align with drone receiving coil...',
      ipc: 'H02J',
    },
  ];

  const builtPrompt = NoveltyAnalysisPromptBuilder.buildPrompt(
    'A wireless charging system for autonomous drones',
    mockPatents,
    { maxClaimsLength: 50 }
  );

  assert(builtPrompt.includes('US1234567'), 'PromptBuilder: Includes Patent ID in context');
  assert(builtPrompt.includes('Autonomous Drone Wireless Charging Pad'), 'PromptBuilder: Includes Title in context');
  assert(builtPrompt.includes('[truncated]'), 'PromptBuilder: Truncates long claims according to maxClaimsLength');

  // Test 7-section JSON output parser
  const sampleJsonOutput = JSON.stringify({
    summary: 'Autonomous drone wireless charging pad system.',
    similarPatents: [{ patentId: 'US1234567', reason: 'Inductive charging pad alignment.' }],
    featureComparison: {
      commonFeatures: ['Inductive wireless coil'],
      uniqueFeatures: ['Autonomous vision-guided landing gear alignment'],
      partialOverlap: ['Power negotiation telemetry'],
    },
    novelAspects: ['Vision-assisted closed-loop inductive charging pad alignment.'],
    overlappingClaims: ['Claim 1 of US1234567 shares inductive power transfer coil layout.'],
    risks: ['Potential overlap with primary power transmitter claims of US1234567.'],
    recommendations: ['Draft claims specifically covering dynamic vision-guided loop feedback.'],
  });

  const parsedJson = NoveltyAnalysisPromptBuilder.parseNoveltyAnalysisResponse(sampleJsonOutput);
  assert(parsedJson.summary.includes('Autonomous drone'), 'PromptBuilder Parser: Parses 7-section summary');
  assert(parsedJson.similarPatents.length === 1 && parsedJson.similarPatents[0]?.patentId === 'US1234567', 'PromptBuilder Parser: Parses similarPatents array');
  assert(parsedJson.featureComparison.uniqueFeatures.length === 1, 'PromptBuilder Parser: Parses featureComparison uniqueFeatures');
  assert(parsedJson.novelAspects.length === 1, 'PromptBuilder Parser: Parses novelAspects array');
  assert(parsedJson.overlappingClaims.length === 1, 'PromptBuilder Parser: Parses overlappingClaims array');
  assert(parsedJson.risks.length === 1, 'PromptBuilder Parser: Parses risks array');
  assert(parsedJson.recommendations.length === 1, 'PromptBuilder Parser: Parses recommendations array');

  // Test Markdown Wrapped JSON
  const markdownWrapped = `\`\`\`json\n${sampleJsonOutput}\n\`\`\``;
  const parsedMarkdown = NoveltyAnalysisPromptBuilder.parseNoveltyAnalysisResponse(markdownWrapped);
  assert(parsedMarkdown.summary.includes('Autonomous drone'), 'PromptBuilder Parser: Strips markdown wrappers correctly');

  // Test Fallback for empty results
  const emptyFallback = NoveltyAnalysisPromptBuilder.createFallbackResult('No prior art found');
  assert(emptyFallback.summary === 'No prior art found', 'PromptBuilder: Creates clean fallback result on empty results');
  assert(emptyFallback.similarPatents.length === 0, 'Fallback result returns empty array for similarPatents');

  console.log('\n--- Fastify Endpoint Tests ---');
  const app = await buildApp();
  await app.ready();

  try {
    // 2. Validation Test: Missing query
    const resMissingQuery = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: { topK: 5 },
    });
    assert(
      resMissingQuery.statusCode === 400,
      'Validation: Missing query returns HTTP 400',
      `Got status ${resMissingQuery.statusCode}`
    );

    // 3. Validation Test: Empty query string
    const resEmptyQuery = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: { query: '   ', topK: 5 },
    });
    assert(
      resEmptyQuery.statusCode === 400,
      'Validation: Empty query returns HTTP 400',
      `Got status ${resEmptyQuery.statusCode}`
    );

    // 4. Validation Test: topK > 100
    const resTopKExceeded = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: { query: 'drone wireless charging', topK: 150 },
    });
    assert(
      resTopKExceeded.statusCode === 400,
      'Validation: topK > 100 returns HTTP 400',
      `Got status ${resTopKExceeded.statusCode}`
    );

    // 5. Execution Test: POST /api/rag/analyze
    const searchQuery = 'A wireless charging system for autonomous drones';
    const resValid = await app.inject({
      method: 'POST',
      url: '/api/rag/analyze',
      payload: {
        query: searchQuery,
        topK: 5,
      },
    });

    console.log(`\nResponse Status for POST /api/rag/analyze: ${resValid.statusCode}`);
    const validBody = JSON.parse(resValid.payload);

    if (resValid.statusCode === 200) {
      assert(validBody.success === true, 'Response payload contains success: true');
      assert(validBody.query === searchQuery, 'Response payload contains matching query string');
      assert(validBody.analysis && typeof validBody.analysis === 'object', 'Response payload contains analysis object');
      assert(typeof validBody.analysis.summary === 'string', 'Analysis contains summary section');
      assert(Array.isArray(validBody.analysis.similarPatents), 'Analysis contains similarPatents array');
      assert(validBody.analysis.featureComparison && Array.isArray(validBody.analysis.featureComparison.commonFeatures), 'Analysis contains featureComparison object');
      assert(Array.isArray(validBody.analysis.novelAspects), 'Analysis contains novelAspects array');
      assert(Array.isArray(validBody.analysis.overlappingClaims), 'Analysis contains overlappingClaims array');
      assert(Array.isArray(validBody.analysis.risks), 'Analysis contains risks array');
      assert(Array.isArray(validBody.analysis.recommendations), 'Analysis contains recommendations array');

      console.log('\nSample 7-Section Novelty Analysis Response Payload:');
      console.log(JSON.stringify(validBody, null, 2));
    } else if (resValid.statusCode === 503) {
      console.log(`[INFO] Downstream dependency unavailable (Ollama / Pinecone): ${validBody.message}`);
      assert(
        validBody.error === 'ServiceUnavailableError',
        'ServiceUnavailableError properly handled with HTTP 503'
      );
    }

    console.log(`\n========================================================`);
    console.log(`        TEST SUMMARY: Passed ${passedTests}/${totalTests} tests`);
    console.log(`========================================================\n`);

    await app.close();
  } catch (error) {
    console.error('7-Section Novelty Analysis API Integration test execution failed:', error);
    await app.close();
    process.exit(1);
  }
}

runRagApiIntegrationTests();
