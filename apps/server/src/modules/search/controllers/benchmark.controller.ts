import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IBenchmarkService } from '../interfaces/benchmark.interface.js';
import { BenchmarkRequestDtoSchema, type BenchmarkRequestDto } from '../dto/benchmark.dto.js';
import { BadRequestError } from '../../../common/errors/http-errors.js';

export class BenchmarkController {
  constructor(private readonly benchmarkService: IBenchmarkService) {}

  /**
   * HTTP POST /api/search/benchmark Handler.
   * Executes multi-query performance benchmark and calculates latency percentiles and IR quality metrics.
   */
  async benchmark(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.body || typeof request.body !== 'object') {
      throw new BadRequestError('Invalid benchmark request body');
    }

    // 1. Zod Validation
    const parseResult = BenchmarkRequestDtoSchema.safeParse(request.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const errorMessage = issue ? issue.message : 'Invalid benchmark request payload';
      throw new BadRequestError(errorMessage);
    }

    const validatedDto: BenchmarkRequestDto = parseResult.data;

    // 2. Execute Benchmark Service
    const report = await this.benchmarkService.runBenchmark(validatedDto);

    // 3. Log Performance Summary without full query payload
    request.log.info(
      `[BenchmarkAPI] totalRuns=${report.summary.queries} | avgLatency=${report.summary.averageLatency}ms | P95=${report.summary.p95Latency}ms | throughput=${report.summary.throughput} req/s`
    );

    // 4. Return JSON response
    reply.status(200).send(report);
  }
}
