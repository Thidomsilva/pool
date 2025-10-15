'use client';

import { useFormState } from 'react-dom';
import { DataImporter } from './data-importer';
import { PoolForm } from './pool-form';
import { processLpInput } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewPoolClient() {
  const [state, formAction] = useFormState(processLpInput, { data: null, error: null });
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state.data) {
      setShowForm(true);
    }
    if (state.error) {
      setShowForm(false);
    }
  }, [state]);

  const onFormSaved = () => {
    toast({
        title: "Pool Saved",
        description: "Your new pool has been added to the dashboard.",
        action: <CheckCircle className="text-green-500" />,
    });
    router.push('/dashboard');
  }

  const handleReset = () => {
    setShowForm(false);
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Create New Pool</CardTitle>
          <CardDescription>
            Paste text or upload a screenshot of your Uniswap LP position to
            auto-fill the form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <DataImporter formAction={formAction} />
          ) : (
            <PoolForm parsedData={state.data!} onReset={handleReset} onSaved={onFormSaved}/>
          )}

          {state.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
