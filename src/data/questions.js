// Content and scoring logic for the quiz
// "How intentional is your child's educational strategy?"
// Source: the project's internal methodology (a child-development model).

export const AGE_GROUPS = [
  { id: "4-6", label: "Ages 4–6", hint: "early childhood" },
  { id: "7-10", label: "Ages 7–10", hint: "early elementary" },
  { id: "11-14", label: "Ages 11–14", hint: "early adolescence" },
  { id: "15-18", label: "Ages 15–18", hint: "late adolescence" },
];

// Each answer carries its own score: A — 3, B — 2, C — 1, D — 0.
const opts = (a, b, c, d) => [
  { letter: "A", score: 3, text: a },
  { letter: "B", score: 2, text: b },
  { letter: "C", score: 1, text: c },
  { letter: "D", score: 0, text: d },
];

export const QUESTIONS_BY_AGE = {
  "4-6": [
    {
      title: "Emotions",
      text: "Do you help your child notice and name emotions, understand their causes, and find an acceptable way to express feelings?",
      options: opts(
        "We regularly talk about emotions and look for ways to handle them together.",
        "We talk about it, but mostly after strong reactions.",
        "We usually just ask them to calm down without digging into the cause.",
        "We think a child should learn to manage emotions on their own."
      ),
    },
    {
      title: "Social life and relationships",
      text: "Does your child get to play with other children, learn to negotiate, share, set boundaries, and resolve conflicts?",
      options: opts(
        "That happens regularly; adults help without solving everything for the child.",
        "There's social time, but adults usually settle conflicts entirely.",
        "The child rarely spends time with peers.",
        "Shared play and social development aren't a priority yet."
      ),
    },
    {
      title: "Independence",
      text: "Can your child choose their own games, handle age-appropriate chores, and make small decisions?",
      options: opts(
        "They have steady responsibilities and the right to choose.",
        "Sometimes, when it's convenient for adults or the child takes initiative.",
        "Rarely — adults usually do it faster and better.",
        "Adults do and decide almost everything for the child."
      ),
    },
    {
      title: "Thinking and literacies",
      text: "Do you use play and everyday situations to build language, counting, logic, and understanding of the world?",
      options: opts(
        "We regularly count, read, discuss, compare, and explore in everyday life.",
        "That development mostly happens in dedicated lessons.",
        "We rarely do it, or only right before school starts.",
        "There's no systematic effort in these areas yet."
      ),
    },
    {
      title: "Curiosity and creativity",
      text: "Can your child ask questions, experiment, invent games, and create things without a template?",
      options: opts(
        "There's regularly time and materials for that.",
        "Sometimes, but the child mostly follows a set example.",
        "Questions and experiments often disrupt the established routine.",
        "The child's main job is to correctly follow adult instructions."
      ),
    },
    {
      title: "Attitude toward mistakes",
      text: "How do you react when your child makes a mistake or can't complete a task right away?",
      options: opts(
        "We support the attempt, help find another way, and note the progress.",
        "We explain the mistake first, then help.",
        "We often correct them or show the right answer.",
        "We compare them to others, criticize, or stop the activity."
      ),
    },
    {
      title: "Workload balance",
      text: "Is there enough time left for sleep, movement, free play, family time, and rest without organized activities?",
      options: opts(
        "It's a fixed part of the schedule.",
        "Usually yes, but the child is overloaded on some days.",
        "There's little free time because of preschool, prep classes, and clubs.",
        "Almost all of the time is organized by adults."
      ),
    },
  ],
  "7-10": [
    {
      title: "Emotions and adjusting to school",
      text: "Do you talk not only about grades, but also about your child's mood, relationships, struggles, and feelings related to school?",
      options: opts(
        "We regularly talk about it and look for solutions together.",
        "We talk about it when a noticeable problem comes up.",
        "We mostly talk about grades and behavior.",
        "We think the child should handle it on their own."
      ),
    },
    {
      title: "Learning how to learn",
      text: "Do you help your child define the goal of a learning task, break the work into steps, and check the result?",
      options: opts(
        "We teach these skills, gradually handing over responsibility.",
        "We help plan, but often supervise every step.",
        "We mostly just remind them what and when to do.",
        "We either do part of the work for the child or leave them without support."
      ),
    },
    {
      title: "Applying knowledge",
      text: "Is learning connected to shopping, measuring, reading instructions, observations, experiments, and family projects?",
      options: opts(
        "We regularly show where knowledge applies in real life.",
        "Sometimes, when a fitting situation comes up.",
        "Learning is mostly limited to textbooks and homework.",
        "Grades and correct answers are what matter most to us."
      ),
    },
    {
      title: "Independence and responsibility",
      text: "Are there steady, age-appropriate responsibilities and a chance to own part of the schedule, belongings, and schoolwork?",
      options: opts(
        "Their area of responsibility is clear and gradually growing.",
        "There are responsibilities, but they need constant reminders.",
        "Responsibilities show up only occasionally.",
        "Adults control and organize almost everything."
      ),
    },
    {
      title: "Interests and curiosity",
      text: "Do you factor in your child's interests when choosing books, clubs, projects, and extracurriculars?",
      options: opts(
        "The child takes part in choosing and can try different directions.",
        "We factor in interests when they match what we see as useful.",
        "Adults mostly choose the activities.",
        "The child must attend the chosen activities regardless of interest or mood."
      ),
    },
    {
      title: "Mistakes and persistence",
      text: "Is your child developing an understanding that abilities grow and a mistake helps point to the next step?",
      options: opts(
        "We discuss strategies, effort, and progress.",
        "We're supportive, though we sometimes emphasize the outcome.",
        "We often correct mistakes and stress the wrong answer.",
        "We use criticism, punishment, comparison, or shame."
      ),
    },
    {
      title: "Balance and health",
      text: "Is the schedule balanced across school, clubs, sleep, movement, social time, and free time?",
      options: opts(
        "We watch how they're doing and reduce the load when needed.",
        "Generally yes, but tiredness comes up now and then.",
        "The child is often tired, but we try to keep all the activities anyway.",
        "Results and discipline matter more than tiredness or reluctance."
      ),
    },
  ],
  "11-14": [
    {
      title: "Self-understanding",
      text: "Do you help your teen understand their strengths, interests, values, emotions, and individual traits?",
      options: opts(
        "We talk about it regularly, without judging or pushing our own conclusions.",
        "We talk about it, but sometimes try to convince them of our view.",
        "We more often point out flaws and things to improve.",
        "We consider these conversations unnecessary or unserious."
      ),
    },
    {
      title: "Involvement in decisions",
      text: "Does your teen take part in choosing clubs, extracurriculars, learning goals, and priorities?",
      options: opts(
        "Decisions are made together; the teen's opinion carries real weight.",
        "They can speak up, but adults usually make the final call.",
        "The teen's choice is rarely taken into account.",
        "Adults set the whole path."
      ),
    },
    {
      title: "Self-organization",
      text: "Is your teen learning to plan schoolwork, manage time, and evaluate results?",
      options: opts(
        "Responsibility is gradually being handed over to the teen.",
        "They plan on their own, but need frequent reminders.",
        "Adults mostly control the schedule and task completion.",
        "Adults either do everything for them or step away entirely."
      ),
    },
    {
      title: "Critical thinking and media literacy",
      text: "Do you talk about fact-checking, telling facts from opinions, manipulation, and staying safe online?",
      options: opts(
        "We regularly walk through real-life examples.",
        "We talk about it sometimes, mostly after a problem comes up.",
        "We mostly set bans and restrictions.",
        "We're barely involved in the teen's digital life."
      ),
    },
    {
      title: "Applying knowledge in practice",
      text: "Are there projects or real-life tasks where the teen applies knowledge, works in a team, investigates, and produces a result?",
      options: opts(
        "That kind of experience comes up regularly.",
        "They occasionally take part in school or adult-led projects.",
        "Learning is mostly focused on memorization.",
        "Grades are treated as the only meaningful outcome."
      ),
    },
    {
      title: "Mistakes and setbacks",
      text: "What happens when your teen makes a mistake, gets a low grade, or wants to quit an activity?",
      options: opts(
        "We figure out the reasons, discuss the experience, and choose the next step together.",
        "We're supportive, but insist on the original plan.",
        "We increase control, pressure, or the number of activities.",
        "We criticize, compare, or take away things that matter to them."
      ),
    },
    {
      title: "Workload and well-being",
      text: "Do you factor in your teen's sleep, health, relationships, rest, and emotional state?",
      options: opts(
        "Priorities are regularly reviewed together with the teen.",
        "We factor it in, but schoolwork takes priority during busy periods.",
        "There are signs of overload, but the activities continue anyway.",
        "We treat tiredness and pushback as laziness."
      ),
    },
  ],
  "15-18": [
    {
      title: "Educational goals",
      text: "Does your teen have their own sense of why they're studying and what opportunities they want to gain?",
      options: opts(
        "They set the goals themselves; adults help refine them.",
        "Goals are discussed, but mostly proposed by adults.",
        "The main goal is exams or getting into whatever the parents chose.",
        "Goals aren't discussed; the teen just meets the requirements."
      ),
    },
    {
      title: "Choosing a path forward",
      text: "Does your teen explore careers and educational routes through meetings, projects, internships, courses, or independent research?",
      options: opts(
        "They compare options and get hands-on experience.",
        "They look into a few options, but still fairly superficially.",
        "The choice is mostly based on prestige, income, or what adults think.",
        "There's no exploration of options yet."
      ),
    },
    {
      title: "Independence and responsibility",
      text: "Does your teen manage their own schedule, deadlines, preparation, and commitments?",
      options: opts(
        "Mostly independently, reaching out for help when needed.",
        "Independently, but needs regular reminders.",
        "Adults constantly check in and organize things.",
        "Adults either fully run the process or have no idea what's going on."
      ),
    },
    {
      title: "Critical thinking",
      text: "Can your teen compare sources, check evidence, argue a position, and revise their opinion?",
      options: opts(
        "They regularly apply this in school and in life.",
        "They can do it, but apply it inconsistently.",
        "They more often adopt ready-made opinions from authorities or popular sources.",
        "Fact-checking and argumentation are barely developing."
      ),
    },
    {
      title: "Practical skills",
      text: "Does your teen gain experience through projects, volunteering, internships, organizing events, research, or creative work?",
      options: opts(
        "There are regularly practical tasks with a tangible result of their own.",
        "That kind of experience has come up a few times.",
        "Almost all of their experience is limited to school and exams.",
        "Practical tasks are seen as a distraction from studying."
      ),
    },
    {
      title: "Setbacks and changing course",
      text: "Can your teen analyze a mistake, ask for help, change strategy, and keep going?",
      options: opts(
        "Adults support their analysis and let them choose their own solution.",
        "Usually yes, but they need active help.",
        "A setback leads to giving up, conflict, or tighter control.",
        "Mistakes are seen as proof they lack ability."
      ),
    },
    {
      title: "Balance and well-being",
      text: "Is there a balance between studying, exams, sleep, health, relationships, rest, and personal interests?",
      options: opts(
        "The workload is reviewed whenever signs of overload appear.",
        "Balance sometimes slips, but it's restored afterward.",
        "The teen is regularly sleep-deprived, anxious, or skips rest.",
        "Overload is seen as a necessary price for future success."
      ),
    },
  ],
};

// Overall result by total score (0–21).
export const LEVELS = [
  {
    min: 17,
    max: 21,
    title: "A well-rounded educational strategy",
    text: "The strategy fits the child's age and covers more than just knowledge — emotional development, independence, thinking, character, and health too. You don't need to add new activities. Look at where you picked answer \"B\": those areas can become a bit more consistent.",
  },
  {
    min: 12,
    max: 16,
    title: "A solid foundation with a few gaps",
    text: "There's already a useful learning environment in place, but some parts happen more by chance than by design. There may be a tilt toward academic results, control, or activities chosen by adults. Pick the two lowest-scoring questions as your priorities for the next 2–3 months.",
  },
  {
    min: 7,
    max: 11,
    title: "A fragmented strategy",
    text: "There are useful individual efforts, but they haven't come together into a system yet. Don't add more activities. Start by identifying your child's interests, their real struggles, and the two most important areas right now.",
  },
  {
    min: 0,
    max: 6,
    title: "Time to rebuild the strategy",
    text: "The current path doesn't yet account enough for the child's age, individuality, or state. Start with observation, easing the workload, and picking 2–3 realistic priorities. This result doesn't mean your child is developing poorly or that you're doing everything wrong.",
  },
];

// Thematic notes — the same wording applies to a given question number
// regardless of the age group.
export const THEMATIC_NOTES = [
  "The emotional side and self-understanding aren't sufficiently part of the strategy yet.",
  "Your child may be missing social time, the right to choose, or a voice in educational decisions.",
  "Independence is either not being handed over yet, or is expected without the support needed to build it.",
  "Knowledge and literacies may be developing on the surface, without analysis, media literacy, or real application.",
  "There's little room for interests, creativity, projects, or a result the child can call their own.",
  "Mistakes may be treated as failure rather than as feedback and a next step.",
  "There's a risk of overload, lower motivation, and a decline in emotional well-being.",
];

export const WORKLOAD_WARNING =
  "The first recommendation is to review the workload and restore sleep, rest, and free time.";

export const PRIORITY_RULE_NOTE =
  "Priority rule: if any question was answered with option \"D\", that area is included in the recommendations regardless of the total score.";

export const REFLECTION_QUESTIONS = [
  "Which two areas matter most for your child right now?",
  "Which current activities are actually helping develop those areas?",
  "What could you drop, simplify, or move to protect interest, free time, and emotional well-being?",
];

export const DISCLAIMER =
  "This quiz is meant for parental self-reflection and planning. It is not a psychological, medical, or educational diagnostic tool, is not used to make diagnoses, and is not intended to compare children with one another.";
