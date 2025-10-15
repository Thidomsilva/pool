'use client';

import { PoolForm } from './pool-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewPoolClient() {
  return (
    <div className="p-4 md:p-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Create New Pool</CardTitle>
          <CardDescription>
            Manually fill in the details of your new liquidity pool position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PoolForm />
        </CardContent>
      </Card>
    </div>
  );
}
