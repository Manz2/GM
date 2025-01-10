import React, { useEffect } from 'react';
import Head from 'next/head';
import { Typography } from '@mui/material';
import { useRouter } from 'next/router';


export default function Home() {
    const router = useRouter();
  useEffect(() => {
      router.push('/login');
  }, [router]);

  return (
      <>
        <Head>
          <title>Home</title>
        </Head>
        <Typography variant="h4">.</Typography>
      </>
  );
}


