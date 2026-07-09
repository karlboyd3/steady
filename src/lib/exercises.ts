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
    poses: {
      A: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [104, 138], aA: [106, 172], kS: [97, 138], aS: [97, 172] },
      B: { head: [100, 38], sho: [100, 60], elb: [82, 92], hnd: [66, 96], hip: [100, 106], kA: [118, 134], aA: [136, 160], kS: [97, 138], aS: [97, 172] },
    },
  },
} satisfies Record<string, Exercise>;

export type ExerciseId = keyof typeof EX;
