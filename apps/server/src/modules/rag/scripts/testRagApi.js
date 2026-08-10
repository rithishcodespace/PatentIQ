import { buildApp } from '../../../app.js';
import { NoveltyAnalysisPromptBuilder } from '../prompts/novelty-analysis.prompt.js';
import { OverlapAnalysisPromptBuilder } from '../prompts/overlap-analysis.prompt.js';
async function runRagApiIntegrationTests() {
    console.log('\n========================================================');
    console.log('    PATENTIQ SECTION & CLAIM OVERLAP INTEGRATION TEST   ');
    console.log('========================================================\n');
    let passedTests = 0;
    let totalTests = 0;
    function assert(condition, testName, detail) {
        totalTests++;
        if (condition) {
            console.log(`[PASS] Test ${totalTests}: ${testName}`);
            passedTests++;
        }
        else {
            console.error(`[FAIL] Test ${totalTests}: ${testName} ${detail ? `(${detail})` : ''}`);
        }
    }
    // 1. Prompt Builder Unit Tests
    console.log('--- Overlap Prompt Builder Unit Tests ---');
    const systemPrompt = OverlapAnalysisPromptBuilder.getSystemPrompt();
    assert(systemPrompt.includes('STRICT GROUNDING & ANTI-HALLUCINATION RULES') &&
        systemPrompt.includes('NEVER fabricate or invent claim numbers'), 'OverlapPromptBuilder: System prompt contains strict anti-hallucination rules');
    const mockPatents = [
        {
            rank: 1,
            score: 0.91,
            patentId: 'US1234567',
            title: 'Autonomous Drone Wireless Charging Pad',
            abstract: 'Inductive charging system for unmanned aerial vehicles...',
            claims: 'Claim 3: Wireless power transfer using inductive coils configured to align with landing gear...',
            section: 'Claims',
            ipc: 'H02J',
        },
    ];
    const builtPrompt = OverlapAnalysisPromptBuilder.buildPrompt('An autonomous drone charging station using wireless inductive charging', mockPatents, { maxClaimsLength: 50 });
    assert(builtPrompt.includes('US1234567'), 'OverlapPromptBuilder: Formats Patent ID in prompt payload');
    assert(builtPrompt.includes('Autonomous Drone Wireless Charging Pad'), 'OverlapPromptBuilder: Formats Title in prompt payload');
    // Test Overlap Response Parser
    const sampleJsonOutput = JSON.stringify([
        {
            patentId: 'US1234567',
            title: 'Autonomous Drone Wireless Charging Pad',
            similarityScore: 0.91,
            relevantSections: [
                { section: 'Abstract', reason: 'Describes wireless charging architecture' },
                { section: 'Claims', reason: 'Contains inductive charging method' },
            ],
            overlappingClaims: [
                {
                    claimNumber: 3,
                    summary: 'Wireless power transfer using inductive coils',
                    reason: 'Uses the same charging mechanism described in the invention',
                    overlapStrength: 'High',
                },
            ],
        },
    ]);
    const parsedItems = OverlapAnalysisPromptBuilder.parseOverlapAnalysisResponse(sampleJsonOutput, mockPatents);
    assert(parsedItems.length === 1, 'OverlapParser: Parses array of overlap items');
    assert(parsedItems[0]?.patentId === 'US1234567', 'OverlapParser: Matches patent ID correctly');
    assert(parsedItems[0]?.relevantSections.length === 2, 'OverlapParser: Parses relevantSections array');
    assert(parsedItems[0]?.overlappingClaims.length === 1, 'OverlapParser: Parses overlappingClaims array');
    assert(parsedItems[0]?.overlappingClaims[0]?.claimNumber === 3, 'OverlapParser: Preserves exact claim number 3');
    assert(parsedItems[0]?.overlappingClaims[0]?.overlapStrength === 'High', 'OverlapParser: Classifies overlapStrength as High');
    // Test Fallback for empty/malformed results
    const emptyFallback = OverlapAnalysisPromptBuilder.createFallbackOverlapItems(mockPatents);
    assert(emptyFallback.length === 1, 'OverlapParser: Generates fallback items for retrieved patents');
    assert(emptyFallback[0]?.relevantSections[0]?.section === 'Claims', 'OverlapParser Fallback: Uses patent section metadata');
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
        assert(resMissingQuery.statusCode === 400, 'Validation: Missing query returns HTTP 400', `Got status ${resMissingQuery.statusCode}`);
        // 3. Execution Test: POST /api/rag/analyze
        const searchQuery = 'An autonomous drone charging station using wireless inductive charging';
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
            assert(Array.isArray(validBody.overlapAnalysis), 'Response payload contains overlapAnalysis array');
            if (validBody.overlapAnalysis.length > 0) {
                const item = validBody.overlapAnalysis[0];
                assert(typeof item.patentId === 'string', 'Overlap item contains patentId');
                assert(Array.isArray(item.relevantSections), 'Overlap item contains relevantSections');
                assert(Array.isArray(item.overlappingClaims), 'Overlap item contains overlappingClaims');
                if (item.overlappingClaims.length > 0) {
                    assert(['High', 'Medium', 'Low'].includes(item.overlappingClaims[0].overlapStrength), 'Overlapping claim classifies strength as High, Medium, or Low');
                }
            }
            console.log('\nSample Section & Claim Overlap Response Payload:');
            console.log(JSON.stringify(validBody, null, 2));
        }
        else if (resValid.statusCode === 503) {
            console.log(`[INFO] Downstream dependency unavailable (Ollama / Pinecone): ${validBody.message}`);
            assert(validBody.error === 'ServiceUnavailableError', 'ServiceUnavailableError properly handled with HTTP 503');
        }
        console.log(`\n========================================================`);
        console.log(`        TEST SUMMARY: Passed ${passedTests}/${totalTests} tests`);
        console.log(`========================================================\n`);
        await app.close();
    }
    catch (error) {
        console.error('Section & Claim Overlap API Integration test execution failed:', error);
        await app.close();
        process.exit(1);
    }
}
runRagApiIntegrationTests();
//# sourceMappingURL=testRagApi.js.map