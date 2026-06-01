# 📐 Layout Tab — Floor Plan Builder Vision

**Last Updated:** May 31, 2026 (Session 7)  
**Status:** Architecture defined, walls drawing partially broken, needs full rebuild

---

## 🎯 What the Layout Tab Does

The **Layout Tab** is a visual **kitchen floor plan builder** (bird's-eye view). It lets field teams:

1. **Draw the room perimeter** — Create walls that auto-connect end-to-end to form a closed kitchen outline
2. **Add wall intersections** — Create T-shaped intersections (walls crossing other walls at a distance from the end)
3. **Measure and label** — Each wall has a name (A, B, C, D or custom) and a length
4. **Annotate with details** — Add windows, doors, appliances, outlets, and other fixtures to walls (Phase 2)

**Result:** A professional-looking floor plan showing the kitchen layout with all key measurements and details visible at a glance.

---

## 🏗️ How Walls Should Work

### Wall Auto-Connection (Phase 1 — Current)

When user places walls in sequence:

```
Wall A: 15 feet long, facing East
  → Starts at origin (80, 80) on canvas
  → Ends at (80 + 15ft pixels, 80)

Wall B: 12 feet long, facing North
  → Starts at the END of Wall A (auto-connected)
  → Ends at (80 + 15ft pixels, 80 + 12ft pixels)

Wall C: 15 feet long, facing West
  → Starts at the END of Wall B (auto-connected)
  → Ends at origin (80, 80) — closes the rectangle
```

**Implementation:**
- Each wall ends where the next wall begins
- Wall placement dialog shows which wall it will attach to (e.g., "Attach to end of Wall B")
- Canvas draws walls as connected lines, not floating lines

### Wall Intersections / T-Shapes (Phase 1.5 — Future)

Users should be able to create T-shaped walls:

```
Wall A: 15 feet East
Wall B: 12 feet North (connects to end of A)

Wall D: 8 feet East, intersecting Wall B at 6 feet from its start
  → Creates a T-shape where D branches off the middle of B
  → Position defined as: "Wall D, 6 feet up from the start of Wall B"
```

**Implementation:**
- Dialog asks: "Does this wall intersect another wall?" Yes/No
- If Yes: "Which wall?" (dropdown) → "How far from its start?" (distance input)
- The wall is drawn crossing the intersected wall at that exact point

---

## 🔄 Data Flow: Measurements ↔ Layout

### Measurements Tab → Layout Tab

When user enters wall data in **Measurements tab:**
```
Wall A: length = "120"", direction = "E", name = "Kitchen Sink Wall"
```

The **Layout tab** should automatically:
1. Display it as a drawn wall line with the label and length
2. Position it correctly based on direction and connection to previous walls
3. Update the floor plan in real-time

### Layout Tab → Measurements Tab

When user places a wall on the **Layout tab** using the dialog:
1. Dialog collects: wall direction, length, optional name
2. Data is saved to `kitchen.measurements.walls[index]`
3. Measurements tab immediately reflects the new wall
4. Estimate generation includes the new wall automatically

### Sync Example

```
User edits Wall B length in Measurements: 120" → 140"
  ↓
Wall drawing effect re-runs with new data
  ↓
Layout canvas redraws with Wall B now 140" long
  ↓
Wall C (which was connected to B) shifts position on canvas
  ↓
Floor plan updates instantly
```

---

## 🎨 Canvas Display Details

### Wall Line Style
- **Color:** Yellow `#F5C42A` (brand color)
- **Width:** 4px
- **Style:** Solid line
- **Endpoints:** Rounded caps (`ctx.lineCap = 'round'`)

### Wall Labels (Above the Line)
- **Wall name:** "A", "B", "C", or custom (e.g., "Stove Wall")
- **Font:** Bold 16px system-ui
- **Color:** Yellow `#F5C42A`
- **Position:** Centered above the wall line

### Wall Measurement (Below the Line)
- **Text:** Wall length (e.g., "120"", "15'")
- **Font:** 12px system-ui, semi-transparent yellow
- **Position:** Centered below the wall line

### Intersection Symbol (Phase 1.5)
- When Wall D intersects Wall B, draw a small symbol (e.g., a dot or crosshair) at the intersection point
- Help users visualize the T-shape clearly

---

## 🛠️ Current Implementation State

### What Works
- ✅ Pen tool (freehand drawing)
- ✅ Rectangle tool
- ✅ Eraser tool
- ✅ Wall direction selector (compass: N, NE, E, SE, S, SW, W, NW)
- ✅ Wall placement dialog with length input and optional name
- ✅ Canvas resizing and background fill

### What's Broken / Missing
- ❌ **Walls not displaying on canvas** — Drawing code executes but walls don't render visually
  - Root cause: Unknown (canvas context issue, data flow, or persistence)
  - Symptoms: Code logs say "✏️ Drawing wall 0", but no wall appears
- ❌ **No auto-connection logic** — Each wall placed independently, not connected to previous
- ❌ **No T-intersection support** — Can't create walls that cross other walls
- ❌ **Wall details annotation** — Can't add windows, doors, appliances to walls yet

### Key Files
- `src/components/LayoutTab.tsx` — Main canvas component, wall drawing effect (broken)
- `src/components/WallMeasurementDialog.tsx` — Dialog for placing walls
- `src/pages/AssessmentDetail.tsx` — Parent component, routes wall callbacks
- `src/types/index.ts` — `WallData` type definition

---

## 📋 Next Steps (Priority Order)

### 🔴 Critical: Fix Wall Display (Blocker)
1. Debug why walls aren't rendering on canvas
2. Verify canvas context is working (Pen tool works, so context should be fine)
3. Check if wall drawing code is being called at the right time
4. Test with minimal example: draw a single red line, verify it appears
5. Once fixed, proceed to auto-connection

### 🟡 Phase 1: Auto-Connection
1. Track wall connection sequence (Wall A → Wall B → Wall C → etc.)
2. Calculate endpoint of Wall A → use as startpoint of Wall B
3. Update `WallMeasurementDialog` to show which wall will be connected ("Connect to end of Wall B")
4. Redraw floor plan with connected walls (no gaps)
5. Handle wall direction angles correctly (E = 0°, N = -90°, S = 90°, etc.)

### 🟢 Phase 1.5: T-Intersections
1. Add optional "Intersect another wall?" toggle to wall dialog
2. If yes: dropdown to select target wall + distance input from its start
3. Calculate intersection point: `target_wall_start + (distance * scale_factor)`
4. Draw new wall crossing the target wall at that point
5. Draw intersection symbol (dot, crosshair, or plus sign)

### 🔵 Phase 2: Wall Annotations
1. Click on a wall → detail panel for that wall
2. Add windows to wall: position (distance from left end), width, height
3. Add doors/openings: position, type, width
4. Add appliances: position, type (sink, stove, fridge, dishwasher)
5. Add outlets: count and positions along the wall
6. Draw small icons/symbols on the floor plan for each detail
7. Sync with Measurements tab (windows, doors, appliances, outlets arrays)

---

## 📐 Technical Details: Compass Directions

Walls are drawn using compass directions with 45° increments:

```
Direction | Angle | cos(angle) | sin(angle) | Visual
----------|-------|------------|-----------|--------
N         | -90°  |     0      |    -1     | ↑ up
NE        | -45°  |   0.707    |  -0.707   | ↗ up-right
E         |   0°  |     1      |     0     | → right
SE        |  45°  |   0.707    |   0.707   | ↘ down-right
S         |  90°  |     0      |     1     | ↓ down
SW        | 135°  |  -0.707    |   0.707   | ↙ down-left
W         | 180°  |    -1      |     0     | ← left
NW        | 225°  |  -0.707    |  -0.707   | ↖ up-left
```

**Canvas coordinate system:**
- Origin (0, 0) is top-left
- X increases to the right
- Y increases downward
- Walls are drawn: `ctx.lineTo(startX + pixelLength * cos(angle), startY + pixelLength * sin(angle))`

**Scale factor:** 0.5 pixels per inch (120 inches = 60 pixels on canvas)

---

## 🧪 Testing Checklist

- [ ] Add Wall A (120", East direction) → appears on canvas as horizontal line
- [ ] Add Wall B (100", North direction) → connects to end of Wall A
- [ ] Add Wall C (120", West direction) → connects to end of Wall B
- [ ] Add Wall D (100", South direction) → closes the rectangle back to Wall A start
- [ ] Edit Wall A length to 140" → Wall B and rest shift position
- [ ] Delete Wall A → removes wall and shifts remaining walls
- [ ] Add intersection wall crossing one of the main walls → T-shape visible
- [ ] All walls show correct labels (A, B, C, D) and lengths
- [ ] Freehand drawings (Pen tool) persist when walls are drawn/edited
- [ ] Mobile view: floor plan is readable and walls are positioned correctly

---

## 💭 Open Questions for Next Dev

1. **Wall storage:** Should walls be stored as an array that grows (Wall A, B, C, D, E, F...), or always fixed at 4 walls with dynamic naming?
2. **Undo/Redo:** Should there be undo/redo for wall placement, or just delete and redraw?
3. **Rotation:** Should walls be drawable at any angle, or only 8 compass directions?
4. **Mobile interaction:** How should walls be placed on touch devices? (Compass selector seems good)
5. **Wall thickness:** Should walls be drawn with visual thickness (e.g., 3-4px representing physical wall), or just lines?

---

**Good luck! This is a fun feature. 🚀**
