import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({
  zh: z.string().trim().min(1),
  en: z.string().trim().min(1).optional()
});

const evidenceId = z.string().regex(/^(EVM|LOW|EMT|QC)-\d{2}$/);
const figureId = z.string().regex(/^FIG-(EVM|LOW|EMT|QC)-\d{2}$/);
const slug = z.enum(['emvision', 'lowalt-md', 'em-trace', 'quadcontrol-lab']);
const status = z.enum([
  'SUPPORTED', 'INTERNALLY_VERIFIED', 'NEGATIVE_RESULT',
  'CORRECTED', 'WITHDRAWN', 'UNRESOLVED'
]);

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    id: slug,
    slug,
    title: localized,
    subtitle: localized,
    role: z.enum(['FLAGSHIP', 'PHYSICS_MECHANISM', 'ENGINEERING_FOUNDATION', 'AUTONOMOUS_BRANCH']),
    researchTrack: localized,
    status: localized,
    summary: localized,
    researchQuestion: localized,
    whyItMatters: localized,
    methods: z.array(localized).min(1),
    contributions: z.array(localized).min(1),
    representativeResults: z.array(evidenceId).min(1),
    limitations: z.array(localized).min(1),
    figures: z.array(figureId).min(1),
    mainFigures: z.array(figureId).min(1),
    deepFigures: z.array(figureId),
    materials: z.array(z.string()).min(1),
    evidenceRefs: z.array(evidenceId).min(1),
    sourceOfTruth: z.string().min(1),
    heroEvidence: evidenceId,
    mainEvidence: z.array(evidenceId).min(1),
    deepEvidence: z.array(evidenceId),
    homeEvidence: evidenceId,
    localeState: z.object({ zh: z.literal('READY'), en: z.enum(['PENDING', 'READY']) })
  })
});

const evidence = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/evidence' }),
  schema: z.object({
    id: evidenceId,
    project: slug,
    claim: localized,
    metric: z.object({
      name: localized,
      display: localized,
      unit: z.string().trim().min(1),
      observations: z.array(z.object({
        label: localized,
        value: z.string().trim().min(1),
        display: z.string().trim().min(1)
      }))
    }),
    comparison: z.object({
      kind: z.string().trim().min(1),
      delta: z.string().optional(),
      display: z.string().optional()
    }).optional(),
    protocolContext: localized,
    uncertainty: z.object({
      kind: z.enum(['NONE', 'INTERVAL', 'CONTEXT']),
      detail: localized,
      lower: z.string().optional(),
      upper: z.string().optional(),
      display: z.string().optional()
    }),
    status,
    boundary: localized,
    source: z.object({
      ref: z.string().trim().min(1),
      revision: z.string().optional(),
      hash: z.string().regex(/^[a-f0-9]{64}$/).optional()
    }),
    sourceVisibility: z.enum(['PUBLIC', 'PRIVATE_CANONICAL_SOURCE', 'PUBLIC_SUMMARY_ONLY']),
    publicSource: z.object({
      visibility: z.enum(['PUBLIC', 'PUBLIC_SUMMARY_ONLY', 'NONE']),
      label: localized,
      url: z.string().optional()
    }),
    websiteUsage: z.array(z.enum(['HOME', 'PROJECT_L1', 'PROJECT_L2', 'PROJECT_L3']))
  })
});

const figures = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/figures' }),
  schema: z.object({
    id: figureId,
    project: slug,
    path: z.string().startsWith('/evidence/originals/'),
    title: localized,
    caption: localized,
    alt: localized,
    type: z.enum(['DATA', 'SCHEMATIC', 'DECORATIVE']),
    assetClass: z.enum(['DATA', 'SCHEMATIC', 'HERO']),
    scientificPurpose: localized,
    sourceRef: z.string().trim().min(1),
    sourceProject: z.string().trim().min(1),
    sourceCommit: z.string().regex(/^[a-f0-9]{40}$/),
    originCommit: z.string().regex(/^[a-f0-9]{40}$/).optional(),
    sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
    sourceSize: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    mime: z.enum(['image/png', 'image/svg+xml']),
    webDerivative: z.array(z.object({
      path: z.string(),
      inputHash: z.string(),
      outputHash: z.string(),
      transform: z.string(),
      tool: z.string()
    })),
    homepageEligible: z.boolean(),
    mobileSuitability: localized,
    evidenceIds: z.array(evidenceId)
  })
});

const materials = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/materials' }),
  schema: z.object({
    id: z.string().trim().min(1),
    label: localized,
    type: z.enum(['CV', 'RESEARCH_OVERVIEW', 'GITHUB', 'SELECTED_CODE', 'EVIDENCE_PAGE', 'REPORT']),
    publicUrl: z.string().optional(),
    sourceProject: z.string().optional(),
    sourceCommit: z.string().regex(/^[a-f0-9]{40}$/).optional(),
    sourceHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    sourceSize: z.number().int().positive().optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED']).optional(),
    accessStatus: z.enum(['PUBLIC', 'PUBLIC_SUMMARY_ONLY', 'PENDING', 'PRIVATE_INTERNAL']),
    project: slug.optional(),
    recommendedPlacement: z.array(z.enum(['HERO', 'MATERIALS', 'PROJECT', 'CONTACT']))
  })
});

const site = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/site' }),
  schema: z.object({
    id: z.literal('profile'),
    publicName: localized,
    nameStatus: z.enum(['PENDING', 'APPROVED']),
    schoolWording: localized,
    schoolStatus: z.enum(['PENDING', 'APPROVED']),
    researchIdentity: localized,
    statement: localized,
    publicEmail: z.string(),
    emailStatus: z.enum(['PENDING', 'APPROVED']),
    githubUrl: z.url(),
    cvMaterialId: z.string(),
    overviewMaterialId: z.string(),
    defaultLocale: z.literal('zh')
  })
});

const maps = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/data' }),
  schema: z.object({
    id: z.literal('research-map'),
    tracks: z.array(z.object({
      id: z.enum(['electromagnetic', 'autonomous']),
      label: localized,
      role: z.enum(['MAIN', 'SEPARATE_BRANCH'])
    })),
    nodes: z.array(z.object({
      id: slug,
      projectId: slug,
      trackId: z.enum(['electromagnetic', 'autonomous']),
      role: localized,
      question: localized,
      method: localized,
      evidenceTeaser: localized,
      evidenceTeaserId: evidenceId,
      sequence: z.number().int().positive(),
      relationship: z.enum(['THEME_EVOLUTION', 'SEPARATE_BRANCH'])
    })),
    relationships: z.array(z.object({
      from: slug,
      to: slug,
      kind: z.literal('THEME_EVOLUTION'),
      label: localized
    }))
  })
});

export const collections = { projects, evidence, figures, materials, site, maps };
