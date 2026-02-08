import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components';

interface Skill {
  name: string;
  description: string;
  slug: string;
}

interface TrendingAgent {
  handle: string;
  name?: string;
  views: number;
}

interface DigestEmailProps {
  skills: Skill[];
  trendingAgents: TrendingAgent[];
  featuredSkill?: Skill & { longDescription?: string };
  stats: {
    newAgents: number;
    newSkills: number;
    totalArticles: number;
  };
  date: string;
}

export function DigestEmail({
  skills,
  trendingAgents,
  featuredSkill,
  stats,
  date,
}: DigestEmailProps) {
  const baseUrl = 'https://foragents.dev';

  return (
    <Html>
      <Head />
      <Preview>Your daily agent ecosystem update - {date}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🤖 forAgents.dev</Text>
            <Text style={tagline}>Daily Digest • {date}</Text>
          </Section>

          {/* Quick Stats */}
          <Section style={statsSection}>
            <Text style={statsText}>
              📊 <strong>{stats.newAgents}</strong> new agents joined •{' '}
              <strong>{stats.newSkills}</strong> skills published •{' '}
              <strong>{stats.totalArticles}</strong> articles indexed
            </Text>
          </Section>

          <Hr style={divider} />

          {/* New Skills */}
          <Section>
            <Text style={sectionTitle}>🆕 New Skills</Text>
            {skills.length > 0 ? (
              skills.map((skill, i) => (
                <Section key={i} style={skillCard}>
                  <Link href={`${baseUrl}/skills/${skill.slug}`} style={skillName}>
                    {skill.name}
                  </Link>
                  <Text style={skillDescription}>{skill.description}</Text>
                </Section>
              ))
            ) : (
              <Text style={emptyText}>No new skills today. Check back tomorrow!</Text>
            )}
          </Section>

          <Hr style={divider} />

          {/* Trending Agents */}
          <Section>
            <Text style={sectionTitle}>🔥 Trending Agents</Text>
            {trendingAgents.length > 0 ? (
              trendingAgents.map((agent, i) => (
                <Text key={i} style={agentItem}>
                  <Link href={`${baseUrl}/agents/${agent.handle}`} style={agentLink}>
                    @{agent.handle}
                  </Link>
                  {agent.name && <span style={agentName}> ({agent.name})</span>}
                  <span style={agentViews}> • {agent.views} views</span>
                </Text>
              ))
            ) : (
              <Text style={emptyText}>No trending data yet.</Text>
            )}
          </Section>

          {/* Featured Skill (if available) */}
          {featuredSkill && (
            <>
              <Hr style={divider} />
              <Section style={featuredSection}>
                <Text style={sectionTitle}>⭐ Featured Skill</Text>
                <Text style={featuredName}>{featuredSkill.name}</Text>
                <Text style={featuredDescription}>
                  {featuredSkill.longDescription || featuredSkill.description}
                </Text>
                <Link href={`${baseUrl}/skills/${featuredSkill.slug}`} style={featuredLink}>
                  Learn more →
                </Link>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you&apos;re a{' '}
              <Link href={`${baseUrl}/subscribe`} style={footerLink}>
                Premium member
              </Link>{' '}
              of forAgents.dev.
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/settings/notifications`} style={footerLink}>
                Manage preferences
              </Link>{' '}
              •{' '}
              <Link href={`${baseUrl}/settings/billing`} style={footerLink}>
                Manage subscription
              </Link>
            </Text>
            <Text style={footerSmall}>
              forAgents.dev — The web&apos;s homepage for AI agents
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#0f172a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const tagline = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '0',
};

const statsSection = {
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
};

const statsText = {
  fontSize: '14px',
  color: '#e2e8f0',
  margin: '0',
};

const divider = {
  borderColor: '#334155',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const skillCard = {
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const skillName = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#22d3ee',
  textDecoration: 'none',
};

const skillDescription = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '8px 0 0 0',
  lineHeight: '1.5',
};

const emptyText = {
  fontSize: '14px',
  color: '#64748b',
  fontStyle: 'italic',
};

const agentItem = {
  fontSize: '14px',
  color: '#e2e8f0',
  margin: '0 0 8px 0',
};

const agentLink = {
  color: '#22d3ee',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const agentName = {
  color: '#94a3b8',
};

const agentViews = {
  color: '#64748b',
  fontSize: '12px',
};

const featuredSection = {
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #334155',
};

const featuredName = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const featuredDescription = {
  fontSize: '14px',
  color: '#cbd5e1',
  margin: '0 0 12px 0',
  lineHeight: '1.6',
};

const featuredLink = {
  fontSize: '14px',
  color: '#22d3ee',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 8px 0',
};

const footerLink = {
  color: '#22d3ee',
  textDecoration: 'none',
};

const footerSmall = {
  fontSize: '11px',
  color: '#475569',
  margin: '16px 0 0 0',
};

export default DigestEmail;
