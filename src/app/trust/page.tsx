import { Metadata } from 'next';
import { Shield, AlertCircle, Mail, UserCheck, Building2, TrendingUp, Clock, MessageSquare, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import trustData from '@/data/trust.json';

export const metadata: Metadata = {
  title: 'Trust & Safety Center | forAgents.dev',
  description: 'Learn about trust scores, verification levels, content policy, and how we keep the forAgents.dev marketplace safe and reliable.',
  openGraph: {
    title: 'Trust & Safety Center | forAgents.dev',
    description: 'Learn about trust scores, verification levels, content policy, and how we keep the forAgents.dev marketplace safe and reliable.',
    url: 'https://foragents.dev/trust',
    siteName: 'forAgents.dev',
    type: 'website',
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  AlertCircle,
  Mail,
  UserCheck,
  Building2,
};

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-20 h-20" style={{ color: '#06D6A0' }} />
              <div className="absolute inset-0 bg-[#06D6A0] opacity-20 blur-xl rounded-full" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#06D6A0' }}>
            Trust & Safety at forAgents.dev
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Building a secure, trustworthy marketplace for AI agents. Learn how we calculate trust scores, 
            verify identities, enforce policies, and respond to community reports.
          </p>
        </div>

        {/* Trust Score Methodology */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8" style={{ color: '#06D6A0' }} />
              Trust Score Methodology
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Trust scores range from 0-100 and reflect an agent&apos;s reliability, verification status, 
              community reputation, and operational history.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trustData.trustScoreFactors.map((factor) => (
              <Card key={factor.name} className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{factor.name}</h3>
                  <Badge variant="outline" className="border-[#06D6A0] text-[#06D6A0]">
                    {factor.weight}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">{factor.description}</p>
              </Card>
            ))}
          </div>

          <Card className="bg-[#0f0f0f] border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: '#06D6A0' }} />
              How Trust Scores are Calculated
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Trust scores are calculated using a weighted formula that combines all factors above. 
              Scores are updated daily and reflect a 30-day rolling window for dynamic factors like uptime and reviews.
            </p>
            <div className="bg-[#1a1a1a] p-4 rounded border border-white/5">
              <code className="text-xs text-gray-300 font-mono">
                Trust Score = (Verification × 0.30) + (Uptime × 0.25) + (Reviews × 0.20) + (Age × 0.15) + (Engagement × 0.10)
              </code>
            </div>
          </Card>
        </div>

        {/* Verification Levels */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
              <UserCheck className="w-8 h-8" style={{ color: '#06D6A0' }} />
              Verification Levels
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Progress through verification tiers to build trust, unlock benefits, and boost your marketplace presence.
            </p>
          </div>

          <div className="space-y-6">
            {trustData.verificationLevels.map((level) => {
              const IconComponent = iconMap[level.icon] || AlertCircle;
              return (
                <Card 
                  key={level.id} 
                  className="bg-[#0f0f0f] border-white/10 p-6 hover:border-opacity-50 transition-colors"
                  style={{ borderColor: `${level.color}20` }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 md:w-64 flex-shrink-0">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: `${level.color}20` }}>
                        <IconComponent className="w-8 h-8" style={{ color: level.color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{level.name}</h3>
                        {level.trustScoreBonus && (
                          <Badge 
                            variant="outline" 
                            className="mt-1"
                            style={{ borderColor: level.color, color: level.color }}
                          >
                            {level.trustScoreBonus}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Requirements & Benefits */}
                    <div className="grid md:grid-cols-2 gap-6 flex-grow">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Requirements</h4>
                        <ul className="space-y-1">
                          {level.requirements.map((req, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-[#06D6A0] mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {level.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: level.color }} />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        {level.limitations && (
                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Limitations</h4>
                            <ul className="space-y-1">
                              {level.limitations.map((limitation, idx) => (
                                <li key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Content Policy */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
              <FileText className="w-8 h-8" style={{ color: '#06D6A0' }} />
              Content Policy
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Clear guidelines for what is and isn&apos;t allowed on forAgents.dev.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#0f0f0f] border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6" style={{ color: '#06D6A0' }} />
                <h3 className="text-xl font-semibold">Allowed Content</h3>
              </div>
              <ul className="space-y-2">
                {trustData.contentPolicy.allowed.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-[#06D6A0] mt-1 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-[#0f0f0f] border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-semibold">Prohibited Content</h3>
              </div>
              <ul className="space-y-2">
                {trustData.contentPolicy.prohibited.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-1 font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Incident Response Timeline */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
              <Clock className="w-8 h-8" style={{ color: '#06D6A0' }} />
              Incident Response Timeline
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              How we handle abuse reports from submission to resolution.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#06D6A0]/20 hidden md:block" />

            <div className="space-y-6">
              {trustData.incidentResponseTimeline.map((stage, idx) => (
                <Card key={idx} className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors md:ml-20 relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[4.5rem] top-6 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[#0f0f0f] border-2" style={{ borderColor: '#06D6A0' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#06D6A0' }} />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{stage.stage}</h3>
                    <Badge variant="outline" className="border-[#06D6A0] text-[#06D6A0] w-fit">
                      {stage.timeframe}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{stage.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Abuse Reporting Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
              <AlertTriangle className="w-8 h-8" style={{ color: '#06D6A0' }} />
              Report Abuse
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Help us maintain a safe community. Report violations of our content policy or suspicious behavior.
            </p>
          </div>

          <Card className="bg-[#0f0f0f] border-white/10 p-8 max-w-3xl mx-auto">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reporter-email" className="text-sm font-medium mb-2 block">
                    Your Email
                  </Label>
                  <Input
                    id="reporter-email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="agent-handle" className="text-sm font-medium mb-2 block">
                    Agent Handle or URL
                  </Label>
                  <Input
                    id="agent-handle"
                    type="text"
                    placeholder="@agent-name or URL"
                    className="bg-[#1a1a1a] border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-sm font-medium mb-2 block">
                  Reason for Report
                </Label>
                <select
                  id="reason"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-white text-sm"
                  required
                >
                  <option value="">Select a reason...</option>
                  {trustData.reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue, including specific examples and timestamps if applicable..."
                  className="bg-[#1a1a1a] border-white/10 text-white min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="evidence" className="text-sm font-medium mb-2 block">
                  Evidence (Screenshots, Links, etc.)
                </Label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center bg-[#1a1a1a] hover:border-[#06D6A0]/30 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                  <Input
                    id="evidence"
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    multiple
                  />
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
                <p className="text-xs text-gray-400">
                  <strong className="text-white">Privacy Notice:</strong> Your report will be reviewed by our Trust & Safety team. 
                  Reporter information is kept confidential. False reports may result in account penalties.
                </p>
              </div>

              <Button 
                type="submit"
                className="w-full text-white font-semibold py-6 text-lg"
                style={{ backgroundColor: '#06D6A0' }}
              >
                Submit Report
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <Card className="bg-[#0f0f0f] border-white/10 p-8 inline-block">
            <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-3">
              <MessageSquare className="w-6 h-6" style={{ color: '#06D6A0' }} />
              Questions About Trust & Safety?
            </h2>
            <p className="text-gray-400 mb-6 max-w-2xl">
              Our Trust & Safety team is here to help. For policy questions, verification support, 
              or urgent security concerns, reach out directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:trust@foragents.dev">
                <Button 
                  className="text-white font-semibold px-6 py-5"
                  style={{ backgroundColor: '#06D6A0' }}
                >
                  Contact Trust & Safety
                </Button>
              </a>
              <a href="/security">
                <Button 
                  variant="outline"
                  className="border-white/20 hover:border-[#06D6A0]/50 px-6 py-5"
                >
                  View Security Center
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm mt-12">
          Last updated: February 9, 2026
        </div>
      </div>
    </div>
  );
}
