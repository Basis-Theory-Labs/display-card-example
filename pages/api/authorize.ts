import { BasisTheory } from '@basis-theory/basis-theory-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ttl } from '../../components/constants';

type Data = {
  expiringKey: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== 'POST' && typeof req.body?.tokenId !== 'string') {
    res.status(404).end();

    return;
  }

  const bt = await new BasisTheory().init(
    process.env.BASIS_THEORY_PRIVATE_KEY as string
  );

  const expiringApplication = await bt.applications.create({
    type: 'expiring',
    expires_at: ttl(),
    rules: [
      {
        description: 'Reveal Card',
        priority: 1,
        transform: 'reveal', // required for reveal
        container: '/pci/high/',
        conditions: [
          {
            attribute: 'id',
            operator: 'EQUALS',
            value: req.body?.tokenId,
          },
        ],
        permissions: ['token:read'], // required for reveal
      },
    ],
  } as any);

  res.status(200).json({
    expiringKey: expiringApplication.key as string,
  });
};

export default handler;
