import { vi } from 'vitest';
import { mockPineconeMatches } from '../fixtures/search.fixtures.js';
export function createPineconeMock(matches = mockPineconeMatches) {
    const queryMock = vi.fn().mockResolvedValue({
        matches,
    });
    const indexMock = vi.fn().mockReturnValue({
        query: queryMock,
    });
    const pineconeClientMock = {
        index: indexMock,
    };
    return {
        pineconeClientMock,
        indexMock,
        queryMock,
    };
}
//# sourceMappingURL=pinecone.mock.js.map