'use client';

import { Sparkles, ShieldCheck, Heart, Activity, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductStoryPage() {
  const stories = [
    {
      title: 'Herbal Immune Booster Elixir',
      category: 'Health & Wellness',
      desc: 'Formulated with authentic organic spirulina, moringa, and black seed oil to naturally amplify your vitality and daily immune defenses.',
      highlight: '100% Organic & Halal Certified',
      icon: Activity,
    },
    {
      title: 'Glow Radiance Collagen Serum',
      category: 'Beauty & Skincare',
      desc: 'Enriched with botanical peptides and vitamin C, this luxury serum deeply hydrates, restores skin elasticity, and provides an age-defying glow.',
      highlight: 'Dermatologically Tested',
      icon: Sparkles,
    },
    {
      title: 'Daily Detox & Herbal Slim Tea',
      category: 'Wellness & Digestion',
      desc: 'A therapeutic blend of rare green teas and antioxidant herbs that optimizes digestion, burns excess calories, and cleanses body toxins.',
      highlight: 'Zero Caffeine & All Natural',
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-teal-600 via-emerald-600 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Product Story</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl">
          The heritage, scientific validation, and organic pure ingredients behind ABS International’s health, beauty, and wellness range.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> The ABS Product Story & Philosophy
          </CardTitle>
          <CardDescription>
            Pioneering organic healthcare solutions certified by modern clinical standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            At <strong>ABS International</strong>, every product represents our dedication to holistic well-being. Our formulation process begins with ethically harvested organic herbs, processed in GMP-certified facilities to preserve bioactive potency without synthetic binders or toxic additives.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {stories.map((story, idx) => (
              <Card key={idx} className="border bg-muted/20">
                <CardHeader className="pb-2">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <story.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="w-fit text-[10px]">{story.category}</Badge>
                  <CardTitle className="text-sm font-bold mt-1">{story.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{story.desc}</p>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> {story.highlight}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
