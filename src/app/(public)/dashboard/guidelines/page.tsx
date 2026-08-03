'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, ExternalLink } from 'lucide-react';

export default function GuidelinesPage() {
  const manuals = [
    { title: 'ABS International MLM Compensation Plan v1.0', size: '2.4 MB', file: '/guidelines/compensation_plan.pdf' },
    { title: 'Seba Health Card & Diagnostics Benefit Coverage Guideline', size: '1.1 MB', file: '/guidelines/seba_guide.pdf' },
    { title: 'Platform Security & Wallet Transaction PIN Policy', size: '850 KB', file: '/guidelines/wallet_policy.pdf' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Guidelines & Policy Documents</h1>
        <p className="text-sm text-muted-foreground font-medium">Download PDF manuals for MLM commissions, health network listings, and platform rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {manuals.map((manual, idx) => (
          <Card key={idx} className="bg-white border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-base font-bold text-slate-800 leading-snug">{manual.title}</CardTitle>
                <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0"><FileText className="h-5 w-5" /></div>
              </div>
              <CardDescription>File size: {manual.size}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs font-bold gap-1" onClick={() => window.open(manual.file, '_blank')}>
                <Eye className="h-3.5 w-3.5" /> View PDF
              </Button>
              <Button size="sm" className="flex-1 rounded-lg text-xs font-bold gap-1" onClick={() => window.open(manual.file, '_blank')}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
