export declare function createPrismaMock(): {
    prismaMock: any;
    searchHistoryMock: {
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findFirst: import("vitest").Mock<import("@vitest/spy").Procedure>;
        count: import("vitest").Mock<import("@vitest/spy").Procedure>;
        delete: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    retrievedPatentMock: {
        createMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    noveltyAnalysisMock: {
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findFirst: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
};
//# sourceMappingURL=prisma.mock.d.ts.map