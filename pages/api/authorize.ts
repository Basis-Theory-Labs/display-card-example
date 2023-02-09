import { BasisTheory } from '@basis-theory/basis-theory-js';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  expiringKey: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (
    req.method !== 'POST' ||
    typeof req.body?.tokenId !== 'string' ||
    typeof req.body?.nonce !== 'string'
  ) {
    res.status(404).end();

    return;
  }

  const { nonce, tokenId } = req.body;

  const bt = await new BasisTheory().init(process.env.BASIS_THEORY_PRIVATE_KEY);

  await bt.sessions.authorize({
    nonce,
    rules: [
      {
        description: 'Allow revealing card',
        priority: 1,
        conditions: [
          {
            attribute: 'id',
            operator: 'equals',
            value: tokenId,
          },
        ],
        permissions: ['token:read'],
        transform: 'reveal',
      },
    ],
  });

  res.status(200).end();
};

export default handler;
