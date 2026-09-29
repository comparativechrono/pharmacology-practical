/* =====================================================================
   COURSE SETTINGS – edit this file to adapt the practical.
   (No build step: just edit, commit and GitHub Pages updates.)
   ===================================================================== */
window.MG_CONFIG = {
  /* Shown in the header */
  courseTitle: 'Proteins in 3D',
  courseSubtitle: 'Bioinformatics & molecular graphics practical · Pharmacology',

  /* Model answers.
     true  – students can reveal a model answer after attempting a question
     false – “Show answer” buttons are hidden (add ?answers to the page URL
             yourself to see them, e.g. when demonstrating in class) */
  showModelAnswers: true,

  /* Use the copies of the tutorial structures stored in /data first.
     This keeps chain IDs, ligands and numbers exactly as the tutorial text
     describes, and makes the page work even if a database is slow.
     Anything not listed here is always fetched live. */
  preferBundledData: true,
  bundled: {
    pdb: {
      '3FXI': 'data/pdb/3fxi.bcif',
      '2Z65': 'data/pdb/2z65.bcif',
      '4G8A': 'data/pdb/4g8a.bcif',
      '4KXF': 'data/pdb/4kxf.bcif',
      '1VTO': 'data/pdb/1vto.bcif',
      '1CDW': 'data/pdb/1cdw.bcif',
      '1C9B': 'data/pdb/1c9b.bcif'
    },
    alphafold: {
      O00206: {
        api: 'data/alphafold/O00206-api.json',
        model: 'data/alphafold/AF-O00206-F1-model_v6.bcif',
        pae: 'data/alphafold/AF-O00206-F1-predicted_aligned_error_v6.json'
      }
    },
    /* used only if the UniProt website cannot be reached */
    uniprot: {
      O00206: 'data/uniprot/O00206.json',
      P20226: 'data/uniprot/P20226.json'
    }
  },

  /* Friendly names for chains and ligand groups in specific PDB entries.
     'sele' uses NGL selection language: [RES] = residue name, :A = chain A. */
  presets: {
    '3FXI': {
      chainNames: { A: 'TLR4', B: 'TLR4*', C: 'MD-2', D: 'MD-2*' },
      /* camera presets: “orient dimer” = side view, membrane at the bottom;
         “orient top” = looking down on the dimer from outside the cell */
      views: {
        dimer: { x: [0.252, -0.2327, -0.9394], y: [-0.0046, -0.971, 0.2392], center: [11.25, -5.37, -5.08], size: 150 },
        top: { x: [0.252, -0.2327, -0.9394], y: [0.9677, 0.0559, 0.2457], center: [11.25, -5.37, -5.08], size: 150 }
      },
      groups: [
        {
          name: 'LPS', short: 'LPS',
          sele: '(:A or :E) and ([PA1] or [GCS] or [KDO] or [GMH] or [FTT] or [DAO] or [MYR] or [PO4])',
          desc: 'In MD-2 (chain C). Lipid A (glucosamines, phosphates, 6 fatty-acyl chains) + core sugars'
        },
        {
          name: 'LPS*', short: 'LPS*',
          sele: '(:B or :H) and ([PA1] or [GCS] or [KDO] or [GMH] or [FTT] or [DAO] or [MYR] or [PO4])',
          desc: 'In MD-2* (chain D) – the second unit'
        },
        { name: 'N-glycans (NAG)', short: 'glycans', sele: '[NAG]', kind: 'sugar', desc: 'Sugars attached to asparagines' }
      ]
    },
    '4G8A': {
      chainNames: { A: 'TLR4 D299G/T399I', B: 'TLR4* D299G/T399I', C: 'MD-2', D: 'MD-2*' },
      groups: [
        { name: 'LPS', short: 'LPS', sele: ':C and ([LP4] or [LP5] or [MYR] or [DAO] or [KDO])', desc: 'In MD-2 (chain C). Lipid A with Kdo sugars' },
        { name: 'LPS*', short: 'LPS*', sele: ':D and ([LP4] or [LP5] or [MYR] or [DAO] or [KDO])', desc: 'In MD-2* (chain D)' },
        { name: 'N-glycans (NAG)', short: 'glycans', sele: '[NAG]', kind: 'sugar' }
      ]
    },
    '2Z65': {
      chainNames: { A: 'TLR4–VLR hybrid', B: 'TLR4–VLR hybrid', C: 'MD-2', D: 'MD-2' },
      groups: [
        { name: 'Eritoran', short: 'eritoran', sele: '[E55] and :C', desc: 'In MD-2 (chain C). Lipid A analogue E5564 – a TLR4 antagonist', carbon: '#c026d3' },
        { name: 'Eritoran (copy 2)', short: 'eritoran2', sele: '[E55] and :D', desc: 'In MD-2 (chain D)', carbon: '#c026d3' },
        { name: 'N-glycans (NAG, BMA)', short: 'glycans', sele: '[NAG] or [BMA]', kind: 'sugar' }
      ]
    },
    '4KXF': { chainNames: {} },
    '1VTO': { chainNames: { A: 'TBP', B: 'TBP' } },
    '1CDW': { chainNames: { A: 'TBP' } },
    '1C9B': { chainNames: { B: 'TBP', F: 'TBP', J: 'TBP', N: 'TBP', R: 'TBP', A: 'TFIIB', E: 'TFIIB', I: 'TFIIB', M: 'TFIIB', Q: 'TFIIB' } }
  }
};
