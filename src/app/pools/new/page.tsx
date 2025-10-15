import { PoolForm } from '@/components/app/pools/pool-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

export default function NewPoolPage() {
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
