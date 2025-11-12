"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Scan,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

import { useAppContext } from '@/contexts/AppContext';
import { type Alert } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { analyzeImage, type AnalyzeImageOutput } from '@/ai/flows/analyze-image-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

const ITEMS_PER_PAGE = 10;

export function AlertLog() {
  const { alerts, deleteAlert, refreshAlerts, deleteAllAlerts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageOutput | null>(null);
  const { toast } = useToast();

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        const matchesSearch =
          alert.person_id.toString().includes(searchTerm) ||
          alert.behaviour_type
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          alert.camera_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
          filterType === 'all' || alert.behaviour_type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const behaviorTypes = ['all', 'fall', 'lying_motionless', 'loitering'];

  const exportToCSV = () => {
    const headers = ['ID', 'Person ID', 'Behavior', 'Confidence', 'Timestamp', 'Camera'];
    const rows = filteredAlerts.map(alert => [
      alert.id,
      alert.person_id,
      alert.behaviour_type,
      alert.confidence,
      new Date(alert.timestamp).toISOString(),
      alert.camera_id
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const getBehaviorBadge = (type: Alert['behaviour_type']) => {
    switch (type) {
      case 'fall':
        return <Badge variant="destructive">{type.replace(/_/g, ' ')}</Badge>;
      case 'lying_motionless':
        return <Badge variant="secondary">{type.replace(/_/g, ' ')}</Badge>;
      case 'loitering':
        return <Badge variant="outline">{type.replace(/_/g, ' ')}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const handleAnalyzeSnapshot = async () => {
    if (!selectedAlert?.snapshot_path) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeImage({ photoDataUri: selectedAlert.snapshot_path });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the snapshot image.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedAlert(null);
      setAnalysisResult(null);
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by person, behavior, camera..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => { setFilterType(value); setCurrentPage(1); }} value={filterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    {behaviorTypes.map(type => (
                        <SelectItem key={type} value={type}>
                            {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={refreshAlerts} variant="outline" size="icon" aria-label="Refresh alerts"><RefreshCw className="h-4 w-4"/></Button>
            <Button onClick={exportToCSV} variant="outline" size="icon" aria-label="Download alerts"><Download className="h-4 w-4"/></Button>
            <Button onClick={() => { if(confirm('Are you sure you want to delete all alerts?')) deleteAllAlerts()}} variant="destructive" size="icon" aria-label="Delete all alerts"><Trash2 className="h-4 w-4"/></Button>
          </div>
      </div>

      <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Behavior</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No alerts found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAlerts.map(alert => (
                  <TableRow key={alert.id}>
                    <TableCell>{getBehaviorBadge(alert.behaviour_type)}</TableCell>
                    <TableCell>
                        <div className="font-medium">Person {alert.person_id}</div>
                        <div className="text-sm text-muted-foreground">{alert.camera_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Progress value={alert.confidence * 100} className="w-24 h-2" />
                        <span className="text-sm font-mono text-muted-foreground">{(alert.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(alert.timestamp), "PPp")}</TableCell>
                    <TableCell className="text-right">
                        <Button onClick={() => setSelectedAlert(alert)} variant="ghost" size="icon" aria-label="View alert"><Eye className="h-4 w-4" /></Button>
                        <Button onClick={() => { if(confirm('Delete this alert?')) deleteAlert(alert.id); }} variant="ghost" size="icon" className="text-destructive-foreground hover:text-destructive" aria-label="Delete alert"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight /></Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedAlert} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle>Alert Details: #{selectedAlert.id}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image src={selectedAlert.snapshot_path} alt="Alert snapshot" fill objectFit="cover" data-ai-hint="person falling" />
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-semibold text-muted-foreground">Behavior:</span> {getBehaviorBadge(selectedAlert.behaviour_type)}</div>
                    <div><span className="font-semibold text-muted-foreground">Confidence:</span> <span className="font-mono">{(selectedAlert.confidence * 100).toFixed(2)}%</span></div>
                    <div><span className="font-semibold text-muted-foreground">Person ID:</span> Person {selectedAlert.person_id}</div>
                    <div><span className="font-semibold text-muted-foreground">Camera:</span> {selectedAlert.camera_id}</div>
                    <div><span className="font-semibold text-muted-foreground">Timestamp:</span> {format(new Date(selectedAlert.timestamp), "PPp")}</div>
                  </div>
                   <Button onClick={handleAnalyzeSnapshot} disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Scan className="mr-2 h-4 w-4" />
                    )}
                    Analyze Snapshot
                  </Button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">AI Analysis</h3>
                  {isAnalyzing && (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {analysisResult ? (
                    <ScrollArea className="h-[450px] p-4 rounded-md border bg-muted/20">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1">Scene Description</h4>
                          <p className="text-sm text-muted-foreground">{analysisResult.description}</p>
                        </div>
                         <div>
                          <h4 className="font-semibold mb-1">Detected Action</h4>
                          <p className="text-sm text-muted-foreground">{analysisResult.action}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Perceived Emotion</h4>
                          <p className="text-sm text-muted-foreground">{analysisResult.emotion}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Objects & Animals Detected</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.objects.length > 0 ? (
                              analysisResult.objects.map((obj, i) => <Badge key={i} variant="secondary">{obj}</Badge>)
                            ) : (
                              <p className="text-sm text-muted-foreground">No specific objects detected.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    !isAnalyzing && <div className="text-center text-muted-foreground py-8">Click "Analyze Snapshot" to generate an AI analysis.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
