# Typography Style Guide

This guide documents the typography standards for our website based on the Figma design specifications. It provides a comprehensive reference for all text styles, sizes, weights, and usage patterns.

## Font Family

**Manrope** is our primary font family for all text elements.

```css
font-family: 'Manrope', sans-serif;
```

## Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary | `#121737` | Main text color, headings |
| Secondary | `#595D73` | Secondary text, captions |
| Accent | `#2E5CE5` | Accent text, links, buttons |
| Light Gray | `#A0A2AF` | Tertiary text, metadata |
| Light Background | `#EBF3FF` | Light panels, backgrounds |
| White | `#FFFFFF` | Text on dark backgrounds |
| Light Accent | `#A3B7EB` | Border colors, dividers |

## Font Weights

| Weight Name | Value | Usage |
|-------------|-------|-------|
| Light | 300 | Footer text, disclaimers |
| Regular | 400 | Body text, paragraphs |
| Medium | 500 | Emphasized text, intros |
| Semibold | 600 | Subheadings, controls |
| Bold | 700 | Navigation, buttons, section titles |
| Extrabold | 800 | Main headings, page titles |

## Heading Styles

### H1 (Page Title)
- **Size**: 40px
- **Weight**: 800 (Extrabold)
- **Line Height**: 1.3
- **Example**: Main page titles, hero headlines
- **Used For**: Primary headlines, landing page titles
- **Mobile Size**: 32px

### H2 (Section Title)
- **Size**: 30px
- **Weight**: 800 (Extrabold)
- **Line Height**: 1.4
- **Example**: "Who is the Most Followed Person on Social Media?"
- **Used For**: Main section headings, article titles
- **Mobile Size**: 26px

### H3 (Subsection Title)
- **Size**: 24px
- **Weight**: 800 (Extrabold)
- **Line Height**: 1.4
- **Example**: CTA titles, important callouts
- **Used For**: Subsection headings, feature titles
- **Mobile Size**: 22px

### H4 (Group Title)
- **Size**: 20px
- **Weight**: 800 (Extrabold)
- **Line Height**: 1.4
- **Example**: "How does SEO work?"
- **Used For**: Card titles, group headings
- **Mobile Size**: 18px

### H5 (Component Title)
- **Size**: 18px
- **Weight**: 800 (Extrabold)
- **Line Height**: 1.4
- **Example**: Article card titles, sidebar headings
- **Used For**: Component headings, related content
- **Mobile Size**: 16px

### H6 (Minor Title)
- **Size**: 16px
- **Weight**: 700 (Bold)
- **Line Height**: 1.6
- **Example**: "Share", "Newsletter Signup"
- **Used For**: Minor headings, widget titles
- **Mobile Size**: 15px

## Body Text

### Large Body Text
- **Size**: 18px
- **Weight**: 400 (Regular)
- **Line Height**: 1.8
- **Example**: Article introductions, featured content
- **Used For**: Main content for important sections
- **Mobile Size**: 16px

### Medium Body Text
- **Size**: 16px
- **Weight**: 400 (Regular)
- **Line Height**: 1.8
- **Example**: Standard paragraphs
- **Used For**: Default body copy, general content
- **Mobile Size**: 16px (unchanged)

### Small Body Text
- **Size**: 14px
- **Weight**: 400 (Regular)
- **Line Height**: 1.5
- **Example**: Featured snippet descriptions, card descriptions
- **Used For**: Secondary content, summaries, descriptions
- **Mobile Size**: 14px (unchanged)

### Extra Small Text
- **Size**: 13px
- **Weight**: 400 (Regular)
- **Line Height**: 1.6
- **Example**: Breadcrumbs, labels, footer links
- **Used For**: UI elements, metadata, tertiary content
- **Mobile Size**: 13px (unchanged)

### Extra Extra Small Text
- **Size**: 12px
- **Weight**: 400 (Regular)
- **Line Height**: 1.67
- **Example**: Disclaimers, legal text
- **Used For**: Fine print, disclaimers
- **Mobile Size**: 12px (unchanged)

## Special Text Elements

### Intro Text
- **Size**: 22px
- **Weight**: 500 (Medium)
- **Line Height**: 1.6
- **Example**: Article intros, highlighted content
- **Used For**: Introduction paragraphs, article leads
- **Mobile Size**: 18px

### Button Text
- **Size**: 13px
- **Weight**: 700 (Bold)
- **Line Height**: 1
- **Example**: "Subscribe", "Get Free Account"
- **Used For**: Buttons, calls to action
- **Mobile Size**: 13px (unchanged)

### Navigation Link
- **Size**: 14px
- **Weight**: 700 (Bold)
- **Line Height**: 1.36
- **Example**: "About", "Blog", "Newsletter"
- **Used For**: Main navigation, important links
- **Mobile Size**: 14px (unchanged)

### Badge
- **Size**: 11px
- **Weight**: 700 (Bold)
- **Line Height**: 1.36
- **Letter Spacing**: 3%
- **Text Transform**: Uppercase
- **Example**: "PRO", feature badges
- **Used For**: Labels, tags, status indicators
- **Mobile Size**: 11px (unchanged)

### Breadcrumb
- **Size**: 13px
- **Weight**: 600 (Semibold)
- **Line Height**: 1.6
- **Example**: "Blog > Category > Article Title"
- **Used For**: Breadcrumb navigation
- **Mobile Size**: 13px (unchanged)

### Caption
- **Size**: 13px
- **Weight**: 500 (Medium)
- **Line Height**: 1.6
- **Example**: Image captions, metadata
- **Used For**: Supplementary information, captions
- **Mobile Size**: 13px (unchanged)

## Component-Specific Typography

### CTA Titles
- **Size**: 20px
- **Weight**: 700 (Bold)
- **Line Height**: 1.3
- **Example**: "Stop Guessing, Start Growing 🚀"
- **Used For**: Call-to-action headings in sidebar

### Footer Elements
- **Title**: 16px, 700 (Bold), line-height 1.3
- **Links**: 13px, 400 (Regular), line-height 1.5

### Author Information
- **Name**: 20px, 800 (Extrabold), line-height 1.4
- **Title**: 12px, 700 (Bold), line-height 1.36, uppercase, 5% letter spacing

### Trending Label
- **Size**: 13px
- **Weight**: 600 (Semibold)
- **Line Height**: 1.6
- **Color**: Accent blue
- **Example**: "23.2k viewing now"

## Responsive Typography

The typography scales down on mobile devices (screens smaller than 768px wide) to ensure readability and proper proportions.

| Element | Desktop Size | Mobile Size |
|---------|--------------|-------------|
| H1 | 40px | 32px |
| H2 | 30px | 26px |
| H3 | 24px | 22px |
| H4 | 20px | 18px |
| H5 | 18px | 16px |
| H6 | 16px | 15px |
| Intro Text | 22px | 18px |
| Large Body | 18px | 16px |

## Implementation Notes

1. Always use the predefined CSS classes for consistency across the site
2. Maintain proper hierarchy with heading levels (H1 through H6)
3. Respect line height specifications for readability
4. Apply color variations based on context and importance
5. Follow responsive guidelines for mobile optimization

---

*This typography guide is based on the Figma design specifications from the "Exploding Topics - 2025" project.* 