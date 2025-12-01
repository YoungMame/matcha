import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'
import { imageDimensionsFromData } from 'image-dimensions'
import { MultipartFile } from '@fastify/multipart'

export default fp(async function(fastify, opts) {
    fastify.decorate("checkImageConformity", async function(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { file } = request.body as { file?: MultipartFile };
            if (!file)
                throw (new Error('No file uploaded'));

            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype))
                throw (new Error('Invalid file type'));

            // read once into a Buffer and reuse
            const buffer = await file.toBuffer();
            if (!buffer || buffer.length === 0)
                throw (new Error('Failed to read uploaded file'));

            const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB
            if (buffer.length > maxSizeInBytes)
                throw (new Error('File size exceeds limit'));


            const ratiox = 9;
            const ratioy = 16;
            const minWidth = 150;
            const maxWidth = 1080;

            const currentSize = imageDimensionsFromData(buffer);
            request.fileBuffer = buffer;
            request.fileMeta = {
                filename: file.filename,
                mimetype: file.mimetype,
                fields: file.fields, // if you need multipart fields
            };

            const rawCrop = (request.body as { crop?: { value: string } })?.crop?.value;
            let crop: { width?: number; height?: number; x?: number; y?: number } | undefined;
            if (typeof rawCrop === 'string') {
                try {
                    const parsed = JSON.parse(rawCrop);
                    crop = parsed && typeof parsed === 'object' ? parsed : undefined;
                } catch (e) {
                    throw new Error('Invalid crop JSON');
                }
            } else if (rawCrop && typeof rawCrop === 'object') {
                crop = rawCrop;
            }

            const width = crop?.width != null ? Number(crop.width) : undefined;
            const height = crop?.height != null ? Number(crop.height) : undefined;
            if (width && height) {
                let rotation = Number((request.body as { rotation?: { value: string } }).rotation?.value) || 0;
                if (rotation > 180) rotation = 180;
                if (rotation < -180) rotation = -180;
                const ratio = (width / height).toPrecision(2);
                const expectedRatio = (ratiox / ratioy).toPrecision(2);
                // console.log('width', width);
                // console.log('width > maxWidth', width > maxWidth);
                // console.log('width < minWidth', width < minWidth);
                // console.log(ratio)
                // console.log(expectedRatio)

                if (width > maxWidth || width < minWidth || ratio != expectedRatio)
                    throw new Error('Wrong file dimensions after crop/rotation');
                return; // Skip other checks
            }

            if (!currentSize)
                throw new Error('Unrecognized file format');

            const ratio = (currentSize.width / currentSize.height).toPrecision(2);
            const expectedRatio = (ratiox / ratioy).toPrecision(2);
            if (currentSize.width > maxWidth || currentSize.width < minWidth || ratio != expectedRatio)
                throw new Error('Wrong file dimensions');
        } catch (err) {
            if (err instanceof Error && err.message)
                return reply.status(400).send({ error: err.message });
            return reply.status(400).send({ error: 'Bad request' });
        }
    })
})