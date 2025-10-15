'use client';

<<<<<<< HEAD
import { PoolForm } from './pool-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
=======
import { DataImporter } from './data-importer';
import { PoolForm } from './pool-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
>>>>>>> acefa534c9bbbfe0f81d1da78714b4c22e3937c8
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewPoolClient() {
<<<<<<< HEAD
=======
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

>>>>>>> acefa534c9bbbfe0f81d1da78714b4c22e3937c8
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
<<<<<<< HEAD
          <PoolForm />
=======
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
>>>>>>> acefa534c9bbbfe0f81d1da78714b4c22e3937c8
        </CardContent>
      </Card>
    </div>
  );
}
