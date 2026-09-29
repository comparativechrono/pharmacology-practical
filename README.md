# Proteins in 3D

**A self-contained bioinformatics and molecular graphics practical in a single web page.**

Students work through UniProt, the Protein Data Bank, a 3D structure viewer and AlphaFold, using human **TLR4** (with its co-receptor MD-2 and bacterial LPS) as the running example. The tutorial is on the left of the screen and a workbench is on the right. The workbench has three tabs:

- **3D viewer:** an embedded molecular viewer with ICM-Browser-style controls (styles, colours, selections, binding sites, measurements, labels, colour key, saved views, image export).
- **UniProt:** search and read UniProtKB entries, with features that can be clicked to highlight them in 3D.
- **PDB:** search the Protein Data Bank, read an entry, look inside a `.pdb` file and load it into the viewer.

Students install nothing and don't need to switch between programs, websites and instruction sheets. It is a static site (HTML, CSS and JavaScript with no build step), so it can be hosted on **GitHub Pages** for free.

---

## Contents

1. [What's in the practical](#whats-in-the-practical)
2. [Put it on GitHub Pages](#put-it-on-github-pages)
3. [Try it on your own computer](#try-it-on-your-own-computer)
4. [Editing the tutorial](#editing-the-tutorial)
5. [Settings: `config.js`](#settings-configjs)
6. [Viewer command reference](#viewer-command-reference)
7. [Files](#files)
8. [Privacy and data](#privacy-and-data)
9. [Browser support](#browser-support)
10. [Differences from ICM-Browser](#differences-from-icm-browser)
11. [Credits and licences](#credits-and-licences)

---

## What's in the practical

| # | Chapter | Based on | Time |
|---|---------|----------|------|
| 0 | **Start here**: warm-up with the TLR4–MD-2–LPS complex (3FXI), how the page works, why TLR4 matters | Lecture | a few min |
| 1 | **UniProt**: function, names, location and topology, disease and variants, PTMs, expression, interactions, structure coverage, family and domains, sequence | UniProt tutorial and K6 UniProt worksheet (TBP as an extension) | ≈ 25 min |
| 2 | **The PDB**: the 3FXI entry, what is inside a `.pdb` file, searching by name, UniProt accession and text | PDB tutorial and K3 PDB worksheet (TBP as an extension) | ≈ 10 min |
| 3 | **3D structure**: styles, colours, selections, hiding the second copy, surfaces, the LPS binding site and its interactions, box selection, measuring, labels, saved views, a second structure (4KXF). Extensions: eritoran (2Z65) and the D299G/T399I variants (4G8A) | K3 ICM worksheet (ICM-Browser steps done in the built-in viewer) | ≈ 30 min |
| 4 | **AlphaFold**: loading the prediction for O00206, pLDDT confidence, the predicted aligned error (PAE) plot, superposing the model onto the crystal structure (RMSD) | K3 PDB & AlphaFold worksheet, expanded | ≈ 15 min |
| 5 | **Make a figure**: camera presets, colour key, labels, title, exporting a high-resolution PNG, saving a session | *Adding labels and schematics* | ≈ 10 min |
| 6 | **Your receptor**: checklist and notes for the assessment | Lecture (assessment brief) | after class |
| R | **Reference**: command list, ICM-Browser ↔ this page, glossary, notes for teaching staff, credits | | |

Students' progress (ticks and answers) is saved automatically in their own browser. From **My answers** they can download everything they wrote as a tidy HTML file to keep or submit.

Every step has a **▶ show me** button that does the step for the student, so nobody gets stuck. Many steps also tick themselves when the student does the action (e.g. loading 3FXI, colouring chain A by rainbow, saving two views).

---

## Put it on GitHub Pages

1. On GitHub, create a **new repository** (e.g. `proteins-in-3d`). It must be public unless your GitHub plan supports Pages for private repositories.
2. Upload the site. The file `index.html` must be at the **top level** of the repository, with the `assets` and `data` folders beside it.
   - **In the browser:** *Add file → Upload files*, drag in everything from the unzipped folder, then *Commit changes*.
   - **Or with git:**
     ```bash
     cd proteins-in-3d          # the unzipped folder
     git init && git add . && git commit -m "Proteins in 3D practical"
     git branch -M main
     git remote add origin https://github.com/<you>/proteins-in-3d.git
     git push -u origin main
     ```
3. Go to **Settings → Pages**. Under *Build and deployment* choose **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, then **Save**.
4. After a minute or two the site is live at `https://<you>.github.io/proteins-in-3d/`. Give students this one link.

Any later change (see below) goes live a minute or so after you commit it.

> The empty `.nojekyll` file tells GitHub Pages to serve the files exactly as they are. It is harmless if it gets left out, for example because your file browser hides dot-files.

The whole site is about 6 MB, well within GitHub's limits.

---

## Try it on your own computer

Browsers block web pages opened straight from disk (`file://…`) from reading the bundled data files, so use a tiny local web server:

```bash
cd proteins-in-3d
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Useful addresses:

- `…/index.html#viewer` opens a chapter directly. The chapter ids are `start`, `uniprot`, `pdb`, `viewer`, `alphafold`, `figure`, `yours` and `reference`.
- `…/index.html?answers` shows the **Show answer** buttons even when they are switched off in `config.js`, which is handy for demonstrating in class.

---

## Editing the tutorial

All the tutorial text is in **`index.html`**, as ordinary HTML. You can edit it in any text editor, or directly on GitHub with the pencil icon.

### Chapters

```html
<section class="chapter" id="uniprot" data-num="1" data-title="UniProt" data-bench="uniprot" hidden>
  <h1>UniProt: what do we know about a protein?</h1>
  …
</section>
```

- `id` is the address (`#uniprot`).
- `data-num` and `data-title` build the chapter buttons at the top.
- `data-bench` picks which workbench tab opens with the chapter: `viewer`, `uniprot` or `pdb`.
- Every chapter except the first has `hidden`.

`<h2 id="…">` headings inside a chapter can be linked to directly.

### Activities and tick boxes

```html
<div class="activity">
  <div class="act-t">Activity 1.1 · Search UniProtKB</div>
  <ol class="steps">
    <li data-task="u-search" data-auto="uniprot:search query~toll-like receptor 4">
      In the UniProt tab, search for <code>toll-like receptor 4</code>.
      <button class="do showme" type="button" data-uniprot="search:toll-like receptor 4">show me</button>
    </li>
  </ol>
</div>
```

Every `<li data-task="unique-id">` gets a *done* tick box, which feeds the progress bar. A step can also **tick itself**:

- **`data-auto="event key=value"`** ticks when the page reports that event. Operators are `=` (equals, ignoring case), `~` (contains), `>` and `<` (numbers). Give several conditions separated by spaces (all must match), and separate alternatives with `||`. Examples:
  - `data-auto="viewer:color scheme=rainbow"`
  - `data-auto="pdb:search kind=uniprot"`
  - `data-auto="viewer:measure d>2"`
- **`data-check="name"`** or **`name:arg`** ticks when a check on the viewer's state passes. It is re-checked after every action. The checks are defined in `assets/js/app.js` (`MG.checks`): `loaded:3FXI` (any ID, or `loaded:alphafold`), `oneCopy3FXI`, `oneCopy4KXF`, `md2Surface`, `lpsShown`, `lpsSpheres`, `rainbowA`, `clickedAtom`, `threeLabels`, `label2d`, `keyShown`, `afAndPdbSuperposed`, `eritoranSuperposed` and `twoViews`.

Steps only tick themselves in the chapter the student is reading.

<details>
<summary><b>Events you can use in <code>data-auto</code></b></summary>

| Event | Useful keys |
|-------|-------------|
| `viewer:loaded` | `id` (e.g. `3FXI`, `AF-O00206-F1`), `kind` (`pdb`, `alphafold`, `file`) |
| `viewer:style` | `type` (`cartoon`, `sticks`, `spheres`, `surface`, `glass`, … or `hide-all`), `target` |
| `viewer:color` | `scheme` (`rainbow`, `ss`, `element`, `hydrophobicity`, `plddt`, `uniform`, …), `color`, `target` |
| `viewer:visibility` | `visible`, `target` |
| `viewer:selection` | `info` |
| `viewer:boxselect` | `count` (residues) |
| `viewer:site` | `count`, `dist` |
| `viewer:contacts` | `on` |
| `viewer:measure` | `d` (Å), `text` |
| `viewer:label` | `kind` (`3d` / `2d`), `count` |
| `viewer:shape` | `type` (`arrow`, `rect`, `ellipse`) |
| `viewer:key` | `visible` |
| `viewer:view-saved` | `count` |
| `viewer:superposed` | `rmsd`, `n`, `mobile`, `target` |
| `viewer:export` | `kind` (`png` / `clipboard`) |
| `viewer:session-saved` | |
| `uniprot:search` | `query`, `total`, `reviewed`, `human` |
| `uniprot:entry` | `acc` |
| `uniprot:section` | `name` (`function`, `names`, `location`, `disease`, `ptm`, `expression`, `interaction`, `structure`, `family`, `sequence`) |
| `uniprot:show3d` | `acc`, `label` |
| `uniprot:find` · `uniprot:fasta` | `q` · `acc` |
| `pdb:search` | `query`, `kind` (`name`, `uniprot`, `text`, …), `total`, `human`, `dna`, `method`, `sort` |
| `pdb:entry` · `pdb:file` · `pdb:download` | `id` (and `fmt` for downloads) |
| `af:pae-open` · `af:pae-select` · `af:hide-low` | `mean` (mean PAE of the selected box) |

</details>

### Questions

**Short answer, checked automatically:**

```html
<div class="q" data-q="u-cd" data-accept="cd ?284" data-hint="look for “CD antigen name”">
  <div class="q-text">What is TLR4's CD name?</div>
  <div class="q-model"><p><b>CD284</b> …</p></div>
</div>
```

- `data-q` is a unique id. Answers are saved under it, so don't change it once students have started.
- `data-accept` is optional. It holds one or more regular expressions separated by `||`, tested without regard to case. When one matches, **Check** says the answer is right. When none matches, **Check** shows `data-hint`.
- Without `data-accept` the question is a free-text answer. It counts as done once the student writes something.
- `.q-model` is the model answer, revealed with **Show answer** (see `showModelAnswers` below). It can be left out.

**Multiple choice:**

```html
<div class="q" data-q="u-type1" data-type="mcq">
  <div class="q-text">Where is the N-terminus of a type I membrane protein?</div>
  <div class="mcq">
    <label data-correct data-why="Explanation shown after answering"><input type="radio"> Outside the cell</label>
    <label data-why="Why this is wrong"><input type="radio"> In the cytoplasm</label>
  </div>
</div>
```

### “▶ show me” and other action buttons

Any button can carry one of these attributes:

| Attribute | What it does | Examples |
|-----------|--------------|----------|
| `data-cmd` | Runs viewer commands (see below). Separate several commands with `;` | `load 3fxi` · `select C; show glass C` · `site LPS 4.5` |
| `data-uniprot` | Drives the UniProt tab | `search:toll-like receptor 4` · `entry:O00206` · `entry:O00206#disease` · `section:ptm` · `show3d:O00206\|632-652\|Transmembrane` |
| `data-pdb` | Drives the PDB tab. For searches, add `data-mode` (`auto`, `name`, `uniprot` or `text`), `data-human`, `data-dna`, `data-method` and `data-sort` | `entry:3FXI` · `search:O00206` · `file:3FXI` · `coverage:O00206` |
| `data-bench` | Switches the workbench tab | `viewer` · `uniprot` · `pdb` |
| `data-vtab` | Opens a tab of the viewer's ribbon (and flashes it) | `display` · `colour` · `select` · `labels` · `measure` · `views` · `export` |
| `data-goto` | Jumps to a chapter | `alphafold` |

Use `class="do showme"` for the round “show me” pills and `class="goto"` for inline links.

**Tip for camera angles:** set up the view you want in the viewer, open the command line and type `camera`. It prints an `orient …` line (16 numbers). Put that in a button (`data-cmd="orient 0.25 …"`) and the button will bring every student to exactly that view.

### Other building blocks

- **Callouts:** `<div class="callout info">`, `pharm` (pharmacology link), `warn` or `lecture` (link to the slides), with `<div class="co-t">Title</div>` inside.
- **Optional extensions:** wrap them in `<div class="optional">…</div>`. They are labelled *Extension* and are not counted in the progress bar.
- **Keyboard keys:** `<span class="kbd">Esc</span>`.

### Using a different protein

Change the text and the ▶ buttons in `index.html`, then add friendly chain and ligand names for your structure to `presets` in `config.js` (below). Any PDB entry or AlphaFold model can be loaded live, so bundling it is optional.

---

## Settings: `config.js`

`assets/js/config.js` holds everything you are likely to change apart from the text.

| Setting | Meaning |
|---------|---------|
| `courseTitle`, `courseSubtitle` | Shown in the header. |
| `showModelAnswers` | `true`: students can reveal model answers after trying a question. `false`: the *Show answer* buttons are hidden, and `?answers` in the address brings them back for you. |
| `preferBundledData` | Use the copies of the tutorial structures in `data/` first, so chain IDs and ligand names match the text and the practical still works if a database is slow. Anything not bundled is fetched live. |
| `bundled` | Which files are bundled: PDB entries (BinaryCIF), the AlphaFold model, PAE and API record for O00206, and fallback UniProt records (used only if UniProt can't be reached). |
| `presets` | Per-PDB-entry extras. `chainNames` sets friendly names in the Workspace (e.g. `A: 'TLR4'`). `groups` are named ligand groups that the tree, the tutorial and commands can use (e.g. `site LPS 4.5`). They are written in [NGL selection language](https://nglviewer.org/ngl/api/manual/usage/selection-language.html): `[NAG]` is a residue name, `:C` is chain C. `views` are camera presets used by `orient dimer` and `orient top`. |

**To bundle another PDB entry:** download `https://models.rcsb.org/v1/1abc/full?encoding=bcif`, save it as `data/pdb/1abc.bcif`, and add `'1ABC': 'data/pdb/1abc.bcif'` to `bundled.pdb`.

---

## Viewer command reference

Every button in the viewer also writes its command in the **Command line** panel at the bottom, so students can see the equivalent command. The same commands work in `data-cmd` buttons.

| Command | Does |
|---------|------|
| `load 3fxi` · `load af O00206` · `load <url>` | Load a PDB entry, an AlphaFold model (by UniProt accession) or a file from a URL. If the entry is already loaded it is reused, so pressing a ▶ button twice does no harm. `load 3fxi again` loads a second copy |
| `remove 4KXF` · `clear` | Remove one structure or everything |
| `show cartoon A` · `hide all water` · `only sticks LPS` | Add, remove or replace styles: `cartoon`, `tube`, `sticks`, `ballstick`, `spheres`, `surface`, `glass`, `lines` |
| `undisplay B or D` · `display B` · `isolate A or C` · `showall` | Hide or show (like the eye icons) |
| `enable 3FXI` · `disable 4KXF` | Show or hide a whole structure |
| `color rainbow A` · `color orange C` · `color #1f77b4 LPS` | Schemes: `chain`, `molecule`, `rainbow`, `ss`, `hydrophobicity`, `restype`, `element`, `cpk`, `plddt`, `bfactor`, `default`, or any colour |
| `select C:126` · `select A:264-300` · `select A:Phe126` · `select LPS` · `select none` | Select by chain:residue, range, residue name, group or NGL syntax. `select add …`, `select near LPS 4.5` and `select invert` also work |
| `site LPS 4.5` | Binding site: residues within 4.5 Å as sticks, with interaction lines |
| `contacts LPS` · `contacts off` | Show or hide hydrogen bonds and salt bridges |
| `distance A:264.NE A:1010.O3` · `distance clear` | Measure between two atoms (chain:residue.atom) |
| `center LPS` · `reset` · `orient dimer` · `camera` · `spin on` | Camera. `camera` prints the current view as an `orient …` command |
| `label sele` · `label3d "text" A:264` · `label2d "Title"` · `labels clear` | Labels |
| `key on` · `key auto` · `key title "Colour key"` · `key add red "My entry"` | Colour key |
| `superpose AF-O00206-F1:A onto 3FXI:A` | Superpose one chain onto another and report the RMSD |
| `view save "Pocket"` · `view 1` · `views clear` | Saved views |
| `background black` · `opacity 0.4` | Other settings |
| `export png 2` | Download the picture (×2 resolution) |
| `help` | List the commands |

---

## Files

```
index.html               the tutorial (all the text you would edit)
README.md                this file
.nojekyll                tells GitHub Pages to serve files as-is
assets/css/app.css       all styling
assets/js/config.js      course settings (see above)
assets/js/core.js        small helpers (DOM, events, storage, fetch)
assets/js/viewer-core.js the molecular viewer (on top of NGL): styles, colours, selections, sites, superposition
assets/js/viewer-ui.js   the viewer's toolbar, Workspace tree, sequence bar, image export
assets/js/annot.js       3D and 2D labels, arrows, boxes, colour key
assets/js/alphafold.js   AlphaFold loading, pLDDT and PAE panel
assets/js/commands.js    the command line
assets/js/session.js     save and open sessions
assets/js/uniprot.js     the UniProt tab
assets/js/pdb.js         the PDB tab
assets/js/app.js         chapters, tasks, questions, progress, answer export
assets/js/icons.js       icons
assets/vendor/ngl/       NGL Viewer 2.5.0 (MIT licence)
data/pdb/                bundled PDB entries (BinaryCIF): 3FXI, 2Z65, 4G8A, 4KXF, 1VTO, 1CDW, 1C9B
data/alphafold/          bundled AlphaFold model, PAE and API record for O00206
data/uniprot/            fallback UniProt records for O00206 and P20226
```

There are no build tools, frameworks, trackers or third-party scripts from other sites. Everything the page runs is in this folder.

---

## Privacy and data

- There are no accounts, cookies, analytics or tracking.
- Students' ticks, answers, name and viewer settings are stored **only in their own browser** (`localStorage`, keys starting `mg3d:`). Nothing is sent to you or anyone else. Students download their answers as a file if they need to hand them in. **Start again** in *My answers* clears them.
- To look things up, the page contacts these public databases directly from the student's browser:
  - `rest.uniprot.org` (UniProt)
  - `search.rcsb.org`, `data.rcsb.org`, `models.rcsb.org`, `files.rcsb.org` and `cdn.rcsb.org` (RCSB PDB)
  - `alphafold.ebi.ac.uk` (AlphaFold DB)
- The tutorial structures are bundled, so the core practical still works if one of these services is slow.

---

## Browser support

- **Browsers:** current Chrome, Edge, Firefox and Safari on Windows, macOS, Linux and ChromeOS. The 3D viewer needs WebGL, which almost every computer has. If WebGL is missing, the tutorial and the UniProt and PDB tabs still work, and the viewer explains the problem.
- **Tablets and phones:** they work, with the workbench opening as a full-screen panel, but a laptop or desktop with a mouse is much better for the practical.
- **Mouse and keyboard:** left-drag rotates, right-drag moves, the scroll wheel zooms, a click selects a residue, a double-click centres on it and <kbd>Esc</kbd> clears the selection. **Controls** in the header lists all of them.

---

## Differences from ICM-Browser

The Reference chapter has a table mapping ICM-Browser actions to this page. A few things to be aware of:

- **Assessment brief:** it currently says the figure should be generated using the ICM Browser (slide 44 of the lecture). Update it if students may now use this page instead. Figures export as PNGs of up to 4× screen resolution, with labels and colour key, and sessions can be saved and reopened.
- **Interactions:** hydrogen bonds and salt bridges are drawn from NGL's geometric criteria. Like ICM's, they are indicative rather than definitive.
- **Superposition:** Cα atoms are superposed after a sequence alignment, with outlier rejection. The RMSD reported for the AlphaFold model onto 3FXI chain A is about 0.7 Å over ≈ 590 Cα.
- **ICM-specific features:** ICM scripting and `.icb` files are not supported. Students can still download coordinates (`.pdb`) from the *Save image* tab to open elsewhere.

---

## Credits and licences

- **Viewer:** built on [NGL Viewer](https://nglviewer.org) (MIT licence; see `assets/vendor/ngl/LICENSE`). Cite: Rose AS *et al.* (2018) *Bioinformatics* 34: 3755–3758; Rose AS & Hildebrand PW (2015) *Nucleic Acids Res* 43: W576–W579.
- **Data:**
  - Structures from the [RCSB Protein Data Bank](https://www.rcsb.org) (wwPDB data are CC0)
  - Sequences and annotation from [UniProt](https://www.uniprot.org) (CC BY 4.0)
  - Predicted structures from the [AlphaFold Protein Structure Database](https://alphafold.ebi.ac.uk) (CC BY 4.0; Jumper *et al.* 2021 *Nature* 596: 583–589; Varadi *et al.* 2024 *Nucleic Acids Res* 52: D368–D375)

  Full citations for every PDB entry used are in the Reference chapter of the page.
- **Tutorial content:** adapted from the module's UniProt, PDB and ICM-Browser tutorials and worksheets for the Week 3 *Introduction to Bioinformatics and Molecular Graphics* practical.
