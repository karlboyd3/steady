/* ============================================================
   STEADY — Exercise library (typed port of the prototype)
   Poses: points [x, y] in a 200x200 viewBox.
   Joint keys: head, sho (shoulder), elb (elbow), hnd (hand),
   hip, kA/aA (active knee/ankle), kS/aS (support knee/ankle)
   ============================================================ */

export type Point = [number, number];

export type PoseKey =
  | "head"
  | "sho"
  | "elb"
  | "hnd"
  | "hip"
  | "kA"
  | "aA"
  | "kS"
  | "aS";

export type Pose = Record<PoseKey, Point>;

export type ExerciseType = "reps" | "time";

export type Prop = "mat" | "wall" | "wallRight" | "chair" | "support";

export type MuscleGroup =
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "hipAbductors"
  | "hipAdductors"
  | "core"
  | "lowerBack";

/** A common form mistake, with a plain-language reason it matters. */
export interface CommonMistake {
  title: string;
  detail: string;
}

export interface Exercise {
  name: string;
  type: ExerciseType;
  /** Seconds per rep — present on `reps` exercises only. */
  cadence?: number;
  perLeg: boolean;
  prop: Prop;
  cue: string;
  steps: string[];
  poses: { A: Pose; B: Pose };
  /** Muscle groups this exercise primarily targets, for the BodyMap tab. */
  focusAreas: MuscleGroup[];
  /**
   * Content below (commonMistakes, breathingTips, estimatedKcalPerMin) is
   * clinically-informed but PENDING REVIEW by a licensed physical therapist —
   * treat as a reasonable starting point, not verified medical guidance.
   */
  commonMistakes: CommonMistake[];
  breathingTips: string[];
  /** Rough MET-derived rate, displayed as "≈ N kcal" — not a precise measurement. */
  estimatedKcalPerMin: number;
  /** When set, the How-to-do tab shows a lazy-loaded video embed; omitted otherwise. */
  videoUrl?: string;
}

/** A concrete exercise scheduled for a given day, with resolved volume. */
export interface DayItem {
  id: ExerciseId;
  ex: Exercise;
  /** Present on `reps` exercises. */
  reps?: number;
  /** Present on `time` exercises. */
  secs?: number;
}

export const EX = {
  quadSet: {
    name: "Quad Squeezes",
    type: "reps",
    cadence: 6,
    perLeg: false,
    prop: "mat",
    cue: "Press the back of your knee gently into the floor. Hold 5 seconds, then relax.",
    steps: [
      "Lie on your back, legs straight",
      "Tighten the muscle on top of your thigh",
      "Hold for 5 seconds, then fully relax",
    ],
    focusAreas: ["quads"],
    estimatedKcalPerMin: 1.5,
    commonMistakes: [
      { title: "Holding your breath", detail: "Breath-holding during the squeeze raises blood pressure for no benefit — breathe normally throughout." },
      { title: "Not fully relaxing between reps", detail: "The muscle needs to fully reset each rep, or fatigue builds unevenly." },
      { title: "Squeezing too hard, too fast", detail: "Jerking into the contraction can aggravate a sensitive knee — ease in smoothly." },
      { title: "Arching the low back", detail: "Pushing the knee down by arching the spine works around the thigh muscle instead of through it." },
    ],
    breathingTips: [
      "Exhale gently as you squeeze",
      "Inhale as you relax",
      "Never hold your breath",
    ],
    poses: {
      A: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [138, 148], aA: [174, 148], kS: [136, 145], aS: [172, 145] },
      B: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [138, 152], aA: [174, 152], kS: [136, 145], aS: [172, 145] },
    },
  },
  heelSlide: {
    name: "Heel Slides",
    type: "reps",
    cadence: 5,
    perLeg: true,
    prop: "mat",
    cue: "Slide your heel toward you as far as comfortable, then slide it back out.",
    steps: [
      "Lie on your back",
      "Slide your heel toward your body, bending the knee",
      "Slide back out slowly — no rushing",
    ],
    focusAreas: ["quads", "hamstrings"],
    estimatedKcalPerMin: 2,
    commonMistakes: [
      { title: "Forcing the slide past a pinch", detail: "Mobility work should stop at resistance, not push through pain." },
      { title: "Letting the knee cave inward", detail: "The kneecap should track straight, not roll toward the other leg." },
      { title: "Rushing the slide", detail: "Fast reps skip the controlled stretch that makes this exercise effective." },
      { title: "Lifting the hip off the floor", detail: "Keep the pelvis flat — the movement should stay isolated to the knee and ankle." },
    ],
    breathingTips: [
      "Inhale as you slide the heel in",
      "Exhale as you slide it back out",
    ],
    poses: {
      A: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [138, 148], aA: [174, 148], kS: [137, 145], aS: [173, 145] },
      B: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [124, 114], aA: [124, 148], kS: [137, 145], aS: [173, 145] },
    },
  },
  straightLegRaise: {
    name: "Straight Leg Raises",
    type: "reps",
    cadence: 6,
    perLeg: true,
    prop: "mat",
    cue: "Keep the knee straight and lift the whole leg about 12 inches. Lower slowly.",
    steps: [
      "Bend your other knee, foot flat on floor",
      "Keep the working leg completely straight",
      "Lift to the height of the bent knee, lower with control",
    ],
    focusAreas: ["quads", "core"],
    estimatedKcalPerMin: 2.5,
    commonMistakes: [
      { title: "Letting the knee bend", detail: "If the knee bends, the quad stops doing the work — keep it locked straight throughout." },
      { title: "Lifting too high, too fast", detail: "Swinging the leg up uses momentum instead of muscle control." },
      { title: "Arching the lower back", detail: "Press your low back gently toward the floor so your abs help stabilize, not your spine." },
      { title: "Dropping the leg on the way down", detail: "The lowering phase is where most of the benefit happens — control it." },
    ],
    breathingTips: [
      "Exhale as you lift",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [138, 148], aA: [174, 148], kS: [126, 122], aS: [126, 148] },
      B: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [124, 116], aA: [146, 86], kS: [126, 122], aS: [126, 148] },
    },
  },
  gluteBridge: {
    name: "Glute Bridges",
    type: "reps",
    cadence: 5,
    perLeg: false,
    prop: "mat",
    cue: "Squeeze your glutes and lift your hips until your body makes a straight line.",
    steps: [
      "Bend both knees, feet flat and hip-width apart",
      "Push through your heels and lift your hips",
      "Pause at the top, then lower slowly",
    ],
    focusAreas: ["glutes", "hamstrings", "core", "lowerBack"],
    estimatedKcalPerMin: 3,
    commonMistakes: [
      { title: "Pushing through the toes instead of the heels", detail: "Heel-driven pressure activates the glutes; toe-driven shifts work to the quads and calves." },
      { title: "Overarching at the top", detail: "Lift until hips, knees, and shoulders line up — no further. Over-arching stresses the low back." },
      { title: "Letting the knees splay outward", detail: "Keep knees stacked over ankles and hip-width apart throughout." },
      { title: "Rushing the lower", detail: "Drop back down slowly instead of letting gravity do it." },
    ],
    breathingTips: [
      "Exhale as you lift your hips",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [100, 148], kA: [126, 118], aA: [126, 148], kS: [122, 120], aS: [122, 148] },
      B: { head: [30, 146], sho: [50, 148], elb: [68, 156], hnd: [86, 158], hip: [102, 116], kA: [126, 114], aA: [126, 148], kS: [122, 116], aS: [122, 148] },
    },
  },
  sideLegRaise: {
    name: "Side-Lying Leg Raises",
    type: "reps",
    cadence: 5,
    perLeg: true,
    prop: "mat",
    cue: "Lying on your side, lift your top leg up, keeping it straight. Lower slowly.",
    steps: [
      "Lie on your side, bottom knee slightly bent",
      "Keep the top leg straight and in line with your body",
      "Lift about 12–18 inches, lower with control",
    ],
    focusAreas: ["hipAbductors", "glutes"],
    estimatedKcalPerMin: 2.5,
    commonMistakes: [
      { title: "Rolling the hips backward", detail: "Rotating the top hip back lets the hip flexor cheat the movement — keep hips stacked." },
      { title: "Lifting higher than control allows", detail: "A small, controlled lift works the target muscle better than a big swing." },
      { title: "Letting the top foot turn toward the ceiling", detail: "Keep toes pointing forward, not up, to isolate the outer hip." },
      { title: "Speeding through reps", detail: "A slow lift and slower lower is the point of this exercise." },
    ],
    breathingTips: [
      "Exhale as you lift the leg",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [30, 146], sho: [50, 148], elb: [64, 158], hnd: [80, 160], hip: [100, 148], kA: [138, 144], aA: [174, 144], kS: [130, 152], aS: [164, 156] },
      B: { head: [30, 146], sho: [50, 148], elb: [64, 158], hnd: [80, 160], hip: [100, 148], kA: [132, 114], aA: [164, 94], kS: [130, 152], aS: [164, 156] },
    },
  },
  seatedHamstringStretch: {
    name: "Seated Hamstring Stretch",
    type: "time",
    perLeg: true,
    prop: "mat",
    cue: "Reach gently toward your foot until you feel a comfortable stretch behind your thigh. Breathe.",
    steps: [
      "Sit tall with one leg straight in front",
      "Tuck the other foot toward your inner thigh",
      "Hinge forward from the hips — a gentle stretch, never pain",
    ],
    focusAreas: ["hamstrings", "lowerBack"],
    estimatedKcalPerMin: 1.5,
    commonMistakes: [
      { title: "Bouncing into the stretch", detail: "Bouncing can trigger a protective muscle response — ease in and hold still." },
      { title: "Rounding the back sharply to reach further", detail: "Hinge from the hips with a long spine rather than curling the back to gain range." },
      { title: "Forcing extra range for a deeper stretch", detail: "Stop at a comfortable pull, not pain." },
      { title: "Holding your breath while stretching", detail: "Tension in the breath transfers to the muscle — breathe slow and steady." },
    ],
    breathingTips: [
      "Slow, steady breaths throughout",
      "Let each exhale soften the stretch a little further",
    ],
    poses: {
      A: { head: [84, 72], sho: [86, 90], elb: [96, 106], hnd: [104, 118], hip: [92, 140], kA: [128, 144], aA: [164, 146], kS: [114, 148], aS: [100, 154] },
      B: { head: [102, 86], sho: [102, 102], elb: [116, 116], hnd: [132, 130], hip: [92, 140], kA: [128, 144], aA: [164, 146], kS: [114, 148], aS: [100, 154] },
    },
  },
  calfStretchWall: {
    name: "Wall Calf Stretch",
    type: "time",
    perLeg: true,
    prop: "wall",
    cue: "Back leg straight, heel down. Lean toward the wall until you feel the stretch in your calf.",
    steps: [
      "Hands on the wall, one foot stepped back",
      "Keep the back knee straight and heel on the floor",
      "Lean forward gently and hold",
    ],
    focusAreas: ["calves"],
    estimatedKcalPerMin: 1.5,
    commonMistakes: [
      { title: "Letting the back heel lift off the floor", detail: "The heel must stay planted, or the calf isn't actually being stretched." },
      { title: "Bending the back knee", detail: "A straight back knee targets the calf; a bent knee takes the stretch away." },
      { title: "Leaning from the waist instead of the ankle", detail: "The lean should come from shifting your whole body toward the wall, not bending forward." },
      { title: "Overstretching for a deeper pull", detail: "A comfortable stretch is enough — forcing it can strain the Achilles." },
    ],
    breathingTips: [
      "Breathe normally",
      "Let tension release a little more with each exhale",
    ],
    poses: {
      A: { head: [102, 44], sho: [104, 64], elb: [122, 70], hnd: [140, 76], hip: [94, 108], kA: [84, 142], aA: [70, 172], kS: [112, 138], aS: [116, 172] },
      B: { head: [108, 46], sho: [110, 66], elb: [126, 72], hnd: [140, 76], hip: [100, 110], kA: [86, 142], aA: [70, 172], kS: [114, 138], aS: [116, 172] },
    },
  },
  sitToStand: {
    name: "Sit-to-Stands",
    type: "reps",
    cadence: 6,
    perLeg: false,
    prop: "chair",
    cue: "Stand up from the chair without using your hands if you can, then sit back down slowly.",
    steps: [
      "Sit near the front edge of a sturdy chair",
      "Lean forward slightly, push through your heels to stand",
      "Lower back down slowly — control is the exercise",
    ],
    focusAreas: ["quads", "glutes", "core"],
    estimatedKcalPerMin: 4,
    commonMistakes: [
      { title: "Using your hands to push off", detail: "Try to stand using leg strength alone — hands are a fallback, not the default." },
      { title: "Standing up too fast", detail: "A quick pop-up uses momentum instead of muscle — rise with control." },
      { title: "Letting the knees cave inward", detail: "Keep knees tracking over your toes as you rise and sit." },
      { title: "Plopping back into the chair", detail: "Lower yourself with control instead of dropping the last few inches." },
    ],
    breathingTips: [
      "Exhale as you stand",
      "Inhale as you sit back down",
    ],
    poses: {
      A: { head: [96, 46], sho: [94, 64], elb: [104, 84], hnd: [112, 100], hip: [80, 114], kA: [112, 134], aA: [108, 172], kS: [106, 136], aS: [102, 172] },
      B: { head: [100, 38], sho: [100, 60], elb: [92, 84], hnd: [90, 104], hip: [98, 106], kA: [102, 138], aA: [104, 172], kS: [96, 138], aS: [96, 172] },
    },
  },
  seatedKneeExtension: {
    name: "Seated Knee Extensions",
    type: "reps",
    cadence: 6,
    perLeg: true,
    prop: "chair",
    cue: "Straighten your knee fully, pause at the top, and lower slowly.",
    steps: [
      "Sit tall in a chair, feet flat",
      "Straighten one knee until the leg is level",
      "Hold 2 seconds at the top, lower with control",
    ],
    focusAreas: ["quads"],
    estimatedKcalPerMin: 2.5,
    commonMistakes: [
      { title: "Kicking the leg up fast", detail: "A quick kick uses momentum — straighten the knee slowly and with control." },
      { title: "Not fully straightening the knee", detail: "The last few degrees of extension are where the quad works hardest — go all the way if it's pain-free." },
      { title: "Letting the thigh lift off the seat", detail: "The movement should come from the knee only, not the hip." },
      { title: "Skipping the hold at the top", detail: "Pausing briefly at full extension increases the strengthening effect." },
    ],
    breathingTips: [
      "Exhale as you extend the knee",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [90, 42], sho: [90, 62], elb: [98, 84], hnd: [96, 104], hip: [84, 112], kA: [114, 134], aA: [112, 170], kS: [110, 136], aS: [104, 172] },
      B: { head: [90, 42], sho: [90, 62], elb: [98, 84], hnd: [96, 104], hip: [84, 112], kA: [114, 134], aA: [150, 126], kS: [110, 136], aS: [104, 172] },
    },
  },
  standingHamstringCurl: {
    name: "Standing Hamstring Curls",
    type: "reps",
    cadence: 4,
    perLeg: true,
    prop: "support",
    cue: "Hold a chair or counter for balance. Bring your heel up toward your seat, then lower.",
    steps: [
      "Stand tall holding a chair back or counter",
      "Bend one knee, lifting your heel behind you",
      "Lower slowly — keep your knees side by side",
    ],
    focusAreas: ["hamstrings", "glutes"],
    estimatedKcalPerMin: 3,
    commonMistakes: [
      { title: "Swinging the leg for momentum", detail: "Curl the heel up with muscle control, not a kick." },
      { title: "Letting the knees drift apart", detail: "Keep both knees pointing forward and close together throughout." },
      { title: "Leaning the torso forward", detail: "Stay tall — leaning forward shifts the work away from the hamstring." },
      { title: "Rushing the lowering phase", detail: "The slow lower is as important as the curl itself." },
    ],
    breathingTips: [
      "Exhale as you curl the heel up",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [104, 138], aA: [106, 172], kS: [97, 138], aS: [97, 172] },
      B: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [104, 138], aA: [120, 130], kS: [97, 138], aS: [97, 172] },
    },
  },
  calfRaise: {
    name: "Calf Raises",
    type: "reps",
    cadence: 4,
    perLeg: false,
    prop: "support",
    cue: "Rise up onto the balls of your feet, pause, and lower slowly.",
    steps: [
      "Hold a chair or counter lightly for balance",
      "Press up onto your toes as high as comfortable",
      "Lower down slowly over 2 seconds",
    ],
    focusAreas: ["calves"],
    estimatedKcalPerMin: 3,
    commonMistakes: [
      { title: "Bouncing at the bottom", detail: "Bouncing uses momentum instead of the calf muscle — pause briefly between reps." },
      { title: "Not rising all the way onto the toes", detail: "A partial raise trains less range than a full one." },
      { title: "Leaning on the support for balance", detail: "Use it lightly for balance, not to take weight off your legs." },
      { title: "Dropping down fast", detail: "A slow, controlled lower builds more strength than letting gravity do the work." },
    ],
    breathingTips: [
      "Exhale as you rise onto your toes",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [104, 138], aA: [106, 172], kS: [97, 138], aS: [97, 172] },
      B: { head: [100, 31], sho: [100, 53], elb: [82, 85], hnd: [66, 90], hip: [100, 99], kA: [104, 131], aA: [106, 164], kS: [97, 131], aS: [97, 164] },
    },
  },
  quadStretchStanding: {
    name: "Standing Quad Stretch",
    type: "time",
    perLeg: true,
    prop: "support",
    cue: "Hold your ankle behind you and gently pull until you feel a stretch in the front of your thigh.",
    steps: [
      "Hold a chair or wall with one hand for balance",
      "Grab your ankle behind you (use a towel if needed)",
      "Keep knees together — gentle stretch, steady breathing",
    ],
    focusAreas: ["quads"],
    estimatedKcalPerMin: 1.5,
    commonMistakes: [
      { title: "Letting the knees drift apart", detail: "Keep both knees together to keep the stretch targeted to the front of the thigh." },
      { title: "Arching the lower back to pull harder", detail: "The stretch should come from the hip and knee, not from bending the spine." },
      { title: "Pulling the ankle too hard", detail: "Ease into resistance — a gentle pull is enough." },
      { title: "Rushing the hold", detail: "A stretch needs time to actually lengthen the muscle — settle in and stay still." },
    ],
    breathingTips: [
      "Slow, steady breaths",
      "Let each exhale ease you slightly deeper",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [104, 94], hnd: [112, 116], hip: [100, 106], kA: [102, 140], aA: [114, 118], kS: [97, 138], aS: [97, 172] },
      B: { head: [100, 38], sho: [100, 60], elb: [103, 93], hnd: [110, 112], hip: [100, 106], kA: [102, 140], aA: [112, 114], kS: [97, 138], aS: [97, 172] },
    },
  },
  wallSit: {
    name: "Wall Sit",
    type: "time",
    perLeg: false,
    prop: "wallRight",
    cue: "Back flat against the wall, slide down until your thighs angle toward level. Hold steady.",
    steps: [
      "Stand with your back against a wall",
      "Slide down — only as far as feels solid",
      "Keep knees over ankles, breathe normally",
    ],
    focusAreas: ["quads", "glutes", "core"],
    estimatedKcalPerMin: 4,
    commonMistakes: [
      { title: "Sliding too low too soon", detail: "A lower angle is harder on the knees — build up depth over weeks, not in one session." },
      { title: "Letting the knees push past the toes", detail: "Knees should stay stacked roughly over the ankles." },
      { title: "Holding your breath", detail: "Isometric holds tempt breath-holding — keep breathing normally throughout." },
      { title: "Gripping the wall with tense shoulders", detail: "Relax the upper body — the work should be in the legs." },
    ],
    breathingTips: [
      "Steady, continuous breathing throughout the hold",
      "Never hold your breath under tension",
    ],
    poses: {
      A: { head: [116, 48], sho: [116, 70], elb: [112, 92], hnd: [110, 110], hip: [116, 118], kA: [90, 122], aA: [90, 172], kS: [94, 126], aS: [94, 172] },
      B: { head: [116, 50], sho: [116, 72], elb: [112, 94], hnd: [110, 112], hip: [116, 120], kA: [90, 123], aA: [90, 172], kS: [94, 127], aS: [94, 172] },
    },
  },
  miniSquat: {
    name: "Mini Squats",
    type: "reps",
    cadence: 5,
    perLeg: false,
    prop: "support",
    cue: "Bend your knees a quarter of the way down, keeping heels on the floor, then stand tall.",
    steps: [
      "Feet hip-width apart, hold support if needed",
      "Bend knees about 30–45 degrees — shallow is correct",
      "Keep knees tracking over your toes, stand back up",
    ],
    focusAreas: ["quads", "glutes", "core"],
    estimatedKcalPerMin: 3.5,
    commonMistakes: [
      { title: "Squatting too deep", detail: "This is a shallow squat by design — going too low adds unnecessary knee stress." },
      { title: "Letting heels lift off the floor", detail: "Weight should stay through the whole foot, heels planted." },
      { title: "Knees caving inward", detail: "Keep knees tracking in line with your toes as you bend." },
      { title: "Leaning too far forward", detail: "Keep your chest reasonably upright instead of folding forward from the hips." },
    ],
    breathingTips: [
      "Inhale as you bend your knees",
      "Exhale as you stand back up",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [86, 80], hnd: [74, 86], hip: [100, 106], kA: [104, 138], aA: [106, 172], kS: [97, 138], aS: [97, 172] },
      B: { head: [102, 52], sho: [102, 72], elb: [86, 88], hnd: [72, 92], hip: [106, 124], kA: [108, 146], aA: [106, 172], kS: [100, 146], aS: [97, 172] },
    },
  },
  singleLegBalance: {
    name: "Single-Leg Balance",
    type: "time",
    perLeg: true,
    prop: "support",
    cue: "Lift one foot slightly off the floor and hold steady. Touch the chair anytime you need to.",
    steps: [
      "Stand near a chair or counter",
      "Lift one foot an inch or two off the floor",
      "Eyes forward, stand tall — wobbling is the workout",
    ],
    focusAreas: ["core", "hipAbductors", "calves"],
    estimatedKcalPerMin: 2,
    commonMistakes: [
      { title: "Locking the standing knee", detail: "A soft, slightly bent knee balances better than a stiff, locked one." },
      { title: "Staring at your feet", detail: "Looking down throws off balance — fix your eyes on a point ahead of you." },
      { title: "Holding your breath while concentrating", detail: "Tension creeps in when focusing hard — keep breathing normally." },
      { title: "Avoiding the wobble", detail: "A little wobble is normal, and is exactly what builds the stabilizing muscles." },
    ],
    breathingTips: [
      "Normal, relaxed breathing",
      "Don't tense up while balancing",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [76, 72], hnd: [58, 78], hip: [100, 106], kA: [106, 146], aA: [110, 158], kS: [97, 138], aS: [97, 172] },
      B: { head: [100, 38], sho: [100, 60], elb: [76, 72], hnd: [58, 78], hip: [100, 106], kA: [106, 145], aA: [110, 155], kS: [97, 138], aS: [97, 172] },
    },
  },
  splitSquat: {
    name: "Supported Split Squats",
    type: "reps",
    cadence: 5,
    perLeg: true,
    prop: "support",
    cue: "One foot back, dip your back knee toward the floor, then press back up. Hold support as needed.",
    steps: [
      "Step one foot back, hold a chair or counter",
      "Bend both knees, back knee dropping toward the floor",
      "Only go as deep as feels solid — press back up tall",
    ],
    focusAreas: ["quads", "glutes", "hipAdductors"],
    estimatedKcalPerMin: 4,
    commonMistakes: [
      { title: "Letting the front knee drift past the toes", detail: "Keep the front shin fairly vertical as you dip down." },
      { title: "Going deeper than feels stable", detail: "Only lower as far as your balance and comfort allow — depth isn't the goal." },
      { title: "Leaning heavily on the support", detail: "Use it for balance, not to take your body weight." },
      { title: "Rushing back up", detail: "Press up with control rather than bouncing out of the bottom." },
    ],
    breathingTips: [
      "Inhale as you lower",
      "Exhale as you press back up",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [80, 90], hnd: [66, 96], hip: [100, 106], kA: [88, 140], aA: [78, 172], kS: [110, 138], aS: [114, 172] },
      B: { head: [100, 56], sho: [100, 78], elb: [80, 92], hnd: [66, 96], hip: [98, 124], kA: [88, 152], aA: [78, 172], kS: [114, 144], aS: [114, 172] },
    },
  },
  standingHipAbduction: {
    name: "Standing Side Leg Raises",
    type: "reps",
    cadence: 4,
    perLeg: true,
    prop: "support",
    cue: "Keeping your leg straight, lift it out to the side, then lower with control.",
    steps: [
      "Stand tall holding a chair or counter",
      "Lift one leg out to the side, knee straight",
      "Keep your body upright — no leaning, lower slowly",
    ],
    focusAreas: ["hipAbductors", "glutes", "core"],
    estimatedKcalPerMin: 3,
    commonMistakes: [
      { title: "Leaning the torso to lift the leg higher", detail: "Leaning sideways lets momentum cheat the lift — stay upright and lift only as high as strict form allows." },
      { title: "Turning the toes upward", detail: "Keep the toes pointing forward to keep the target hip muscles doing the work." },
      { title: "Swinging the leg", detail: "A controlled, deliberate lift works better than a fast swing." },
      { title: "Rushing the return", detail: "Lower the leg with the same control as the lift." },
    ],
    breathingTips: [
      "Exhale as you lift the leg out to the side",
      "Inhale as you lower",
    ],
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [104, 138], aA: [106, 172], kS: [97, 138], aS: [97, 172] },
      B: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [118, 134], aA: [136, 160], kS: [97, 138], aS: [97, 172] },
    },
  },
} satisfies Record<string, Exercise>;

export type ExerciseId = keyof typeof EX;

/** Per-session reps/secs overrides, keyed by exercise id — not persisted to the base library. */
export type RepOverrides = Partial<
  Record<ExerciseId, { reps?: number; secs?: number }>
>;

/** Apply per-session overrides on top of buildDay()'s resolved volume. */
export function applyOverrides(
  items: DayItem[],
  overrides?: RepOverrides
): DayItem[] {
  if (!overrides) return items;
  return items.map((item) => {
    const o = overrides[item.id];
    if (!o) return item;
    return {
      ...item,
      ...(o.reps != null ? { reps: o.reps } : {}),
      ...(o.secs != null ? { secs: o.secs } : {}),
    };
  });
}
