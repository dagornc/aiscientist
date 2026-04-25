import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { fetchAPI } from '@/lib/api'

interface PipelineNodeData {
  label: string
  icon: string
}

function PipelineNode({ data }: { data: PipelineNodeData }): JSX.Element {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-primary/30 bg-card shadow-lg hover:border-primary transition-all">
      <span className="text-2xl">{data.icon}</span>
      <span className="font-semibold text-sm">{data.label}</span>
    </div>
  )
}

const nodeTypes = { custom: PipelineNode }

export default function PipelinePage(): JSX.Element {
  const { t } = useTranslation()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    fetchAPI<{
      nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: PipelineNodeData }>
      edges: Array<{ id: string; source: string; target: string; label?: string; animated?: boolean }>
    }>('/pipeline/graph')
      .then((data) => {
        setNodes(
          data.nodes.map((n) => ({
            id: n.id,
            type: 'custom',
            position: n.position,
            data: n.data,
          })),
        )
        setEdges(
          data.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            animated: e.animated,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: e.label === 'Revise' ? { strokeDasharray: '5 5' } : undefined,
          })),
        )
      })
      .catch(() => {
        // Fallback nodes
        setNodes([
          { id: 'idea', type: 'custom', position: { x: 0, y: 200 }, data: { label: t('pipeline.idea_generation'), icon: '💡' } },
          { id: 'experiment', type: 'custom', position: { x: 300, y: 200 }, data: { label: t('pipeline.experiment'), icon: '🧪' } },
          { id: 'paper', type: 'custom', position: { x: 600, y: 200 }, data: { label: t('pipeline.paper_writing'), icon: '📝' } },
          { id: 'review', type: 'custom', position: { x: 900, y: 200 }, data: { label: t('pipeline.peer_review'), icon: '🔍' } },
          { id: 'accept', type: 'custom', position: { x: 1200, y: 100 }, data: { label: t('pipeline.accept'), icon: '✅' } },
          { id: 'reject', type: 'custom', position: { x: 1200, y: 300 }, data: { label: t('pipeline.reject_revise'), icon: '🔄' } },
        ])
        setEdges([
          { id: 'e1', source: 'idea', target: 'experiment', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e2', source: 'experiment', target: 'paper', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e3', source: 'paper', target: 'review', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e4', source: 'review', target: 'accept', label: 'Accept', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e5', source: 'review', target: 'reject', label: 'Reject', markerEnd: { type: MarkerType.ArrowClosed } },
          { id: 'e6', source: 'reject', target: 'review', label: 'Revise', style: { strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed } },
        ])
      })
  }, [t])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('pipeline.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('pipeline.description')}</p>
      </div>
      <div className="h-[500px] rounded-xl border border-border bg-card">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
