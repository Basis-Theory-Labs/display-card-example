import React, { useEffect, useRef, useState } from 'react';
import {
  CardExpirationDateElement as ICardExpirationDateElement,
  CardNumberElement as ICardNumberElement,
  CardVerificationCodeElement as ICardVerificationCodeElement,
} from '@basis-theory/basis-theory-js/types/elements/elements';
import { Token } from '@basis-theory/basis-theory-js/types/models';
import {
  CardExpirationDateElement,
  CardNumberElement,
  CardVerificationCodeElement,
  useBasisTheory,
} from '@basis-theory/basis-theory-react';
import { VisibilityOffOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import BasisTheoryLogo from '../public/basis-theory.svg';
import { elementStyle } from './constants';

interface Props {
  tokenId?: string;
}

export const DisplayCard = ({ tokenId }: Props) => {
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<Token>();

  const { bt } = useBasisTheory();

  const cardNumberRef = useRef<ICardNumberElement>(null);
  const cardExpirationRef = useRef<ICardExpirationDateElement>(null);
  const cvcRef = useRef<ICardVerificationCodeElement>(null);

  const showCardholderData = async () => {
    setBusy(true);

    if (bt) {
      const {
        data: { expiringKey },
      } = await axios.post('/api/authorize');

      const _token = await bt.tokens.retrieve(tokenId as string, {
        apiKey: expiringKey,
      });

      await Promise.all([
        (cardNumberRef.current as any)?.setValue((_token.data as any).number),
        (cardExpirationRef.current as any)?.setValue({
          year: (_token.data as any).expiration_year,
          month: (_token.data as any).expiration_month,
        }),
        // (cvcRef.current as any)?.setValue((_token.data as any).cvc), // currently disabled
      ]);

      setToken(_token);
      setBusy(false);
    }
  };

  useEffect(() => {
    if (tokenId) {
      setToken(undefined);
    }
  }, [tokenId]);

  return (
    <Box position="relative">
      {!token && (
        <Box
          alignItems="center"
          borderRadius="8px"
          display="flex"
          height="100%"
          justifyContent="center"
          position="absolute"
          sx={{
            backdropFilter: 'blur(6px)',
            borderRadius: '8px',
          }}
          width="100%"
          zIndex={1}
        >
          <LoadingButton
            color="secondary"
            disabled={!tokenId}
            loading={busy}
            onClick={showCardholderData}
            startIcon={<VisibilityOffOutlined />}
            type="button"
            variant="outlined"
          >
            {'Show Details'}
          </LoadingButton>
        </Box>
      )}
      <Card
        elevation={4}
        sx={{
          background:
            'linear-gradient(109.62deg, #FFFFFF 10.29%, #EFF2F9 100%)',
          borderRadius: '8px',
          width: 39 * 8,
        }}
      >
        <CardContent>
          <Box>
            <Image alt="logo" src={BasisTheoryLogo} />
          </Box>
          <Box mt={2}>
            <Typography color="grey.300" variant="caption">
              {'Card Number'}
            </Typography>
            <CardNumberElement
              disabled
              iconPosition="none"
              id="cardNumber"
              ref={cardNumberRef}
              style={elementStyle}
            />
          </Box>
          <Box display="flex" mt={2}>
            <Box display="flex" flexDirection="column">
              <Typography color="grey.300" variant="caption">
                {'Expiry Date'}
              </Typography>
              <CardExpirationDateElement
                disabled
                id="cardExpiration"
                ref={cardExpirationRef}
                style={elementStyle}
              />
            </Box>
            <Box display="flex" flexDirection="column" flexGrow={1} ml={3}>
              <Typography color="grey.300" variant="caption">
                {'CVC'}
              </Typography>
              <CardVerificationCodeElement
                disabled
                id="cvc"
                placeholder="***"
                ref={cvcRef}
                style={elementStyle}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
