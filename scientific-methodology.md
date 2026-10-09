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

The implemented Epley estimate requires a recorded 0 RIR, positive external load, and 2–10 repetitions. A 1-repetition record is treated as a tested load only with 0 RIR. Bodyweight, bands, assistance, machines, cables and timed movements are excluded from estimated 1RM and load progression. Use Epley only as an estimated maximum from a maximum-effort repetition set. A conservative app range of 2–10 repetitions is informed by Reynolds' finding that low-repetition prediction performs better for studied bench and leg presses. A single actual maximal repetition is recorded directly. The implementation does not add RIR to the repetition count. Estimates should help compare training records and choose reasonable starting loads; users still assess effort and technique.

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

Load progression requires two comparable sessions, at least two work sets each, above the saved exercise repetition target (12 is an explicitly disclosed fallback for older records without a target) with at least 1 RIR and consistent load. The app suggests considering a small 2–5% increase; a 2.5% example is displayed, never automatically applied. Confirmation thresholds are programming heuristics informed by the historical ACSM progression principle.
