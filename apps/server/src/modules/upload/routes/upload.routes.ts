import type { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/upload.controller.js';
import {
  DocumentUploadSuccessSchema,
  DocumentDeleteSuccessSchema,
  ProcessDirectTextPayloadSchema,
  ProcessDocumentSuccessSchema,
  EmbedDocumentRequestSchema,
  EmbedDocumentSuccessSchema,
  standardErrorResponses,
} from '../../../common/schemas/swagger.schemas.js';

export async function uploadRoutes(
  fastify: FastifyInstance,
  controller: UploadController
): Promise<void> {
  // POST /api/upload/process - Process Uploaded Document (PDF, DOCX, TXT)
  fastify.post('/process', {
    schema: {
      tags: ['Document Ingestion'],
      summary: 'Process Uploaded Patent Document',
      description:
        'Extracts and normalizes text from an uploaded document (PDF, DOCX, TXT) to produce a standardized patent document object.',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description:
              'Patent document file (Supported MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain)',
          },
        },
      },
      response: {
        200: ProcessDocumentSuccessSchema,
        400: standardErrorResponses[400],
        422: standardErrorResponses[422],
        500: standardErrorResponses[500],
      },
    },
    handler: (req, reply) => controller.processFileUpload(req, reply),
  });

  // POST /api/upload/process-text - Process Directly Entered Invention Text
  fastify.post('/process-text', {
    schema: {
      tags: ['Document Ingestion'],
      summary: 'Process Directly Entered Invention Text',
      description:
        'Normalizes manually entered invention text (title, abstract, claims, keywords) to produce the exact same standardized patent document object.',
      consumes: ['application/json'],
      body: ProcessDirectTextPayloadSchema,
      response: {
        200: ProcessDocumentSuccessSchema,
        400: standardErrorResponses[400],
        422: standardErrorResponses[422],
        500: standardErrorResponses[500],
      },
    },
    handler: (req: any, reply) => controller.processDirectText(req, reply),
  });

  // POST /api/upload/embed - Generate Patent Document Embeddings
  fastify.post('/embed', {
    schema: {
      tags: ['Document Ingestion'],
      summary: 'Generate Embeddings for Patent Document',
      description:
        'Generates section-wise embeddings (title, abstract, claims) using nomic-embed-text via Ollama for a processed document object or stored uploaded document ID.',
      consumes: ['application/json'],
      body: EmbedDocumentRequestSchema,
      response: {
        200: EmbedDocumentSuccessSchema,
        400: standardErrorResponses[400],
        404: standardErrorResponses[404],
        500: standardErrorResponses[500],
        503: standardErrorResponses[503],
      },
    },
    handler: (req: any, reply) => controller.embedDocument(req, reply),
  });

  // POST /api/upload - Upload patent document (PDF, DOCX, TXT) metadata & storage
  fastify.post('/', {
    schema: {
      tags: ['Document Upload'],
      summary: 'Upload Patent Document Metadata',
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
