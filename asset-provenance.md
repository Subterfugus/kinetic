# Anatomy and exercise asset research

Retrieved and inspected 2026-10-08. Files in this folder are source candidates and research inputs, not an app exercise curriculum.

## Preferred interactive anatomy candidate

- `anatomy/front.svg` and `anatomy/back.svg`: exact copies of the named vector paths in `muscle_mapper/lib/src/assets/advanced/`. Front viewBox `0 0 587 1137`; back viewBox is recorded in the mapping.
- `anatomy/muscle-map.json`: 87 front paths and 52 back paths; 48 normalized targets including muscle heads and regional fibers. Preserve the existing path IDs and attach interaction to the actual paths; do not overlay invented muscle shapes.
- Original author: Ryan Graves, “Human Anatomy Component System”. Original source: https://www.figma.com/community/file/1320468164820924031/human-anatomy-component-system
- Retrieved through https://github.com/suryamolly/muscle_mapper at commit `8350dcaea79cd1013a140887ae4f0a3369bc4b73`.
- Repository `CREDITS.md` explicitly licenses the advanced anatomy as **CC BY 4.0**, separately from the MIT software license. Saved as `anatomy/SOURCE-CREDITS.md`.
- Primary Figma policy independently confirms free Community files are CC BY 4.0: https://help.figma.com/hc/en-us/articles/360042296374-Figma-Community-copyright-and-licensing . Saved as `Figma-community-license.html`.
- The original Figma asset page was inaccessible to the research tools. Specific-asset licensing therefore relies on the distributing repository's explicit credits, supported by Figma's primary policy, rather than a directly inspected original asset page.
- Attribution to include in the app: **“Human Anatomy Component System” by Ryan Graves, used under CC BY 4.0. Source: Figma Community. Changes: interactive highlighting and normalized muscle labels.** Link the source and https://creativecommons.org/licenses/by/4.0/ . Adapt this change statement to actual final changes.
- Do not call the entire app MIT merely because the wrapper package is MIT; the anatomy attribution is separate.

### Anatomical precision limits

The figures are anatomical illustrations with plausible superficial muscle boundaries, not a clinically validated segmentation atlas. Path names come from the SVG publisher. All numbered external-oblique slips map to one external-oblique target; likewise abdominal segments share one rectus-abdominis target. Do not treat source numbering as distinct physiological muscles. Upper lateral rib slips are not independently validated against serratus-anterior boundaries, so avoid claiming exact boundaries at that detail.

Source names have minor spelling issues (`sartoris` is normalized to Sartorius). Left/right refers to the person depicted. Preserve that convention when toggling between front and back.

There are no dedicated named paths for soleus, brachialis, erector spinae, supraspinatus, or teres major/minor. No shapes have been created to imply these omissions are present. Named connective tissue (`iliotibial_tract`) and hands/feet/underlayer are deliberately excluded from the muscle mapping.

The `datasetGroup` fields are coarse convenience filters only. Selecting a biceps head does **not** prove an exercise isolates that head. Null groups indicate no precise source category; Sartorius is deliberately not misclassified as quadriceps.

## Side anatomy reference (removed in 1.7)

Removed on 2026-10-10 at the owner's request: the plate looked nothing like the front/back maps. The licensed source (muscle_mapper at the commit above, and its current `main`) ships only front and back views, male and female; no side view exists there. The notes below describe the removed files.


- `anatomy/side-reference.png`: unmodified 1460 × 2652 historical plate from Hermann Braus, *Anatomie des Menschen*, 1921.
- Source and license declaration: https://commons.wikimedia.org/wiki/File:Braus_1921_248.png . Saved source page: `Braus_1921_248-source.html`.
- Commons identifies the image as public domain: author died in 1924; PD-old-100-expired, PD-Art, public-domain in the United States because published before 1931. Faithful-reproduction status may vary outside covered jurisdictions as described on the source page.
- `anatomy/side-landmarks.json`: ten manually positioned points on visibly labeled muscles. These are **landmarks/pins**, not traced muscle boundaries. The points support a lateral reference view without claiming segmentation.
- The original plate is cropped at the upper calf, lacks feet/lower calf, and depicts some dissected or removed structures. It is not a complete matching full-body side counterpart to the SVG pair. Do not imply full 360-degree anatomical coverage.
- Suggested credit: **Hermann Braus, Anatomie des Menschen (1921), lateral superficial-muscle plate. Public domain; via Wikimedia Commons.**

## Additional anatomy candidate with historical educational provenance

- `Muscles_front_and_back.svg`: actual editable vector shapes; no embedded raster. ViewBox `0 0 406.99026 354.43411`. Original paths use arbitrary IDs rather than muscle names.
- Source: https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg . Saved source page: `Muscles_front_and_back-source.html`.
- Authors: OpenStax, Tomáš Kebert, umimeto.org. Uploaded 2020-09-13. Explicit **CC BY-SA 4.0** on the file page. Derivatives must retain attribution, license link, modification notice, and the same/compatible license for the adapted asset.
- Description states it was manually redrawn from OpenStax's 2016 diagram and modified, especially posterior view. Thus this is an educational-derived illustration, not a newly verified medical segmentation.
- Current OpenStax Anatomy & Physiology 2e web pages display CC BY-NC-SA restrictions, so do not assume new/current source figures are CC BY merely from older OpenStax conventions. The historical Wikimedia file's documented license is distinct.
- Rendered visual QA: `anatomy-front-back.png`.

## Exercise dataset candidate

- `exercises.json` (single-array JSON), `exercise-schema.json`, `free-exercise-db-LICENSE.md`, `exercise-audit.json`.
- Complete original checkout with exercise photos at `free-exercise-db/exercises/`. All 1746 referenced image files were found locally.
- Source: https://github.com/yuhonas/free-exercise-db ; original upstream acknowledged by source: https://github.com/wrkout/exercises.json . Main commit retrieved: `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`.
- License declared by repository: **Unlicense/public-domain dedication**, not CC0. Attribution is not required by that license, but provenance credit is useful: “Exercise metadata adapted from free-exercise-db by yuhonas, based on exercises.json by Ollie Jennings.”
- Actual current count: 876 exercise entries. User scope now favors a curated 50–70 established movements; use this only as a candidate source and review that subset.
- Fields: `id`, `name`, `force`, `level`, `mechanic`, `equipment`, `primaryMuscles`, `secondaryMuscles`, `instructions`, `category`, `images`.
- Seventeen broad muscle categories, not individual anatomy muscles. No quantified participation, EMG measurements, per-head activation, dose prescription, set recommendations, or scientific evidence fields.
- Audit: 30 null `force`; 87 null `mechanic`; 77 null `equipment`; 5 entries with empty instruction arrays. No missing primary-muscle arrays. Dataset assigns categorical muscles but is not a peer-reviewed exercise biomechanics reference.
- Photo reuse is declared under the repository license; no separate model-release or original-photographer chain-of-title evidence was provided in the repository. For an offline scientific app the metadata is more directly useful than bundling all photos. Avoid presenting repository licensing as an independent guarantee of third-party image provenance.

## Relevant primary educational references for factual cross-checking

- Upper-limb and shoulder anatomy/actions: https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs
- Hip and lower-limb anatomy/actions: https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs

Use these for anatomical fact checks and citations. Do not copy current restricted figures or large portions of textbook prose into an app under an assumed permissive license. No action/activation percentages have been invented.
