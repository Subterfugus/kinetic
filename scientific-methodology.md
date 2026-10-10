# Fitness evidence and calculator methodology

Verified 8 October 2026. This is a focused evidence audit for an offline educational app, not a systematic review or individualized clinical prescription.

## Evidence selection

Formula constants were checked against original study abstracts or original published methods. General activity, resistance training, and sleep targets were checked against WHO, the current ACSM position stand, AASM/SRS, CDC, and AHA. Author, year, title, DOI, and URL were recorded from PubMed, publisher pages, or the responsible organization. DOI values are included only when visible in those records. Guideline web pages without DOIs use null.

The evidence collection includes primary derivation and validation studies and authoritative guidelines. The 2026 ACSM overview supersedes the 2009 position stand for broad training guidance. The 2009 practical progression rule is retained with an explicit historical label. Summaries are original paraphrases under 200 words per source; the app may bundle them for offline access while retaining external source links for optional reading.

Evidence-strength labels describe the specific supported use rather than assigning a universal rank to the paper. A well-established population equation can still have weak precision for a particular user. Source existence and bibliographic accuracy do not imply every app recommendation is directly validated.

## Calculation principles

Store and calculate in kilograms, centimetres, minutes, and years, with conversion only at input/output. Keep full numerical precision internally and round displays sensibly. Reject missing, nonfinite, or impossible inputs; do not silently clamp a physiologically implausible output into a seemingly valid answer. A formula outside its plausible scope should return an explanation.

Mifflin–St Jeor estimates resting expenditure. A chosen activity multiplier creates an initial TDEE estimate but is not part of the original validated equation. Display that assumption. TDEE already intended to cover usual training should not receive the same exercise calories again. MET gross energy includes standardized resting expenditure; a net estimate subtracts one standard resting MET. Both remain approximations.

Do not generate a guaranteed target-date forecast from the 3500-kcal-per-pound or 7700-kcal-per-kilogram rule. Energy expenditure changes with weight and activity, and intake/weight records contain error. Rolling averages and modest adjustments are useful app conventions when explicitly labeled. These sources do not establish a fixed calorie floor, fixed deficit, exact adjustment interval, or a universal weight-loss rate for every user.

The implemented Epley estimate requires a recorded 0 RIR, positive external load, and 2–10 repetitions. A 1-repetition record is treated as a tested load only with 0 RIR. Bodyweight, bands, assistance, machines, cables and timed movements are excluded from estimated 1RM and load progression. Use Epley only as an estimated maximum from a maximum-effort repetition set. A conservative app range of 2–10 repetitions is informed by Reynolds' finding that low-repetition prediction performs better for studied bench and leg presses. A single actual maximal repetition is recorded directly. The records and progression estimate does not add RIR to the repetition count. The program and goal estimate does, as a labeled heuristic (see Programming rules (1.5)). Estimates should help compare training records and choose reasonable starting loads; users still assess effort and technique.

Tanaka HRmax is a population estimate. AHA percentages are approximate general intensity bands. Their use with Tanaka combines two disclosed sources. Percent maximum heart rate and percent heart-rate reserve are different methods. The sources do not establish five universal zones, individual lactate thresholds, or exact fitness categories. Include the talk test and allow measured maximum heart rate or professional targets to override predictions.

Body-fat calculations and consumer-device readings are estimates with method-specific uncertainty. Deurenberg's 4.1-percentage-point standard error is a sample statistic, not a guaranteed individual interval. Separate calculated estimates, device readings, and clinical measurements. Do not infer muscle loss from a short-term calculated change or present a small difference as a precise tissue change.

## Training interpretation

For general health, start with the WHO aerobic and strengthening targets and gradual progression. For strength or hypertrophy, use ACSM 2026 and explain that heavier loads, multiple sets, and higher weekly volume can optimize specific outcomes while simpler or lower-volume training still benefits people.

A starting weekly set target is a programming choice. Ten sets per muscle per week is an evidence-supported hypertrophy-oriented reference, not a minimum required for progress or a universal upper limit. Recovery, adherence, training age, and response should influence subsequent changes. Partial credit for indirect sets, exercise substitutions, rest timers, RIR targets, deload triggers, and readiness scores are app conventions unless separately validated. Label them accordingly.

RIR means the number of additional repetitions the person believes they could complete with the same technique. Its subjective nature should remain visible. The Refalo trial supports stopping at 1–2 RIR as a viable option for the tested trained-adult lower-body program, not equivalence of all effort levels.

Use AASM/SRS for adult sleep guidance. The WHO 2020 adult activity guideline is not a source for adult sleep duration. No combined recovery score is implemented. Time-since-training is explicitly a display heuristic. Pearson association of sleep with an ordinal soreness rating assumes equally spaced rating steps and remains descriptive.

## Scope and unresolved items

The default research scope is generally healthy adults. Pregnancy, growing children, eating disorders, injury rehabilitation, and chronic conditions need separately appropriate guidance; do not make numerical recommendations for these populations by silently extrapolating adult equations.

Binary sex inputs refer to published formula coefficients. These studies do not directly validate selection for every transgender, intersex, or hormone-treated user. Offer transparency, optional measured values where applicable, and avoid implying that gender identity determines physiology.

The original Epley manual was not directly inspected; the displayed equation was verified in published primary methods. The original Navy circumference reports were not directly verified and no exact Navy formula is endorsed by this file. Any future Navy calculator needs its original method, measurement sites, units, and validation limits checked.

The evidence is selective and current only to the verification date. The app's bibliographic links require internet access, but bundled summaries and calculations need none.


## Implemented observation thresholds

Adaptive maintenance uses the mean recorded intake only during approximate weight stability: at least 24 complete calorie days and 8 weigh-ins spanning 21 days within 28 days, and slope within ±0.1% of body mass per week. These data minimums and stability thresholds are app heuristics. A changing-weight period does not trigger a 7700-kcal/kg conversion.

Weight smoothing is a trailing 7-calendar-day mean of available readings. Raw-weight ordinary least squares requires at least 5 weigh-ins spanning 14 days. A short-range goal scenario is shown only within 8 weeks; a 50–150% pace band is illustrative, not a confidence interval.

Muscle work counts completed, non-warm-up strength sets separately for primary and secondary groups, with stabilizers excluded. One unilateral set row means one left/right pair. These are qualitative group exposures, not muscle-specific stimulus measurements, and group totals cannot be summed without double counting.

Load progression requires two comparable sessions, at least two work sets each, above the saved exercise repetition target (12 is an explicitly disclosed fallback for older records without a target) with at least 1 RIR and consistent load. The app suggests considering a small 2–5% increase; a 2.5% example is displayed, never automatically applied. Confirmation thresholds are programming heuristics informed by the historical ACSM progression principle. Training-program load targets follow a separate rule, described under Programming rules (1.5).

## Programming rules (1.5)

The rules below are implemented in `dist/programs.js` and `dist/goals.js`. Each entry gives the rule and its numeric value, the source identifier in `assets/evidence.json` where one exists, and the certainty. Where no trial supports a value, the entry says so and calls it a practical default. A practical default is a convention chosen to make the app usable. It is not a measured physiological constant.

### Volume and counting

1. Fractional counting: a set counts 1 for each primary muscle and 0.5 for each secondary muscle. Stabilizers and non-strength items are not counted. Source: pelland2026. Certainty: moderate to strong for fractional counting as a population dose-response convention. The 0.5 weight is the best-fitting value in that meta-regression, not a measured per-muscle stimulus.
2. Weekly volume bands: the Plan page shades 6 to 10 fractional sets per muscle a week for beginners, 10 to 16 for intermediate and 12 to 20 for advanced lifters. Sources: schoenfeld2017 (more weekly sets were associated with larger muscle gains, about 0.37% per set across 15 studies) and pelland2026 (diminishing returns). Certainty: moderate for the direction of the dose-response. The band edges are practical defaults, and acsm2026 states that a volume threshold is not a universal optimum.
3. Beginner trim: for beginners, each non-main exercise with three or more sets is given one set less. Source: none direct; it is consistent with the 2 to 3 sets per exercise in acsm2026. Certainty: practical default, no trial.
4. Frequency: templates set how often each muscle is trained, and the Plan page shows the result. Primary sessions per week for the major muscles are two for every muscle only in the six-day template. The two-day template gives zero to two sessions, the three-day full-body template one to three, and the four- and five-day templates one or two. Strength foundations (three days) gives calves and triceps no primary work, and Strength upper/lower (four days) gives rear deltoids none. Secondary credit from other exercises is included in the weekly totals. Sources: pelland2026 (strength gains rose with frequency, with diminishing returns; the hypertrophy effect was compatible with negligible) and acsm2026 (at least two weekly sessions for strength). Certainty: moderate.
5. Full-body and split templates: templates with the same weekly volume are treated as interchangeable, so the schedule decides which one is recommended. Source: ramoscampo2024 (split and full-body routines did not differ in strength or muscle size when volume was equated). Certainty: moderate, and it applies only when volume is matched.
6. Recommendation by schedule: one or two training days give the two-day full-body program; three days give the three-day full-body program, or Strength foundations for a strength goal. Four days give upper/lower, or Strength upper/lower for a strength goal, and five days give upper/lower plus push/pull/legs. Six or more days give push/pull/legs. Beginners are moved from the five- and six-day programs to upper/lower. Sources: ramoscampo2024 (schedule equivalence) and who2020 (strengthening on at least two days a week). Certainty: low to moderate. The day thresholds are practical defaults.
7. Exercise order: templates usually list the largest lift of a session first. Source: nunes2021 (strength gains were larger for the exercise performed first, with no order effect on hypertrophy). Certainty: moderate for strength.

### Effort, repetitions and rest

8. Effort targets: main lifts (marked in the templates) use three repetitions in reserve, other compound exercises use two, and accessory exercises (isolation, curl, extension and core movements) use one. Sources: refalo2023 (no clear advantage for momentary failure on hypertrophy) and refalo2024 (one to two repetitions in reserve gave similar quadriceps growth to failure over eight weeks). Certainty: moderate for one to two repetitions in reserve. Three repetitions in reserve on main lifts goes beyond the range these studies tested and is a practical choice for heavy sets.
9. Rest: main lifts 210 seconds, other compound exercises 150 seconds, and accessory exercises 90 seconds. Source: singer2024 (a small hypertrophic benefit from resting longer than about 60 seconds, with no appreciable difference beyond about 90 seconds; some intervals include zero). Certainty: moderate to low. The 150 and 210 second values are above the point where that review found no hypertrophic difference, so they rest on heavy-set strength practice, not on that review.
10. Repetition ranges: each exercise slot has a range such as 6 to 10, 8 to 12, 10 to 15 or 12 to 20. Source: schoenfeld2021 (a narrative review proposing that hypertrophy can be obtained across a wide range of loads). Certainty: low to moderate. The specific ranges are practical defaults. The review does not state the heavier-load advantage for strength; the app takes that from acsm2026.

### Load progression

11. Double progression: add repetitions inside the range each session. When the lowest working set at the current load reaches the top of the range, add one load step and return to the bottom of the range. Sources: plotkin2022 (adding repetitions at fixed load and adding load at fixed repetitions both appeared viable over eight weeks, with small and uncertain differences) and acsm2009 (historical: increase resistance by 2 to 10% when the target repetitions are exceeded by one or two). Certainty: moderate to low. The top-of-range trigger is a practical default that acsm2009 does not specify.
12. Larger steps need more repetitions: when a load step is more than 10% of the current load, the lowest set must reach two repetitions above the top of the range before the load rises. Practical default, no trial.
13. One repeat after a miss: if the lowest set falls below the bottom of the range, the load stays the same and the next target is the bottom of the range again. Practical default; no trial tests a repeat rule.
14. Reduction after two misses: if the lowest set fell below the bottom of the range in two sessions in a row, the target load drops by 7.5%, rounded to the load step and at least one step. The lower load is prefilled and can be changed. Source: none direct; acsm2009 supports increases of 2 to 10%, not reductions. Certainty: practical default, no trial.
15. Load steps: barbell 2.5 kg (5 lb) for upper-body lifts and 5 kg (10 lb) for squat, hinge and lunge patterns; dumbbell 2 kg (5 lb); kettlebell 4 kg in both unit systems (about 8.8 lb in imperial); cable, machine and other equipment 2.5 kg (5 lb). Certainty: practical defaults. No trial tests increment size.
16. First session: there is no target load. The app suggests a load expected to allow about the top of the range plus the reserve for that slot, and asks the person to stop each set with that many repetitions left. Source: zourdos2016 (repetitions-in-reserve scale; limited to moderate for scale use). Certainty: practical default. Reserve is subjective.

### Stalls and recovery weeks

17. Stall rule: a lift has stalled when neither of its last two sessions has a higher best estimated one-rep max than the earliest of its last three sessions, with repetitions treated as zero reserve. Two or more stalled lifts in a program produce a recovery-week suggestion. Certainty: practical default, not validated.
18. Recovery week: half the working sets, rounded up, at the same loads and with at least three repetitions in reserve, for one program week. The person starts it; nothing is scheduled. Sources: coleman2024 (one week of complete rest in a nine-week program gave no benefit for muscle size, endurance or power, and smaller lower-body strength gains than continued training; the trial did not test reduced training or stalled lifters) and bell2023 (expert consensus on deload design, not a trial). Certainty: low. The reduced-training recovery week has not been tested. Scheduled deload weeks are not used, because the one controlled trial located (Coleman 2024, a full week off) found no benefit in muscle size, endurance or power.

### Substitution and compensation

19. Volume compensation: when a swap or equipment change reduces a major muscle group by at least half a fractional set, the app adds up to three sets, rounded. It first adds up to two sets to an existing non-main exercise for that muscle, to five sets at most. If none exists, it adds the simplest available exercise for the muscle, with at least two sets. Major groups are chest, lats, upper back, the three deltoid groups, biceps, triceps, quadriceps, hamstrings, glutes, calves and abdominals. Source: pelland2026 for the set as the unit of volume. The amounts are practical defaults.
20. Main lifts: a main lift keeps its main status only when the replacement has the same movement pattern and uses loaded equipment. Otherwise it becomes an ordinary exercise. Practical default.
21. Repetitions for unloaded substitutes: when a bodyweight, band or other unloaded replacement takes a slot with a repetition range, the top of the range is raised to at least 20. Practical default.
22. Unfillable items: if no available exercise can replace an item, it is removed from the session, the missing equipment is listed, and any major muscle still short is reported as not covered. Practical default.

### Goals and photos

23. Projection range: the steady pace is the least-squares trend of the last 12 weeks, extended to the target. The slowing pace comes from a logarithmic curve through the full history. It is never shorter than the steady pace, and it is set to twice the steady time when the curve gives no usable answer or a shorter one. Both are capped at 104 weeks, and both need at least four points spanning 21 days. Sources: steele2022 (strength gains follow a linear-log curve that approaches a plateau) and hall2011 (weight change slows as body mass changes). Certainty: low to moderate. The output is an illustrative range, not a forecast.
24. Body-weight pace: a loss faster than 1% of body weight a week, or a gain faster than 0.5% a week, is flagged; the flag reads as fast above 1.5 times the limit. Sources: helms2014 (contest-preparation review: a loss of about 0.5 to 1% a week to retain muscle; low to moderate) and iraki2019 (off-season review: a gain of 0.25 to 0.5% a week; the app uses the upper end for all lifters, although the review advises advanced lifters to be more conservative). Certainty: low to moderate. Both are expert reviews for specialized populations.
25. Lift pace: a lift goal is flagged when the monthly gain it needs exceeds 4% of the current estimated one-rep max for beginners, 1.5% for intermediate and 0.5% for advanced lifters, and it is marked fast above twice that rate. Source: none for these figures. steele2022 shows diminishing gains over years, which is the reason for lower ceilings with experience. Certainty: practical rule of thumb; not validated.
26. Run goals: predicted times scale with distance raised to the power 1.06, from runs of half to twice the goal distance in the same activity. Source: riegel1981 (an empirical power law from record performances; old; low to moderate). Certainty: low to moderate. The app notes that predictions become unreliable beyond a half marathon.
27. Lift estimate for goals: goal history and projections use the Epley form with the reported reserve added to the repetitions, up to 12 in total. The goal target uses zero reserve. Adding reserve is a labeled heuristic. Sources: lesuer1997 (repetition-based equations were reasonably accurate for the bench press and squat, underestimated the deadlift, and became less accurate above about 10 repetitions; the Epley form is attributed to Epley's 1985 poundage chart, which this study does not test) and reynolds2006 (accuracy falls at higher repetition counts). Certainty: limited to moderate for the equation family. The reserve addition is unvalidated.
28. Habit goals: workouts are counted in each of the last eight 7-day windows. The streak is the number of consecutive recent weeks that reach the target. Sources: harkin2016 (monitoring goal progress modestly improved attainment, more when progress was physically recorded) and swann2023 (critique of rigid goal frameworks; low to moderate). Certainty: moderate for recording progress. The streak rule is a practical convention.
29. Photo protocol: the studio advises the same place, lighting, distance (about 2 m), time of day, pose and clothing, with photos every 2 to 4 weeks. The ghost overlay shows the most recent photo of the same view. Source: none in evidence.json. Certainty: practical advice only. Photos do not measure body fat.

### Protein (1.6)

30. Protein target shortcut: the Calories page offers 1.6 g of protein per kg of the latest body weight as a starting target. Source: morton2018 (meta-analysis of 49 randomized trials of protein supplementation during resistance training; gains in fat-free mass stopped increasing at about 1.62 g/kg/day, 95% CI roughly 1.03 to 2.20). Certainty: moderate for healthy adults who lift; the interval is wide. The target is user-chosen, and the app shows protein logged against it without judging intake.

Percent-based wave programs such as 5/3/1 were deliberately not included, because no trial shows them beating simpler progression, and no source in evidence.json addresses them.

## Substitution rationale (1.5)

Ranking. A replacement must share the category and tracking type of the original. Same-movement candidates need at least one primary muscle in common. A different movement is accepted only when no exercise shares the movement, and then only when at least half of the primary muscles are shared. The same movement means the same pattern, except that isolation exercises match only when they train the same primary muscle. The score is 50 for the same movement, 30 times the overlap of primary muscles, 10 times the overlap of all listed muscles, plus 8 when the regional emphasis matches or minus 6 when it differs (for exercises that carry a regional tag), plus 2 when both exercises are loaded or both are unloaded, and minus 8 for each difficulty level above the original. Overlap is a Jaccard index. The ranking is a practical heuristic about exercise choice, not a measure of stimulus.

Similar hypertrophy across modalities when effort is matched. haugen2023 found similar hypertrophy with free weights and machines, but only five of its 13 studies measured hypertrophy. kikuchi2017 found similar chest and triceps growth from bench press and adjusted push-ups in 18 young men. Certainty: low to moderate for hypertrophy.

Strength is specific to the lift. haugen2023 found that strength gains were specific to the training type. plotkin2023 found that hip thrust and back squat produced similar gluteal growth, while squats produced more quadriceps and adductor growth (low to moderate; 34 adults, nine weeks). For that reason the ranking keeps the movement pattern first, and a swap is not treated as equal for maximal strength.

Regional differences. maeo2023 found that overhead cable triceps extensions grew the triceps and its long head more than the same exercise with the arm at the side (low to moderate; 21 adults). kinoshita2023 found that standing calf raises grew the gastrocnemius far more than seated raises, with similar soleus growth (low; 14 adults). maeo2021 found that seated leg curls, which stretch the hamstrings, grew the whole hamstring more than prone curls (low to moderate; 20 adults). These results support the regional tags on overhead triceps work (long head), standing and leg-press calf raises (gastrocnemius), seated calf raises (soleus), and seated curls and Romanian deadlift variants (hamstrings at long length). The lengthened-muscle tag for the Romanian deadlift extends the curl result to a hinge, which is an inference. Prone curls are not tagged as lengthened. Tags on incline pressing (upper chest), incline curls (biceps at long length) and leg extension (rectus femoris) rest on muscle-length reasoning. No source in evidence.json tests them. A mismatched tag lowers a substitute's score by 6.

Surface EMG is not used for ranking. vigotsky2018 explains why comparisons of EMG amplitude cannot establish which exercise builds more muscle or strength.

The Plan page adds a note when a plan trains triceps without overhead work, calves without straight-knee work, or hamstrings without a lengthened-muscle exercise. These notes use the same sources as the tags above.
