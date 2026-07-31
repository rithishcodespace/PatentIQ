import { buildApp } from '../../../app.js';

async function runApiIntegrationTests() {
  console.log('\n========================================================');
  console.log('       PATENTIQ POST /api/search API INTEGRATION TEST   ');
  console.log('========================================================\n');

  const app = await buildApp();
  await app.ready();

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
        filters: {
          ipc: 'H01M',
          country: 'US',
          publicationDateFrom: '2020-01-01',
          publicationDateTo: '2024-12-31',
          owner: 'Samsung',
          section: 'abstract',
        },
      },
    });

    console.log(`\nResponse Status for POST /api/search with filters: ${resValid.statusCode}`);
    const validBody = JSON.parse(resValid.payload);

    if (resValid.statusCode === 200) {
      assert(validBody.success === true, 'Response payload contains success: true');
      assert(validBody.query === searchQuery, 'Response payload contains matching query string');
      assert(Array.isArray(validBody.results), 'Response payload contains results array');
      assert(typeof validBody.count === 'number', 'Response payload contains match count');
      assert(validBody.filters && validBody.filters.ipc === 'H01M', 'Response echoes back applied filters');

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

      console.log('\nSample Filtered Search Result Payload:');
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
