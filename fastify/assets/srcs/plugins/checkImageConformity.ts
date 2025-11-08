import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'
import idim from 'image-dimensions'
import { ReadableStream } from 'node:stream/web';

export default fp(async function(fastify, opts) {
    fastify.decorate("checkImageConformity", async function(request: FastifyRequest, reply: FastifyReply) {
        try {
            const file = await request.file();
            if (!file)
                throw (new Error('No file uploaded'));

            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype))
                throw (new Error('Invalid file type'));

            // read once into a Buffer and reuse
            const buffer = await file.toBuffer();

            const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB
            if (buffer.length > maxSizeInBytes)
                throw (new Error('File size exceeds limit'));

            const ratiox = 9;
            const ratioy = 16;
            const minWidth = 150;
            const maxWidth = 1080;

            const currentSize = await idim.imageDimensionsFromData(buffer);
            if (!currentSize)
                throw new Error('Unrecognized file format');

            const ratio = (currentSize.width / currentSize.height).toPrecision(3);
            const expectedRatio = (ratiox / ratioy).toPrecision(3);
            if (currentSize.width > maxWidth || currentSize.width < minWidth || ratio != expectedRatio)
                throw new Error('Wrong file dimensions');

            // attach buffer + meta to the request so later handlers can reuse it
            request.fileBuffer = buffer;
            request.fileMeta = {
                filename: file.filename,
                mimetype: file.mimetype,
                fields: file.fields // if you need multipart fields
            };
        } catch (err) {
            if (err instanceof Error && err.message)
                return reply.status(400).send({ error: err.message });
            return reply.status(400).send({ error: 'Bad request' });
        }
    })
})