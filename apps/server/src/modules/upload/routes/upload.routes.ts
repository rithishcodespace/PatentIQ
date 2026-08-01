import type { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/upload.controller.js';
import {
  DocumentUploadSuccessSchema,
  DocumentDeleteSuccessSchema,
  standardErrorResponses,
} from '../../../common/schemas/swagger.schemas.js';

export async function uploadRoutes(
  fastify: FastifyInstance,
  controller: UploadController
): Promise<void> {
  // POST /api/upload - Upload patent document (PDF, DOCX, TXT)
  fastify.post('/', {
    schema: {
      tags: ['Document Upload'],
      summary: 'Upload Patent Document',
      description:
        'Uploads a patent-related document (PDF, DOCX, TXT up to 20MB) to secure local storage and records metadata in PostgreSQL.',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description:
              'Document file (Supported MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain)',
          },
        },
      },
      response: {
        201: DocumentUploadSuccessSchema,
        400: standardErrorResponses[400],
        422: standardErrorResponses[422],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.uploadFile(req, reply),
  });

  // GET /api/upload/:id - Retrieve document metadata by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Document Upload'],
      summary: 'Retrieve Document Metadata',
      description:
        'Fetches uploaded patent document metadata by ID without exposing the internal physical storage path.',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Uploaded Document ID' },
        },
        required: ['id'],
      },
      response: {
        200: DocumentUploadSuccessSchema,
        400: standardErrorResponses[400],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req: any, reply) => controller.getMetadata(req, reply),
  });

  // DELETE /api/upload/:id - Delete document record and stored file
  fastify.delete('/:id', {
    schema: {
      tags: ['Document Upload'],
      summary: 'Delete Uploaded Document',
      description: 'Deletes document metadata record from database and removes stored file from disk.',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Uploaded Document ID' },
        },
        required: ['id'],
      },
      response: {
        200: DocumentDeleteSuccessSchema,
        400: standardErrorResponses[400],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
      },
    },
    handler: (req: any, reply) => controller.deleteFile(req, reply),
  });
}
