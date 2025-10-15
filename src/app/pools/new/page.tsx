'use client';

import { PoolForm } from '@/components/app/pools/pool-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewPoolPage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Criar Nova Posição</CardTitle>
          <CardDescription>
            Preencha manualmente os detalhes da sua nova posição de liquidez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PoolForm />
        </CardContent>
      </Card>
    </div>
  );
}
