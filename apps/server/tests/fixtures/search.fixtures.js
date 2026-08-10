export const mockSearchQuery = 'Autonomous drone navigation using LiDAR and optical flow sensors';
export const mockSearchRequest = {
    query: mockSearchQuery,
    topK: 5,
    filters: {
        ipc: 'B64C 39/02',
        country: 'US',
    },
};
export const mockVectorEmbedding = new Array(768).fill(0.0123);
export const mockPineconeMatches = [
    {
        id: 'US-10112233-B2_abstract',
        score: 0.92,
        metadata: {
            patentId: 'US-10112233-B2',
            patent_id: 'US-10112233-B2',
            title: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
            abstract: 'An autonomous navigation method combining LiDAR depth mapping and optical flow velocity measurement for GPS-denied environments.',
            claims: '1. A flight navigation system comprising LiDAR and optical flow sensors...',
            ipc: 'B64C 39/02',
            country: 'US',
            owner: 'AeroTech Systems Inc.',
            publication_date: '2023-05-12',
            section: 'abstract',
        },
    },
    {
        id: 'US-99887766-B1_claims',
        score: 0.84,
        metadata: {
            patentId: 'US-99887766-B1',
            patent_id: 'US-99887766-B1',
            title: 'LiDAR-assisted optical flow sensor fusion for quadcopters',
            abstract: 'A sensor fusion algorithm for micro aerial vehicles.',
            claims: '1. A method for velocity estimation using optical flow and range finder distance data...',
            ipc: 'B64C 39/02',
            country: 'US',
            owner: 'DroneDynamics Corp.',
            publication_date: '2022-11-04',
            section: 'claims',
        },
    },
];
export const mockSearchResults = [
    {
        rank: 1,
        score: 0.92,
        patentId: 'US-10112233-B2',
        title: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
        abstract: 'An autonomous navigation method combining LiDAR depth mapping and optical flow velocity measurement for GPS-denied environments.',
        claims: '1. A flight navigation system comprising LiDAR and optical flow sensors...',
        ipc: 'B64C 39/02',
        country: 'US',
        owner: 'AeroTech Systems Inc.',
        publicationDate: '2023-05-12',
        section: 'abstract',
    },
    {
        rank: 2,
        score: 0.84,
        patentId: 'US-99887766-B1',
        title: 'LiDAR-assisted optical flow sensor fusion for quadcopters',
        abstract: 'A sensor fusion algorithm for micro aerial vehicles.',
        claims: '1. A method for velocity estimation using optical flow and range finder distance data...',
        ipc: 'B64C 39/02',
        country: 'US',
        owner: 'DroneDynamics Corp.',
        publicationDate: '2022-11-04',
        section: 'claims',
    },
];
export const mockSearchResponse = {
    success: true,
    query: mockSearchQuery,
    count: 2,
    searchHistoryId: 'a540aa40-a25c-427c-8848-dea943861a3a',
    filters: mockSearchRequest.filters,
    results: mockSearchResults,
    metrics: {
        queryEmbeddingTimeMs: 35,
        pineconeSearchTimeMs: 95,
        totalExecutionTimeMs: 130,
        totalResults: 2,
    },
};
//# sourceMappingURL=search.fixtures.js.map