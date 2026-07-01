import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHSCode } from '../api/search';
import { FileText, ArrowLeft, Calculator, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export function HSCodeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: hsCode, isLoading, isError } = useQuery({
    queryKey: ['hscode', id],
    queryFn: () => getHSCode(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-12 text-center">Loading HS Code details...</div>;
  if (isError || !hsCode) return <div className="p-12 text-center text-red-500">Error loading HS Code or not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">HS {hsCode.code}</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Chapter {hsCode.chapter} &middot; Heading {hsCode.heading}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Official Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {hsCode.description}
              </p>
            </CardContent>
          </Card>

          {hsCode.notes && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
              <CardHeader>
                <CardTitle className="text-amber-800 dark:text-amber-500 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-900 dark:text-amber-400/90 whitespace-pre-wrap text-sm">
                  {hsCode.notes}
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Classification Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow">
                    <div className="font-bold text-slate-900 dark:text-white">Chapter {hsCode.chapter}</div>
                  </div>
                </div>
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-primary/80 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow">
                    <div className="font-bold text-slate-900 dark:text-white">Heading {hsCode.heading}</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-primary/60 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow border-l-4 border-l-primary">
                    <div className="font-bold text-slate-900 dark:text-white">HS Code {hsCode.code}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-md bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10">
            <CardHeader>
              <CardTitle>Calculate Duties</CardTitle>
              <CardDescription>Use this HS Code to estimate your import costs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => navigate(`/calculator?hs_code=${hsCode.code}`)}
              >
                <Calculator className="mr-2 h-5 w-5" /> Start Calculation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
