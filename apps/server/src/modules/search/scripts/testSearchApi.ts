import { buildApp } from '../../../app.js';
import { SearchMapper } from '../mappers/search.mapper.js';

async function runApiIntegrationTests() {
  console.log('\n========================================================');
  console.log('       PATENTIQ POST /api/search API INTEGRATION TEST   ');
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

  // 0. SearchMapper Unit Tests
  console.log('--- SearchMapper Unit Tests ---');
  const sampleMatches = [
    {
      id: 'US1234567_abstract',
      score: 0.9128456,
      metadata: {
        patentId: 'US1234567',
        title: 'Wireless Charging System',
        abstract: 'Wireless power transfer system for vehicles',
        claims: 'Claim 1: A wireless power transmitter...',
        ipc: 'H01M',
        country: 'US',
        owner: 'Samsung',
        publicationDate: '2023-05-14',
        section: 'abstract',
      },
    },
    {
      id: 'US7654321_title',
      score: 0.854321,
      metadata: {
        patentId: 'US7654321',
        ipc: 'B60L',
      },
    },
  ];

  const mappedResults = SearchMapper.toSearchResultList(sampleMatches, 10);
  assert(mappedResults.length === 2, 'SearchMapper: Maps raw matches to DTOs');
  const res1 = mappedResults[0]!;
  const res2 = mappedResults[1]!;
  assert(res1.rank === 1, 'SearchMapper: Assigns rank 1 to top result');
  assert(res1.score === 0.9128, 'SearchMapper: Rounds score to 4 decimal places as numeric', `Got ${res1.score}`);
  assert(typeof res1.score === 'number', 'SearchMapper: Keeps score as a numeric value');
  assert(res1.patentId === 'US1234567', 'SearchMapper: Extracts patentId correctly');
  assert(res1.claims === 'Claim 1: A wireless power transmitter...', 'SearchMapper: Includes claims');
  assert(res1.owner === 'Samsung', 'SearchMapper: Extracts owner correctly');
  assert(res1.country === 'US', 'SearchMapper: Extracts country correctly');
  assert(res1.publicationDate === '2023-05-14', 'SearchMapper: Extracts publicationDate');

  assert(res2.rank === 2, 'SearchMapper: Assigns rank 2 to second result');
  assert(res2.score === 0.8543, 'SearchMapper: Rounds score to 4 decimal places', `Got ${res2.score}`);

  // Test empty results mapper
  const emptyMapped = SearchMapper.toSearchResultList([], 10);
  assert(Array.isArray(emptyMapped) && emptyMapped.length === 0, 'SearchMapper: Returns empty array for empty matches');

  console.log('\n--- Fastify Endpoint Tests ---');
  const app = await buildApp();
  await app.ready();

  try {
    // 1. Validation Test: Missing query
    const resMissingQuery = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { topK: 5 },
    });
    assert(
      resMissingQuery.statusCode === 400,
      'Validation: Missing query returns HTTP 400',
      `Got status ${resMissingQuery.statusCode}`
    );
    const bodyMissing = JSON.parse(resMissingQuery.payload);
    assert(
      bodyMissing.message && bodyMissing.message.includes('query is required'),
      'Validation: Error message specifies "query is required"',
      bodyMissing.message
    );

    // 2. Validation Test: Empty query
    const resEmptyQuery = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: '   ', topK: 5 },
    });
    assert(
      resEmptyQuery.statusCode === 400,
      'Validation: Empty query string returns HTTP 400',
      `Got status ${resEmptyQuery.statusCode}`
    );

    // 3. Validation Test: topK > 100
    const resTopKExceeded = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: 'wireless charging', topK: 150 },
    });
    assert(
      resTopKExceeded.statusCode === 400,
      'Validation: topK > 100 returns HTTP 400',
      `Got status ${resTopKExceeded.statusCode}`
    );
    const bodyTopKExceeded = JSON.parse(resTopKExceeded.payload);
    assert(
      bodyTopKExceeded.message && bodyTopKExceeded.message.includes('maximum topK is 100'),
      'Validation: Error message specifies "maximum topK is 100"',
      bodyTopKExceeded.message
    );

    // 4. Validation Test: topK < 1
    const resTopKLow = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: { query: 'wireless charging', topK: 0 },
    });
    assert(
      resTopKLow.statusCode === 400,
      'Validation: topK < 1 returns HTTP 400',
      `Got status ${resTopKLow.statusCode}`
    );

    // 5. Validation Test: Invalid section enum
    const resInvalidSection = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: {
        query: 'wireless charging',
        filters: { section: 'invalid_section' },
      },
    });
    assert(
      resInvalidSection.statusCode === 400,
      'Validation: Invalid section enum returns HTTP 400',
      `Got status ${resInvalidSection.statusCode}`
    );

    // 6. Validation Test: Invalid ISO date format
    const resInvalidDate = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: {
        query: 'wireless charging',
        filters: { publicationDateFrom: 'not-a-date' },
      },
    });
    assert(
      resInvalidDate.statusCode === 400,
      'Validation: Invalid ISO date string returns HTTP 400',
      `Got status ${resInvalidDate.statusCode}`
    );

    // 7. Validation Test: publicationDateFrom > publicationDateTo
    const resInvalidDateRange = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: {
        query: 'wireless charging',
        filters: {
          publicationDateFrom: '2024-12-31',
          publicationDateTo: '2020-01-01',
        },
      },
    });
    assert(
      resInvalidDateRange.statusCode === 400,
      'Validation: publicationDateFrom > publicationDateTo returns HTTP 400',
      `Got status ${resInvalidDateRange.statusCode}`
    );

    // 8. Execution Test: Search request with metadata filters
    const searchQuery = 'wireless charging for electric vehicles';
    const resValid = await app.inject({
      method: 'POST',
      url: '/api/search',
      payload: {
        query: searchQuery,
        topK: 5,
      },
    });

    console.log(`\nResponse Status for POST /api/search: ${resValid.statusCode}`);
    const validBody = JSON.parse(resValid.payload);

    if (resValid.statusCode === 200) {
      assert(validBody.success === true, 'Response payload contains success: true');
      assert(validBody.query === searchQuery, 'Response payload contains matching query string');
      assert(Array.isArray(validBody.results), 'Response payload contains results array');
      assert(typeof validBody.count === 'number', 'Response payload contains match count');

      // Check result item fields if results exist
      if (validBody.results.length > 0) {
        const first = validBody.results[0];
        assert(typeof first.rank === 'number' && first.rank === 1, 'First result has rank: 1');
        assert(typeof first.score === 'number', 'First result has numeric score');
        assert(typeof first.patentId === 'string', 'First result has patentId string');
        assert(typeof first.title === 'string', 'First result has title string');
        assert(typeof first.abstract === 'string', 'First result has abstract string');
        assert(typeof first.ipc === 'string', 'First result has ipc string');
      }

      // Check sorting descending order
      if (validBody.results.length > 1) {
        let isSorted = true;
        for (let i = 0; i < validBody.results.length - 1; i++) {
          if (validBody.results[i].score < validBody.results[i + 1].score) {
            isSorted = false;
            break;
          }
        }
        assert(isSorted, 'Results are sorted in descending order of similarity score');
      }

      console.log('\nSample Search Result Payload:');
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
    console.error('API Integration test execution failed:', error);
    await app.close();
    process.exit(1);
  }
}

runApiIntegrationTests();
