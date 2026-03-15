import { getPayloadCached } from '@/lib/payload';

export const GET = async () => {
  const payload = await getPayloadCached();

  const data = await payload.find({
    collection: 'categories',
  });

  return Response.json(data);
};
