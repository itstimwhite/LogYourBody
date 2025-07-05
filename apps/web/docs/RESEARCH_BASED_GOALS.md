# Research-Based Body Composition Goals

## Overview

LogYourBody uses evidence-based research to set default body composition goals that represent optimal health and attractiveness based on scientific studies. These defaults are automatically applied when users create their profiles.

## Default Goal Metrics

### Body Fat Percentage
- **Males**: 10-12% (Default: 11%)
- **Females**: 18-22% (Default: 20%)
- **Sources**: Dixson 2010, Tovée 2002, Singh 1993

### Fat-Free Mass Index (FFMI)
- **Males**: ~22
- **Females**: Not commonly studied (no default set)
- **Sources**: Kouri 1995, Tovée 1999

### Waist-to-Hip Ratio (WHR)
- **Males**: ~0.9 (lower is better)
- **Females**: 0.7
- **Sources**: Singh 1993, Tovée 1999

### Waist-to-Height Ratio (WHtR)
- **Males**: 0.45-0.50 (Default: 0.475)
- **Females**: 0.42-0.48 (Default: 0.45)
- **Sources**: Brooks 2010, Singh 2002

## Research Highlights

### Body Fat Percentage
Studies consistently show that moderate body fat levels are perceived as most attractive and healthiest:
- Men with 10-12% body fat show visible abdominal definition without appearing gaunt
- Women at 18-22% body fat maintain hormonal health while displaying athletic physique

### FFMI (Fat-Free Mass Index)
- Natural male athletes typically cap around FFMI 25
- FFMI 22 represents a well-muscled but attainable physique for most men
- Female FFMI norms are less studied but generally lower due to biological differences

### Waist-to-Hip Ratio
- WHR is a strong predictor of health and attractiveness across cultures
- Female WHR of 0.7 is universally rated as most attractive
- Male WHR below 0.9 indicates healthy fat distribution

### Waist-to-Height Ratio
- Simple metric that predicts health risks
- "Keep your waist less than half your height"
- Strong correlation with cardiovascular health

## Implementation

### Automatic Goal Setting
When a user creates a profile and selects their gender, the system automatically sets research-based goals:

```sql
-- Males get:
goal_body_fat_percentage = 11.0
goal_ffmi = 22.0
goal_waist_to_hip_ratio = 0.9
goal_waist_to_height_ratio = 0.475

-- Females get:
goal_body_fat_percentage = 20.0
goal_ffmi = NULL (not studied)
goal_waist_to_hip_ratio = 0.7
goal_waist_to_height_ratio = 0.45
```

### Customization
Users can modify these goals in their settings to match personal preferences or medical recommendations.

## References

1. Dixson, B. J., Dixson, A. F., Li, B., & Anderson, M. J. (2010). Studies of human physique and sexual attractiveness: Sexual preferences of men and women in China. American Journal of Human Biology, 22(1), 131-135.

2. Tovée, M. J., Maisey, D. S., Emery, J. L., & Cornelissen, P. L. (1999). Visual cues to female physical attractiveness. Proceedings of the Royal Society B, 266(1415), 211-218.

3. Singh, D. (1993). Adaptive significance of female physical attractiveness: Role of waist-to-hip ratio. Journal of Personality and Social Psychology, 65(2), 293-307.

4. Kouri, E. M., Pope Jr, H. G., Katz, D. L., & Oliva, P. (1995). Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clinical Journal of Sport Medicine, 5(4), 223-228.

5. Brooks, R., Shelly, J. P., Fan, J., Zhai, L., & Chau, D. K. (2010). Much more than a ratio: Multivariate selection on female bodies. Journal of Evolutionary Biology, 23(10), 2238-2248.