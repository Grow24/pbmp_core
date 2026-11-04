import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'

import {
  PBMP_BLOCKLY_TOOLBOX,
  applyBlocklyState,
  workspaceToBlocklyState,
  workspaceToLogicModel,
  type BlocklyWorkspaceState,
} from '../../domain/logic/blocklyAdapter'
import type { PBMPLogicModel } from '../../domain/pbmp/types'

interface BlocklyEditorProps {
  workspaceState: BlocklyWorkspaceState
  stateRevision: number
  onWorkspaceChange: (nextState: BlocklyWorkspaceState, nextLogic: PBMPLogicModel) => void
}

export function BlocklyEditor({ workspaceState, stateRevision, onWorkspaceChange }: BlocklyEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const initialWorkspaceStateRef = useRef(workspaceState)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const workspace = Blockly.inject(containerRef.current, {
      toolbox: PBMP_BLOCKLY_TOOLBOX,
      trashcan: true,
      grid: {
        spacing: 24,
        length: 3,
        colour: '#e2e8f0',
        snap: true,
      },
      move: {
        wheel: true,
        drag: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
      },
    })
    workspaceRef.current = workspace
    applyBlocklyState(workspace, initialWorkspaceStateRef.current)

    const listener = () => {
      const nextState = workspaceToBlocklyState(workspace)
      const nextLogic = workspaceToLogicModel(workspace)
      onWorkspaceChange(nextState, nextLogic)
    }
    workspace.addChangeListener(listener)

    return () => {
      workspace.removeChangeListener(listener)
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [onWorkspaceChange])

  useEffect(() => {
    if (!workspaceRef.current) {
      return
    }
    applyBlocklyState(workspaceRef.current, workspaceState)
  }, [workspaceState, stateRevision])

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Blockly View</h2>
      <p className="mt-1 text-sm text-slate-600">
        Visual authoring layer synchronized with canonical PBMP Logic Model.
      </p>
      <div ref={containerRef} className="mt-3 h-[420px] w-full rounded-md border border-slate-300" />
    </section>
  )
}
