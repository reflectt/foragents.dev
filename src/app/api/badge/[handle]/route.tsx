import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const cleanHandle = handle.replace(/^@/, '').replace(/\.svg$/, '').replace(/\.png$/, '');
  
  // Check if agent is verified (has agent.json)
  // For now, we'll generate a badge for any handle
  // In production, this would check against our database
  
  const searchParams = req.nextUrl.searchParams;
  const style = searchParams.get('style') || 'flat';
  const label = searchParams.get('label') || 'forAgents.dev';
  
  // Badge dimensions
  const height = 20;
  const labelWidth = label.length * 6.5 + 10;
  const handleWidth = cleanHandle.length * 6 + 20;
  const totalWidth = labelWidth + handleWidth;

  if (style === 'flat') {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <svg
            width={totalWidth}
            height={height}
            viewBox={`0 0 ${totalWidth} ${height}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Label background */}
            <rect x="0" y="0" width={labelWidth} height={height} fill="#555" rx="3" />
            {/* Handle background */}
            <rect x={labelWidth} y="0" width={handleWidth} height={height} fill="#22d3ee" rx="3" />
            {/* Fix corner overlap */}
            <rect x={labelWidth - 3} y="0" width="6" height={height} fill="#555" />
            <rect x={labelWidth} y="0" width="3" height={height} fill="#22d3ee" />
            {/* Label text */}
            <text
              x={labelWidth / 2}
              y="14"
              fill="#fff"
              fontSize="11"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              {label}
            </text>
            {/* Handle text */}
            <text
              x={labelWidth + handleWidth / 2}
              y="14"
              fill="#000"
              fontSize="11"
              fontFamily="system-ui, sans-serif"
              fontWeight="600"
              textAnchor="middle"
            >
              @{cleanHandle}
            </text>
          </svg>
        </div>
      ),
      {
        width: totalWidth,
        height: height,
      }
    );
  }

  // Default: return a simple badge
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #334155',
        }}
      >
        <span style={{ color: '#22d3ee', fontSize: '14px', fontWeight: 600 }}>
          ✓ @{cleanHandle}
        </span>
        <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>
          forAgents.dev
        </span>
      </div>
    ),
    {
      width: 200,
      height: 36,
    }
  );
}
