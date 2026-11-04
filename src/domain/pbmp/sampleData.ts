import type {
  PBMPComponentDefinition,
  PBMPLogicModel,
  PBMPMediaClassification,
} from './types'

const addTwoNumbersMedia: PBMPMediaClassification = {
  id: 'media-addition-result',
  root: {
    id: 'media-root',
    name: 'Media',
    children: [
      {
        id: 'media-digital',
        name: 'Digital',
        children: [
          {
            id: 'media-human-perceivable',
            name: 'Human-Perceivable',
            children: [
              {
                id: 'media-visual',
                name: 'Visual',
                children: [
                  {
                    id: 'media-symbolic',
                    name: 'Symbolic',
                    children: [
                      {
                        id: 'media-numeric',
                        name: 'Numeric',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}

export const addTwoNumbersLogicModel: PBMPLogicModel = {
  id: 'logic-add-two-numbers',
  version: '1.0.0',
  root: [
    {
      kind: 'assign',
      target: 'Result',
      value: {
        kind: 'binary',
        operator: 'add',
        left: { kind: 'reference', reference: 'Number1' },
        right: { kind: 'reference', reference: 'Number2' },
      },
    },
  ],
  outputs: ['Result'],
}

export const addTwoNumbersComponentDefinition: PBMPComponentDefinition = {
  id: 'component-add-two-numbers',
  what: {
    componentId: 'component-add-two-numbers',
    gemId: 'PBMP.GEM.ADD-2-NUMBERS',
    name: 'Add Two Numbers',
    description:
      'Generic PBMP Component prototype that demonstrates configurable anatomy, channels, roles, forms, and logic.',
    componentType: 'Application Component',
    classification: 'Arithmetic / Utility',
    version: '0.1.0',
    status: 'Prototype',
    ownerActorId: 'actor-pbmp-application',
    inputs: [
      {
        id: 'input-number-1',
        name: 'Number1',
        description: 'First numeric operand.',
        dataType: 'number',
        required: true,
      },
      {
        id: 'input-number-2',
        name: 'Number2',
        description: 'Second numeric operand.',
        dataType: 'number',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'output-result',
        name: 'Result',
        description: 'Arithmetic sum of Number1 and Number2.',
        dataType: 'number',
        required: true,
      },
    ],
    potentialRealizations: [
      'Function',
      'Module',
      'Program',
      'Executable',
      'Service',
      'API',
      'Application component',
    ],
  },
  why: {
    intentions: [
      {
        id: 'intention-obtain-sum',
        statement: 'Obtain the arithmetic sum of two supplied numbers.',
      },
    ],
    enabledProcessIds: ['process-addition'],
  },
  how: {
    structure: {
      inputs: [
        {
          id: 'input-number-1',
          name: 'Number1',
          description: 'First numeric operand.',
          dataType: 'number',
          required: true,
        },
        {
          id: 'input-number-2',
          name: 'Number2',
          description: 'Second numeric operand.',
          dataType: 'number',
          required: true,
        },
      ],
      outputs: [
        {
          id: 'output-result',
          name: 'Result',
          description: 'Sum output.',
          dataType: 'number',
          required: true,
        },
      ],
      properties: {
        deterministic: 'true',
        sideEffects: 'none',
      },
      interfaces: ['Web UI', 'API', 'Future Capacitor Mobile UI'],
      configuration: {
        logicModel: 'PBMPLogicModel',
        roleChannelOutputSelection: 'enabled',
      },
      internalParts: ['Input Validation', 'Logic Evaluation', 'Output Formatting'],
    },
    behavior: {
      logicModelId: 'logic-add-two-numbers',
      functions: ['executeAddition'],
      rules: ['Inputs must be numeric values.'],
      stateModel: ['idle', 'executing', 'completed', 'error'],
      events: ['onExecute', 'onSuccess', 'onFailure'],
      lifecycle: ['configure', 'authorLogic', 'execute', 'inspect'],
    },
  },
  actors: [
    {
      id: 'actor-user',
      name: 'User',
      actorType: 'person',
      description: 'Human operator entering numbers.',
    },
    {
      id: 'actor-browser-program',
      name: 'Browser Program',
      actorType: 'program',
      description: 'Browser runtime hosting the web/PWA UI.',
    },
    {
      id: 'actor-pbmp-application',
      name: 'PBMP Application',
      actorType: 'program',
      description: 'PBMP runtime host application.',
    },
    {
      id: 'actor-add-component',
      name: 'AddTwoNumbers Component',
      actorType: 'component',
      description: 'Component being configured and executed.',
    },
  ],
  processes: [
    {
      id: 'process-addition',
      name: 'Addition Process',
      description: 'Process enabled by AddTwoNumbers component.',
      steps: [
        'Receive Inputs',
        'Validate Inputs',
        'Add Numbers',
        'Produce Result',
        'Return Result',
      ],
    },
  ],
  relationships: [
    {
      id: 'rel-process-enabled-by-component',
      sourceId: 'process-addition',
      sourceLabel: 'Addition Process',
      targetId: 'component-add-two-numbers',
      targetLabel: 'AddTwoNumbers Component',
      relationshipVerb: 'enabled by',
      type: {
        category: 'dependency',
        family: 'requires',
        variant: 'none',
      },
      scope: 'inter-component',
      notes: 'Process is intentionally external to component core anatomy.',
    },
    {
      id: 'rel-component-realized-as-function',
      sourceId: 'component-add-two-numbers',
      sourceLabel: 'AddTwoNumbers Component',
      targetId: 'runtime-js-function',
      targetLabel: 'JavaScript Function',
      relationshipVerb: 'realized as',
      type: {
        category: 'realization',
        family: 'realization',
        variant: 'direct',
      },
      scope: 'inter-component',
    },
  ],
  capabilities: {
    roles: [
      {
        id: 'role-user',
        name: 'User',
        description: 'Interactive end user.',
      },
      {
        id: 'role-application',
        name: 'Application',
        description: 'Programmatic API caller.',
      },
      {
        id: 'role-administrator',
        name: 'Administrator',
        description: 'Privileged operator with diagnostics access.',
      },
    ],
    channels: [
      {
        id: 'channel-digital',
        name: 'Digital Channel',
        description: 'Parent digital channel.',
        exists: true,
        availability: 'available',
        state: 'open',
        access: 'accessible',
        preferred: false,
        selected: false,
        endpointAActorId: 'actor-user',
        endpointBActorId: 'actor-pbmp-application',
      },
      {
        id: 'channel-web',
        name: 'Web Channel',
        description: 'Web interaction channel.',
        parentChannelId: 'channel-digital',
        exists: true,
        availability: 'available',
        state: 'open',
        access: 'accessible',
        preferred: true,
        selected: true,
        endpointAActorId: 'actor-browser-program',
        endpointBActorId: 'actor-pbmp-application',
      },
      {
        id: 'channel-desktop-browser',
        name: 'Desktop Browser',
        description: 'Desktop web form channel.',
        parentChannelId: 'channel-web',
        exists: true,
        availability: 'available',
        state: 'open',
        access: 'accessible',
        preferred: true,
        selected: true,
        endpointAActorId: 'actor-browser-program',
        endpointBActorId: 'actor-add-component',
      },
      {
        id: 'channel-mobile-browser',
        name: 'Mobile Browser',
        description: 'Mobile web form channel (Capacitor-compatible layout).',
        parentChannelId: 'channel-web',
        exists: true,
        availability: 'available',
        state: 'open',
        access: 'accessible',
        preferred: false,
        selected: false,
        endpointAActorId: 'actor-browser-program',
        endpointBActorId: 'actor-add-component',
      },
      {
        id: 'channel-api',
        name: 'API Channel',
        description: 'Program-to-program channel.',
        parentChannelId: 'channel-digital',
        exists: true,
        availability: 'available',
        state: 'open',
        access: 'accessible',
        preferred: false,
        selected: false,
        endpointAActorId: 'actor-pbmp-application',
        endpointBActorId: 'actor-add-component',
      },
    ],
    roleAccessRules: [
      {
        roleId: 'role-user',
        executeAllowed: true,
        channelId: 'channel-desktop-browser',
        outputSetId: 'output-set-result-only',
      },
      {
        roleId: 'role-user',
        executeAllowed: true,
        channelId: 'channel-mobile-browser',
        outputSetId: 'output-set-result-only',
      },
      {
        roleId: 'role-application',
        executeAllowed: true,
        channelId: 'channel-api',
        outputSetId: 'output-set-result-status',
      },
      {
        roleId: 'role-administrator',
        executeAllowed: true,
        channelId: 'channel-desktop-browser',
        outputSetId: 'output-set-result-status-diagnostics',
      },
      {
        roleId: 'role-administrator',
        executeAllowed: true,
        channelId: 'channel-mobile-browser',
        outputSetId: 'output-set-result-status-diagnostics',
      },
    ],
    outputSets: [
      {
        id: 'output-set-result-only',
        name: 'Result',
        fields: ['result'],
      },
      {
        id: 'output-set-result-status',
        name: 'Result + Status',
        fields: ['result', 'status'],
      },
      {
        id: 'output-set-result-status-diagnostics',
        name: 'Result + Status + Diagnostics',
        fields: ['result', 'status', 'diagnostics'],
      },
    ],
    messaging: [
      {
        id: 'msg-addition-result',
        meaning: 'The sum of the two supplied numbers is available to the recipient.',
      },
    ],
    contentStructures: [
      {
        id: 'content-structure-addition-result',
        root: {
          id: 'node-addition-result',
          name: 'AdditionResult',
          children: [
            { id: 'node-operand-a', name: 'operandA' },
            { id: 'node-operand-b', name: 'operandB' },
            { id: 'node-operation', name: 'operation' },
            { id: 'node-result', name: 'result' },
            { id: 'node-status', name: 'status' },
          ],
        },
      },
    ],
    formats: [
      {
        id: 'format-json',
        name: 'json',
        mimeType: 'application/json',
      },
    ],
    forms: [
      {
        id: 'form-desktop',
        name: 'Desktop Web Form',
        channelId: 'channel-desktop-browser',
        structure: {
          id: 'form-structure-desktop',
          name: 'Add Two Numbers Desktop Structure',
          layout: 'horizontal',
          sections: [
            {
              id: 'section-inputs-desktop',
              title: 'Add Two Numbers',
              fieldIds: ['form-field-number-1', 'form-field-number-2', 'form-field-result'],
            },
          ],
          actionIds: ['action-add'],
        },
        style: {
          id: 'style-desktop',
          name: 'Desktop Style',
          typography: 'Inter',
          spacing: 'comfortable',
          emphasis: 'subtle',
          theme: 'light',
          colors: {
            primary: '#2563eb',
            panel: '#f8fafc',
          },
          touchTarget: 'standard',
        },
        fields: [
          {
            id: 'form-field-number-1',
            key: 'Number1',
            label: 'Number 1',
            fieldType: 'number-input',
            required: true,
          },
          {
            id: 'form-field-number-2',
            key: 'Number2',
            label: 'Number 2',
            fieldType: 'number-input',
            required: true,
          },
          {
            id: 'form-field-result',
            key: 'Result',
            label: 'Result',
            fieldType: 'readonly',
            required: false,
          },
        ],
      },
      {
        id: 'form-mobile',
        name: 'Mobile Form',
        channelId: 'channel-mobile-browser',
        structure: {
          id: 'form-structure-mobile',
          name: 'Add Two Numbers Mobile Structure',
          layout: 'vertical',
          sections: [
            {
              id: 'section-inputs-mobile',
              title: 'Add Two Numbers',
              fieldIds: ['form-field-number-1', 'form-field-number-2', 'form-field-result'],
            },
          ],
          actionIds: ['action-add'],
        },
        style: {
          id: 'style-mobile',
          name: 'Mobile Style',
          typography: 'Inter',
          spacing: 'comfortable',
          emphasis: 'prominent',
          theme: 'light',
          colors: {
            primary: '#0f766e',
            panel: '#f0fdfa',
          },
          touchTarget: 'large',
        },
        fields: [
          {
            id: 'form-field-number-1',
            key: 'Number1',
            label: 'Number 1',
            fieldType: 'number-input',
            required: true,
          },
          {
            id: 'form-field-number-2',
            key: 'Number2',
            label: 'Number 2',
            fieldType: 'number-input',
            required: true,
          },
          {
            id: 'form-field-result',
            key: 'Result',
            label: 'Result',
            fieldType: 'readonly',
            required: false,
          },
        ],
      },
    ],
    mediaClassifications: [addTwoNumbersMedia],
  },
}

export function cloneComponentDefinition(): PBMPComponentDefinition {
  return structuredClone(addTwoNumbersComponentDefinition)
}

export function cloneLogicDefinition(): PBMPLogicModel {
  return structuredClone(addTwoNumbersLogicModel)
}
