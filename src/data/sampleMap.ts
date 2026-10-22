import {
  MAP_FORMAT_VERSION,
  type ConceptMap,
} from '../domain/map'

export const sampleMap: ConceptMap = {
  version: MAP_FORMAT_VERSION,
  nodes: [
    {
      id: 'vector-spaces',
      title: 'Vector spaces',
      notes:
        'A set with vector addition and scalar multiplication satisfying the vector space axioms.',
      position: { x: 70, y: 235 },
      color: 'blue',
    },
    {
      id: 'bilinear-forms',
      title: 'Bilinear forms',
      notes:
        'A function that is linear in each of two vector arguments.',
      position: { x: 355, y: 80 },
      color: 'violet',
    },
    {
      id: 'inner-products',
      title: 'Inner products',
      notes:
        'A positive-definite bilinear or sesquilinear form that measures angles and lengths.',
      position: { x: 355, y: 315 },
      color: 'green',
    },
    {
      id: 'norms',
      title: 'Norms',
      notes: 'A function that assigns a non-negative length to each vector.',
      position: { x: 670, y: 175 },
      color: 'amber',
    },
    {
      id: 'orthogonality',
      title: 'Orthogonality',
      notes: 'Two vectors are orthogonal when their inner product is zero.',
      position: { x: 670, y: 395 },
      color: 'rose',
    },
  ],
  connections: [
    {
      id: 'vector-to-bilinear',
      sourceNodeId: 'vector-spaces',
      targetNodeId: 'bilinear-forms',
      label: 'supports',
      color: 'slate',
      directed: true,
    },
    {
      id: 'bilinear-to-inner',
      sourceNodeId: 'bilinear-forms',
      targetNodeId: 'inner-products',
      label: 'with extra axioms',
      color: 'violet',
      directed: true,
    },
    {
      id: 'vector-to-inner',
      sourceNodeId: 'vector-spaces',
      targetNodeId: 'inner-products',
      label: 'equipped with',
      color: 'blue',
      directed: true,
    },
    {
      id: 'inner-to-norm',
      sourceNodeId: 'inner-products',
      targetNodeId: 'norms',
      label: 'induces',
      color: 'green',
      directed: true,
    },
    {
      id: 'inner-to-orthogonal',
      sourceNodeId: 'inner-products',
      targetNodeId: 'orthogonality',
      label: 'defines',
      color: 'rose',
      directed: true,
    },
    {
      id: 'norm-to-orthogonal',
      sourceNodeId: 'norms',
      targetNodeId: 'orthogonality',
      label: 'geometry',
      color: 'amber',
      directed: false,
    },
  ],
}

