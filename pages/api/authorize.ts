import { BasisTheory } from '@basis-theory/basis-theory-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ttl } from '../../components/constants';

type Data = {
  expiringKey: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== 'POST' || typeof req.body?.tokenId !== 'string') {
    res.status(404).end();

    return;
  }

  const bt = await new BasisTheory().init(process.env.BASIS_THEORY_PRIVATE_KEY);

  const expiringApplication = await bt.applications.create({
    type: 'expiring',
    expiresAt: ttl(),
    rules: [
      {
        description: 'Reveal Card',
        priority: 1,
        transform: 'reveal',
        conditions: [
          {
            attribute: 'id',
            operator: 'equals',
            value: req.body.tokenId,
          },
        ],
        permissions: ['token:read'], // required for reveal
      },
    ],
  });

  res.status(200).json({
    expiringKey: expiringApplication.key as string,
  });
};

export default handler;
