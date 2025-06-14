// Blog utilities for loading and parsing markdown posts
import { format } from "date-fns";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  readTime: string;
  content: string;
  formattedDate: string;
}

// Static blog posts - in a real app, these would be loaded from markdown files
const blogPosts: Record<string, BlogPost> = {
  "what-is-ffmi-and-why-it-matters": {
    slug: "what-is-ffmi-and-why-it-matters",
    title: "What is FFMI and Why It Matters More Than Body Weight",
    date: "2025-01-15",
    author: "Tim White",
    tags: ["FFMI", "Body Composition", "Muscle Building", "Science"],
    excerpt: "FFMI (Fat-Free Mass Index) is the most accurate way to track muscle building progress. Unlike body weight or BMI, FFMI tells you exactly how much muscle you're gaining relative to your height.",
    readTime: "5 min read",
    formattedDate: "January 15, 2025",
    content: `# What is FFMI and Why It Matters More Than Body Weight

If you're serious about building muscle, you need to stop obsessing over body weight and start tracking FFMI. Here's why this metric changes everything.

## What is FFMI?

FFMI stands for **Fat-Free Mass Index**. It's calculated by taking your lean body mass (total weight minus fat mass) and normalizing it for height, similar to how BMI works but far more useful.

**The Formula:**
\`\`\`
FFMI = (Weight × (100 - Body Fat %)) / (Height in meters)²
\`\`\`

For example: A 180 lb man at 6'0" with 12% body fat:
- Lean mass: 180 × 0.88 = 158.4 lbs (71.8 kg)
- Height: 1.83 meters
- FFMI: 71.8 / (1.83)² = **21.4**

## Why FFMI Beats Every Other Metric

### 1. **Shows Actual Muscle Gains**
Body weight can fluctuate 2-5 lbs daily from water, food, and waste. FFMI cuts through the noise to show true muscle development.

### 2. **Accounts for Height Differences**  
A 200 lb muscular guy at 6'4" isn't the same as 200 lbs at 5'8". FFMI makes fair comparisons possible.

### 3. **Reveals Genetic Potential**
Research shows natural lifters rarely exceed FFMI of 25, while enhanced athletes can reach 26-30+. This helps set realistic expectations.

### 4. **Better Than BMI**
BMI calls muscular athletes "obese." FFMI actually measures what matters—lean tissue, not just total weight.

## FFMI Ranges: What's Your Level?

| FFMI Range | Classification | Description |
|------------|---------------|-------------|
| 16-17 | Untrained | Average sedentary person |
| 18-20 | Trained | Regular gym-goer, some muscle |
| 21-23 | Very Muscular | Serious lifter, impressive physique |
| 24-25 | Exceptional | Elite natural bodybuilder level |
| 26+ | Likely Enhanced | Beyond natural genetic limits |

## Why Most People Get This Wrong

**Mistake #1: Chasing Scale Weight**
"I gained 10 lbs!" could mean 2 lbs muscle and 8 lbs fat. FFMI would show you're moving backward.

**Mistake #2: Ignoring Body Fat**
You can't calculate FFMI without accurate body fat percentage. This is why LogYourBody includes multiple measurement methods (Navy, 3-site, 7-site calipers).

**Mistake #3: Short-Term Thinking**
FFMI changes slowly. A gain of 0.5-1.0 FFMI points per year is excellent progress for natural lifters.

## How to Use FFMI in Your Training

### Set Realistic Goals
- **Beginner**: Target FFMI 18-19 in your first year
- **Intermediate**: Aim for FFMI 20-22 over 2-3 years  
- **Advanced**: Push toward FFMI 23-25 over many years

### Track True Progress
Monitor FFMI monthly, not daily. Look for trends over 3-6 month periods. A consistent upward trend means you're building muscle efficiently.

### Adjust Your Approach
- **FFMI going up, weight stable**: Perfect recomposition
- **FFMI flat, weight increasing**: You're gaining mostly fat
- **FFMI declining**: You're losing muscle (cut too aggressive?)

## The Science Behind FFMI

Research by Kouri et al. (1995) analyzed 157 natural bodybuilders and found:
- Average FFMI: 22.8 ± 1.8
- Maximum natural FFMI: 25.0
- 95% of natural athletes under FFMI 23

This landmark study established FFMI as the gold standard for assessing muscular development potential.

## FFMI vs. Other Metrics

| Metric | Pros | Cons |
|--------|------|------|
| **Body Weight** | Easy to track | Doesn't distinguish muscle from fat |
| **BMI** | Standardized | Useless for muscular individuals |
| **Body Fat %** | Shows fat loss | Doesn't show muscle gains |
| **FFMI** | Shows actual muscle, height-adjusted | Requires accurate body fat measurement |

## Getting Started with FFMI

1. **Get accurate body fat measurements** using calipers or DEXA
2. **Calculate your baseline FFMI** 
3. **Track monthly** with consistent measurement conditions
4. **Focus on the trend**, not daily fluctuations
5. **Set realistic annual goals** (0.5-1.0 FFMI increase)

## The Bottom Line

FFMI is the most honest metric for muscle building progress. It tells you exactly what's happening to your physique, cuts through scale weight confusion, and helps set realistic expectations.

Your scale might lie. Your mirror might deceive you. But FFMI tells the truth about muscle development.

**Ready to start tracking FFMI?** LogYourBody calculates it automatically from your body fat measurements and shows your genetic potential on an easy-to-read scale.

---

*Tim White is the founder of LogYourBody and has been tracking body composition metrics for over a decade. He believes in science-based approaches to fitness that focus on what actually matters.*`
  },
  "walking-steps-neat-fitness-efficiency": {
    slug: "walking-steps-neat-fitness-efficiency",
    title: "Why Walking Beats HIIT for Fat Loss: The Science of NEAT and Area Under the Curve",
    date: "2025-01-14",
    author: "Tim White",
    tags: ["Walking", "NEAT", "Fat Loss", "Step Count", "Cardio"],
    excerpt: "Walking has the largest area under the curve for calorie burn with the least fatigue. Here's why step count matters more than intense workouts for sustainable fat loss.",
    readTime: "6 min read",
    formattedDate: "January 14, 2025",
    content: `# Why Walking Beats HIIT for Fat Loss: The Science of NEAT and Area Under the Curve

Forget brutal HIIT sessions and exhausting spin classes. The most effective fat loss tool is already in your pocket: your step counter.

## The Area Under the Curve Principle

When it comes to calorie burn, what matters isn't peak intensity—it's **total energy expenditure over time**. This is where the "area under the curve" concept becomes crucial.

Imagine graphing your calorie burn throughout the day:
- **HIIT**: High peak, narrow width, lots of recovery time
- **Walking**: Moderate height, massive width, minimal recovery needed

The math is clear: walking wins on total daily energy expenditure.

## What is NEAT?

**NEAT (Non-Exercise Activity Thermogenesis)** is the energy you burn from all movement that isn't formal exercise—walking to your car, fidgeting, maintaining posture, taking the stairs.

NEAT can vary by up to **2,000 calories per day** between individuals. This explains why some people seem to eat anything without gaining weight while others struggle despite "perfect" diets.

### The NEAT Hierarchy:
1. **Structured Exercise**: 15-30% of NEAT
2. **Daily Living Activities**: 50-70% of NEAT  
3. **Fidgeting & Spontaneous Movement**: 15-20% of NEAT

Walking dominates category #2, making it the biggest lever you can pull for increasing daily energy expenditure.

## Why Steps Beat Intensity

### 1. **Sustainable Frequency**
- **Walking**: Can be done daily, multiple times per day
- **HIIT**: Requires 48-72 hours recovery between sessions

### 2. **Minimal Fatigue**
- **Walking**: Doesn't impair subsequent activities
- **High-intensity exercise**: Creates systemic fatigue, reduces NEAT for hours

### 3. **Adherence**
- **Walking**: 85%+ long-term adherence rates
- **Intense exercise programs**: 40-60% dropout rates within 6 months

### 4. **Fat Oxidation Zone**
- **Walking**: Burns primarily fat (60-85% fat oxidation rate)
- **High-intensity**: Burns primarily glucose, takes hours to return to fat burning

## The Step Count Sweet Spot

Research shows diminishing returns on step count:

| Daily Steps | Health Benefits | Fat Loss Benefits | Sustainability |
|-------------|----------------|-------------------|----------------|
| 0-3,000 | Poor | Minimal | Easy |
| 3,000-7,000 | Moderate | Good | Easy |
| 7,000-10,000 | Good | Excellent | Moderate |
| 10,000-15,000 | Excellent | Excellent | Moderate |
| 15,000+ | Excellent | Plateau | Difficult |

**The sweet spot: 8,000-12,000 steps daily**

This range maximizes fat loss benefits while remaining sustainable for most people with busy lifestyles.

## Walking vs. Formal Exercise: The Numbers

Let's compare a typical person's daily energy expenditure:

### Scenario A: HIIT Enthusiast
- 45-minute HIIT session: 400 calories
- Reduced activity rest of day (fatigue): -200 calories
- **Net benefit**: +200 calories

### Scenario B: Step Counter
- 10,000 steps (5 miles): 350-500 calories
- No reduction in other activities: 0 calories lost
- Additional NEAT from being more active: +100 calories
- **Net benefit**: +450-600 calories

The walker burns **2-3x more calories** despite lower exercise intensity.

## The Fatigue Factor

High-intensity exercise creates multiple types of fatigue:

1. **Muscular Fatigue**: Reduced movement quality and quantity
2. **Metabolic Fatigue**: Impaired fat oxidation for 2-6 hours
3. **Neural Fatigue**: Decreased motivation for spontaneous movement
4. **Hormonal Fatigue**: Elevated cortisol, reduced recovery capacity

Walking creates none of these issues. In fact, walking often **increases** energy levels and motivation for other activities.

## NEAT Hacks: Beyond Step Count

### Maximize Your Daily Movement:
- **Stand during phone calls**: +50 calories/hour vs. sitting
- **Take stairs when possible**: 10 calories per flight
- **Park farther away**: Extra 500-1000 steps
- **Walking meetings**: Combine productivity with movement
- **Set hourly movement alarms**: Break up sedentary time

### The Compound Effect:
Small increases in NEAT compound dramatically:
- +2,000 steps daily = +100 calories
- Over one year = +36,500 calories
- **Fat loss equivalent: 10+ pounds**

## The Science: Why Walking Works

### 1. **Fat Oxidation Rate**
At walking pace (50-65% max heart rate), your body burns:
- **85% fat, 15% carbohydrates**

At high intensity (80%+ max heart rate):
- **15% fat, 85% carbohydrates**

### 2. **Metabolic Flexibility**
Regular walking improves your body's ability to switch between fuel sources, making you a more efficient fat burner 24/7.

### 3. **Stress Response**
Walking decreases cortisol levels, while intense exercise can increase them. Lower stress = better fat loss.

### 4. **Recovery Cost**
Walking requires no recovery. High-intensity exercise can suppress metabolism for 6-24 hours post-exercise.

## Common Objections (And Why They're Wrong)

### "But I don't have time for 10,000 steps!"
- 10,000 steps = ~90 minutes of walking
- Break it into 15-20 minute chunks throughout the day
- Walk during commute, lunch, phone calls, TV watching

### "Walking is too boring!"
- Listen to podcasts, audiobooks, music
- Walk with friends or family
- Explore new neighborhoods
- Walking meetings for work calls

### "I need intense exercise for fitness!"
- Walking improves cardiovascular health
- Add 2-3 strength training sessions for muscle
- Walking enhances recovery from intense exercise

## Practical Implementation

### Week 1: Baseline
- Track current daily steps without changes
- Identify natural walking opportunities
- Set hourly movement reminders

### Week 2-4: Gradual Increase
- Add 1,000 steps weekly until reaching target
- Focus on consistency over peak days
- Find enjoyable walking routes/activities

### Week 5+: Optimization
- Maintain 8,000-12,000 daily steps
- Add inclines or stairs for variety
- Track correlation with energy and mood

## The LogYourBody Advantage

Walking data from fitness trackers integrates seamlessly with body composition tracking:
- **Daily step count**: Monitor NEAT consistency
- **Weekly trends**: Identify patterns affecting fat loss
- **Correlation analysis**: See how steps impact body composition changes
- **Goal setting**: Customize targets based on lifestyle

## The Bottom Line

High-intensity exercise gets the headlines, but walking gets the results. The largest area under the curve wins the fat loss game.

**The numbers don't lie:**
- Walking is more sustainable (85% vs. 50% adherence)
- Higher total daily energy expenditure
- Better fat oxidation rates
- Zero recovery cost
- Massive NEAT benefits

Stop chasing perfect workouts. Start chasing daily step counts.

Your body composition will thank you, your joints will thank you, and your schedule will thank you.

**Ready to start tracking?** LogYourBody syncs with Apple Health and Google Fit to automatically track your daily steps alongside body composition changes. See how walking transforms your physique over time.

---

*Tim White founded LogYourBody after discovering that consistent walking habits contributed more to his physique than years of intense gym sessions. He now walks 12,000+ steps daily while running a tech company.*`
  },
  "ice-baths-hypertrophy-recovery-truth": {
    slug: "ice-baths-hypertrophy-recovery-truth",
    title: "Ice Baths Are Sabotaging Your Muscle Gains: The Cold Truth About Recovery",
    date: "2025-01-13",
    author: "Tim White",
    tags: ["Ice Baths", "Hypertrophy", "Recovery", "Muscle Building", "Cold Therapy"],
    excerpt: "Ice baths might feel good, but they're destroying your muscle building progress. Here's the science on why cold therapy should be avoided unless you're a pro athlete.",
    readTime: "7 min read",
    formattedDate: "January 13, 2025",
    content: `# Ice Baths Are Sabotaging Your Muscle Gains: The Cold Truth About Recovery

Ice baths are everywhere. Social media influencers swear by them. Gyms are installing cold plunge pools. But if your goal is building muscle, ice baths are working against you.

Here's the science on why cold therapy kills hypertrophy—and who should actually use it.

## The Muscle Building Process

To understand why ice baths hurt muscle growth, you need to understand how muscles actually grow:

### 1. **Mechanical Tension**
Weight training creates microscopic damage to muscle fibers.

### 2. **Inflammatory Response**
Your body triggers inflammation to repair and rebuild damaged tissue.

### 3. **Protein Synthesis**
Inflammatory signals activate satellite cells to build new muscle protein.

### 4. **Adaptation**
Muscles grow back bigger and stronger than before.

**Ice baths disrupt steps 2 and 3.**

## The Cold Hard Science

### Study 1: Fyfe et al. (2019)
- **Participants**: 21 physically active men
- **Protocol**: 12 weeks strength training + cycling
- **Ice bath group**: 10°C for 10 minutes post-exercise
- **Results**: Ice bath group had **65% less muscle growth**

### Study 2: Roberts et al. (2015)
- **Participants**: 21 recreationally active men  
- **Protocol**: 12 weeks strength training
- **Ice bath group**: 10°C for 10 minutes post-exercise
- **Results**: Ice bath group showed **blunted hypertrophy** and strength gains

### Study 3: Peake et al. (2017)
- **Review**: Meta-analysis of cold therapy and adaptation
- **Findings**: Cold therapy "may attenuate long-term training adaptations"

The evidence is overwhelming: **ice baths reduce muscle building by 30-65%.**

## Why Ice Baths Kill Muscle Growth

### 1. **Suppressed Inflammation**
Inflammation gets a bad rap, but it's essential for muscle growth. The inflammatory response triggers:
- Satellite cell activation
- Growth factor release
- Protein synthesis signaling
- Angiogenesis (new blood vessel formation)

Ice baths suppress this entire cascade.

### 2. **Reduced Blood Flow**
Cold therapy causes vasoconstriction, reducing blood flow to muscles when they need nutrients most. Less blood flow means:
- Reduced nutrient delivery
- Impaired waste removal
- Slower recovery processes
- Decreased growth factor transport

### 3. **Blunted Protein Synthesis**
Studies show ice baths reduce muscle protein synthesis by up to 50% for 24-48 hours post-exercise. This is the exact window when muscle growth occurs.

### 4. **Hormonal Disruption**
Cold exposure alters the release of growth-promoting hormones:
- **IGF-1**: Reduced by 20-30%
- **VEGF**: Suppressed angiogenesis
- **Heat shock proteins**: Blunted adaptive response

## The Marketing vs. Reality

### What Ice Bath Companies Claim:
- "Faster recovery"
- "Reduced muscle soreness"  
- "Enhanced performance"
- "Accelerated adaptation"

### What Science Shows:
- **Faster recovery**: Only for specific types of fatigue, not muscle building
- **Reduced soreness**: True, but soreness doesn't impair training
- **Enhanced performance**: Only acutely, not long-term adaptations
- **Accelerated adaptation**: Opposite—adaptations are blunted

## When Ice Baths Actually Make Sense

Ice baths aren't universally bad. They have specific, narrow use cases:

### 1. **Professional Athletes in Competition**
- **Multiple games per week** (NBA, NHL playoffs)
- **Tournament play** with minimal recovery time
- **Priority**: Performance maintenance over adaptation

### 2. **Acute Injury Management**
- **First 24-48 hours** after acute injury
- **Reduces swelling** and secondary tissue damage
- **Not for muscle building**, but injury containment

### 3. **Heat Illness Prevention**
- **Environmental heat stress** situations
- **Core temperature management**
- **Safety priority** over adaptation

### 4. **Multi-Session Training Days**
- **Morning and evening sessions**
- **Between-session recovery** only
- **Remove cold exposure** 6+ hours before next training

## Better Recovery Strategies

Instead of ice baths, focus on recovery methods that actually enhance muscle growth:

### 1. **Sleep Optimization**
- **7-9 hours nightly**
- **80%+ of growth hormone** released during deep sleep
- **Most important recovery factor**

### 2. **Proper Nutrition**
- **Protein timing**: 25-40g within 2 hours post-workout
- **Carbohydrate replenishment**: 1-1.5g per kg body weight
- **Hydration**: Replace fluid losses completely

### 3. **Light Movement**
- **10-20 minute walks**
- **Gentle stretching**
- **Promotes blood flow** without suppressing inflammation

### 4. **Heat Therapy**
- **Sauna sessions**: 15-20 minutes at 80-100°C
- **Hot baths**: 40-42°C for 10-15 minutes
- **Enhances protein synthesis** and blood flow

### 5. **Stress Management**
- **Meditation or breathing exercises**
- **Lower cortisol levels**
- **Better sleep quality**

## The Dose-Response Problem

Even if you ignore the muscle building research, ice bath protocols are all over the map:

| Source | Temperature | Duration | Frequency |
|--------|-------------|----------|-----------|
| "Influencer A" | 10-15°C | 3-5 min | Daily |
| "Expert B" | 3-10°C | 10-15 min | Post-workout |
| "Protocol C" | 10-20°C | 2-20 min | As needed |

**There's no standardized protocol** because the research doesn't support consistent use for most people.

## The Psychology Factor

Ice baths feel like they're working because:

### 1. **Acute Relief**
Numb tissue feels less sore immediately. This masks symptoms without addressing root causes.

### 2. **Mental Toughness**
Enduring discomfort feels productive. But suffering ≠ progress.

### 3. **Ritual Effect**
Having a post-workout routine feels important. The ritual matters more than the ice.

### 4. **Placebo Response**
Believing in recovery methods can improve perceived recovery, even when objective measures don't support it.

## Special Considerations

### For Endurance Athletes:
Ice baths may help with heat dissipation and repeated performance without major hypertrophy concerns. But even here, evidence is mixed.

### For Powerlifters/Strength Athletes:
Cold therapy may help nervous system recovery between max effort sessions when adaptation isn't the primary goal.

### For Recreational Lifters:
**Almost never appropriate.** Your goal is adaptation, not immediate performance recovery.

## The Bottom Line

Ice baths are a tool designed for professional athletes who need to perform repeatedly with minimal recovery time. They prioritize immediate performance over long-term adaptation.

**For 95% of people training for muscle growth:**
- Ice baths reduce muscle building by 30-65%
- They don't improve long-term performance
- Better recovery methods exist
- The risks outweigh any benefits

**If you're not a professional athlete with multiple games per week, skip the ice bath.**

Focus on sleep, nutrition, and stress management instead. Your muscles will thank you.

## The Real Recovery Stack

1. **Sleep**: 7-9 hours nightly (non-negotiable)
2. **Nutrition**: Adequate protein and carbs post-workout
3. **Hydration**: Replace fluid losses completely
4. **Light movement**: 10-20 minutes daily
5. **Stress management**: Meditation, breathing, relaxation
6. **Heat therapy**: Sauna or hot bath (optional)

Save the ice baths for after you win your championship. Until then, let your muscles do what they're designed to do: adapt and grow.

**Ready to track real recovery?** LogYourBody helps you monitor how different recovery strategies affect your body composition progress. See which methods actually improve your muscle building over time.

---

*Tim White spent years using ice baths religiously until discovering they were hindering his muscle building progress. He now focuses on evidence-based recovery methods and has seen better results than ever.*`
  }
};

export const getAllPosts = (): BlogPost[] => {
  return Object.values(blogPosts).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getPostBySlug = (slug: string): BlogPost | null => {
  return blogPosts[slug] || null;
};

export const getPostsByTag = (tag: string): BlogPost[] => {
  return getAllPosts().filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  Object.values(blogPosts).forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};