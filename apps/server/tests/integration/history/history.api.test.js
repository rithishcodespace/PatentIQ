import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestApp } from '../../helpers/app.helper.js';
import { mockHistoryRecord } from '../../fixtures/history.fixtures.js';
import { NotFoundError } from '../../../src/common/errors/http-errors.js';
describe('History API Integration Tests (GET/DELETE /api/history)', () => {
    let app;
    let mockHistoryService;
    beforeEach(async () => {
        const testSetup = await createTestApp();
        app = testSetup.app;
        mockHistoryService = testSetup.mockHistoryService;
    });
    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });
    it('GET /api/history - should list search history records with pagination', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/history?page=1&limit=10',
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.meta.page).toBe(1);
    });
    it('GET /api/v1/history - should support versioned route prefix', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/v1/history',
        });
        expect(response.statusCode).toBe(200);
    });
    it('GET /api/history/:id - should retrieve detailed history record by UUID', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/history/${mockHistoryRecord.id}`,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(mockHistoryRecord.id);
    });
    it('GET /api/history/:id - should return 404 when ID does not exist', async () => {
        mockHistoryService.getHistoryById.mockRejectedValueOnce(new NotFoundError("Search history record '00000000-0000-0000-0000-000000000000' not found"));
        const response = await app.inject({
            method: 'GET',
            url: '/api/history/00000000-0000-0000-0000-000000000000',
        });
        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Not Found');
    });
    it('DELETE /api/history/:id - should delete search history record and return success message', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/history/${mockHistoryRecord.id}`,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toContain(mockHistoryRecord.id);
    });
});
//# sourceMappingURL=history.api.test.js.map