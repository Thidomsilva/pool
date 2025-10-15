'use client';

import { DataImporter } from './data-importer';
import { PoolForm } from './pool-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewPoolClient() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = async (text: string) => {
    setLoading(true);
    setError(null);
    setParsedData(null);
    try {
      const res = await fetch('/api/processLpInput', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const result = await res.json();
      if (result.data) {
        setParsedData(result.data);
        setShowForm(true);
      } else {
        setError(result.error || 'Erro ao processar dados.');
        setShowForm(false);
      }
    } catch (e) {
      setError('Erro de rede ou servidor.');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const onFormSaved = () => {
    toast({
      title: 'Pool Saved',
      description: 'Your new pool has been added to the dashboard.',
      action: <CheckCircle className="text-green-500" />,
    });
    router.push('/dashboard');
  };

  const handleReset = () => {
    setShowForm(false);
    setParsedData(null);
    setError(null);
  };

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
            <DataImporter onImport={handleImport} loading={loading} />
          ) : (
            <PoolForm parsedData={parsedData} onReset={handleReset} onSaved={onFormSaved} />
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
