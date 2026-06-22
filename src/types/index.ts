export type AssessmentStatus = string;

export interface StatusConfig {
  value: string;
  label: string;
  color: string;
}
export type JobType = 'Kitchen' | 'Bathroom' | 'Flooring' | 'Painting' | 'Living Room' | 'Bedroom' | 'Deck' | 'Other';
export type WallDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | null;

// ── Dictation & AI Parsing ────────────────────────────────────────────────────
export interface ClarificationNeeded {
  id: string;
  field: string;
  what_was_said: string;
  assumption_made?: string;
  suggested_standard?: string;
  options?: string[];
  certainty: 'high' | 'medium' | 'low';
  priority: 'high' | 'medium' | 'low';
}

export interface DesignQuestion {
  id: string;
  question: string;
  category?: string;
  current_state?: string;
  user_stated?: string;
  options?: string[];
  placement_context?: string;
  described_as?: string;
  priority?: 'high' | 'medium' | 'low';
  certainty: 'high' | 'medium' | 'low';
}

export interface ParsedResult {
  measurements: Record<string, string | number | boolean>;
  questions: Record<string, string | string[] | boolean>;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
  wallContext?: string | null; // e.g., "sink wall", "window wall"
  wallContextConfidence?: 'high' | 'medium' | 'low';
  job_type_detected?: 'measurement' | 'design_brief' | 'mixed';
  clarifications_needed?: ClarificationNeeded[]; // Assumptions and questions
  design_questions?: DesignQuestion[]; // Extracted design requirements
  flags?: string[]; // Warnings about data quality, structural changes, etc.
}

export interface DictationTranscript {
  id: string;
  text: string;
  timestamp: string;
  processed: boolean;
  parsed?: ParsedResult; // Store parsed results
}

// ── AI Extract Data (Flexible, Wall-Based) ────────────────────────────────────
export interface AIExtractAppliance {
  id: string;
  name: string;
  width?: string;
  position?: string;
  [key: string]: any;
}

export interface AIWallData {
  id: string;
  name: string; // "Fridge Wall", "Sink Wall", etc.
  wallContextConfidence: 'high' | 'medium' | 'low';
  measurements: Record<string, any>; // All extracted measurements (wall_length, ceiling_height, etc.)
  appliances: AIExtractAppliance[];
  features: Record<string, any>; // dishwasher, disposal, backsplash, etc.
  questions: Record<string, any>; // Answers extracted from dictation
  notes: string;
  rawParsed: ParsedResult; // Original AI response for transparency
  createdAt: string;
  updatedAt: string;
  source: 'ai' | 'manual';
}

export interface AIExtractData {
  walls: AIWallData[];
}

// ── Client ────────────────────────────────────────────────────────────────────
export interface ClientInfo {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  notes: string;
  teamMember: string;
  visitDate: string;
}

// ── Wall sub-types ────────────────────────────────────────────────────────────
export interface WindowData {
  // Inside trim (the opening)
  insideWidth?: string;
  insideHeight?: string;
  // With trim (the full frame)
  withTrimWidth?: string;
  withTrimHeight?: string;
  // Position in wall
  distanceFromLeftCorner?: string;
  distanceFromRightCorner?: string;
  // Window-specific
  sillHeight?: string;
  replacing?: boolean;
}

export interface DoorData {
  type?: 'Door' | 'Opening';
  // Inside trim (the opening)
  insideWidth?: string;
  insideHeight?: string;
  // With trim (the full frame)
  withTrimWidth?: string;
  withTrimHeight?: string;
  // Position in wall
  distanceFromLeftCorner?: string;
  distanceFromRightCorner?: string;
  // Door-specific
  swing?: 'Left' | 'Right' | 'Both' | 'N/A';
}

export interface OutletData {
  type?: 'Outlet' | 'Switch';
  corner?: 'Left' | 'Right';
  location?: string;
}

export interface ApplianceOnWall {
  name?: string;
  w?: string;
  h?: string;
  d?: string;
  loc?: string;
  corner?: 'Left' | 'Right';
}

export interface WallLengthPiece {
  id: string;
  label?: string;
  length?: string;
}

export interface WallData {
  name?: string;
  notes?: string;
  length?: string;
  direction?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  lengthPieces?: WallLengthPiece[];
  ceilOvr?: boolean;
  ceilH?: string;
  sH?: string;
  sD?: string;
  sW?: string;
  windows?: WindowData[];
  doors?: DoorData[];
  outlets?: OutletData[];
  appliances?: ApplianceOnWall[];
  hasSink?: boolean;
  sinkCorner?: 'Left' | 'Right';
  sinkLoc?: string;
  sinkType?: string;
  sinkTypeOther?: string;
  sinkCabExistingW?: string;
  sinkCabDesiredW?: string;
  sinkW?: string;
  sinkD?: string;
  faucetLoc?: string;
  dwLine?: string;
  imLine?: string;
  disposal?: boolean;
  cabinetNotes?: string;
  // Per-wall existing cabinets
  hasUpperCabs?: boolean;
  upperCabH?: string;
  upperCabD?: string;
  hasBaseCabs?: boolean;
  baseCabH?: string;
  baseCabD?: string;
  hasTallCab?: boolean;
  tallCabH?: string;
  tallCabD?: string;
}

// ── Kitchen ───────────────────────────────────────────────────────────────────
export interface KitchenMeasurements {
  ceilingHeight?: string;
  hasSoffit?: boolean;
  soffitH?: string;
  soffitD?: string;
  soffitW?: string;
  soffitSame?: boolean;
  walls: WallData[];
  // Island
  hasIsland?: boolean;
  iLen?: string;
  iW?: string;
  iCabLen?: string;
  iDF?: string; iDB?: string; iDL?: string; iDR?: string;
  iOvhgSides?: string[];
  iOvhg_Front?: string; iOvhg_Back?: string; iOvhg_Left?: string; iOvhg_Right?: string;
  iSink?: boolean;
  iSinkType?: string;
  iSinkTypeOther?: string;
  iSinkLeft?: string;
  iSinkRight?: string;
  iCooktop?: boolean;
  iCooktopLen?: string;
  iCooktopW?: string;
  iCooktopLeft?: string;
  iCooktopRight?: string;
  iOutlet?: boolean;
  iOutletSides?: string[];
  iOutletCountertop?: boolean;
  iOutletCountertopNotes?: string;
  iHasLevels?: boolean;
  iLevelType?: string;
  iLevelLowH?: string; iLevelLowLen?: string; iLevelLowW?: string;
  iLevelHighH?: string; iLevelHighLen?: string; iLevelHighW?: string;
  iStatus?: 'Existing' | 'New';
  // Existing Cabinets
  hasCabinets?: boolean;
  ecUH?: string; ecUD?: string; ecTH?: string; ecTD?: string;
  ecUpper?: string[];
  ecBase?: string[];
  ecNotes?: string;
  // Desk
  hasDesk?: boolean;
  deskW?: string; deskH?: string; deskLoc?: string;
  deskWall?: string;
  deskUpper?: boolean;
  deskBase?: boolean;
  deskNotes?: string;
}

export interface KitchenQuestions {
  visibleQuestions?: string[];
  scope?: string[];
  reason?: string[];
  reasonOther?: string;
  timeline?: string;
  targetDate?: string;
  cabinets?: string[];
  cabinetStyle?: string;
  cabinetNotes?: string;
  countertopNotes?: string;
  backsplashInstall?: boolean;
  backsplashMaterial?: string;
  backsplashOther?: string;
  backsplashNotes?: string;
  recessedLights?: boolean;
  recessedLightsCount?: string;
  sinkNotes?: string;
  faucetNotes?: string;
  applianceScope?: string[];
  applianceList?: string[];
  electrical?: string;
  plumbing?: string;
  flooringIncluded?: boolean;
  flooringType?: string[];
  permits?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface CustomPhoto {
  id: string;
  label: string;
  photoId: string;
  type?: 'photo' | 'video'; // 'photo' is default for backwards compatibility
  rotation?: number; // 0, 90, 180, 270 degrees
}

// ── Layout Drawing ────────────────────────────────────────────────────────────
export interface LayoutData {
  canvasData?: string;    // base64 PNG from canvas.toDataURL()
  lastUpdated?: string;   // ISO timestamp
  wallPositions?: Record<number, { x: number; y: number }>;  // canvas start position per wall index
}

export interface KitchenPhotos {
  photos: CustomPhoto[];
}

export interface KitchenAssessment {
  measurements: KitchenMeasurements;
  questions: KitchenQuestions;
  photos: KitchenPhotos;
  dictations?: DictationTranscript[]; // Voice dictations with optional parsed results
  aiExtract?: AIExtractData; // AI-extracted walls (flexible, not bound to Wall A/B/C/D)
}

// ── Bathroom ──────────────────────────────────────────────────────────────────
export interface BathroomMeasurements {
  ceilingHeight?: string;
  hasSoffit?: boolean;
  soffitH?: string;
  soffitD?: string;
  soffitW?: string;
  soffitSame?: boolean;
  walls: WallData[];
  // Tub
  hasTub?: boolean;
  tubLen?: string;
  tubW?: string;
  tubH?: string;
  tubLoc?: string;
  tubCombined?: boolean;
  // Shower
  hasShower?: boolean;
  showerLen?: string;
  showerW?: string;
  showerH?: string;
  showerLoc?: string;
  showerCeilH?: string;
  showerDoorW?: string;
  kneeWallH?: string;
  kneeWallLen?: string;
  // Vanity
  vanityWall?: string;
  vanityLoc?: string;
  vanityW?: string;
  vanityH?: string;
  vanityD?: string;
  vanitySinks?: 'Single' | 'Double';
  mirrorW?: string;
  mirrorH?: string;
  // Toilet
  toiletLoc?: string;
  toiletClearLeft?: string;
  toiletClearRight?: string;
  // Linen closet
  hasLinenCloset?: boolean;
  lcW?: string;
  lcH?: string;
  lcD?: string;
  lcLoc?: string;
  // Extras
  exhaustFanLoc?: string;
  towelBarLocs?: string;
  heatedFloor?: boolean;
  hasLaundry?: boolean;
  washerLoc?: string;
  washerW?: string;
  washerH?: string;
  dryerLoc?: string;
  dryerW?: string;
  dryerH?: string;
}

export interface BathroomQuestions {
  visibleQuestions?: string[];
  scope?: string[];
  timeline?: string;
  targetDate?: string;
  tubShowerScope?: string[];
  vanityScope?: string[];
  tileScope?: string[];
  recessedLights?: boolean;
  recessedLightsCount?: string;
  groutNotes?: string;
  tilePatternNotes?: string;
  electrical?: string;
  plumbing?: string;
  permits?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface BathroomPhotos {
  photos: CustomPhoto[];
}

export interface BathroomAssessment {
  measurements: BathroomMeasurements;
  questions: BathroomQuestions;
  photos: BathroomPhotos;
  dictations?: DictationTranscript[];
  aiExtract?: AIExtractData;
}

// ── Flooring ──────────────────────────────────────────────────────────────────
export interface FlooringPart {
  id: string;
  label?: string;
  length?: string;
  width?: string;
}

export interface TransitionStrip {
  id: string;
  location?: string;
  length?: string;
  type?: string;
}

export interface FlooringTrim {
  id: string;
  label?: string;
  length?: string;
}

export interface FlooringRoom {
  id: string;
  label: string;
  parts: FlooringPart[];
  transitions: TransitionStrip[];
  trims: FlooringTrim[];
}

export interface FlooringMeasurements {
  rooms: FlooringRoom[];
}

export interface FlooringQuestions {
  visibleQuestions?: string[];
  material?: string[];
  customMaterial?: string;
  removeExisting?: boolean;
  subfloorRepairs?: string;
  underlayment?: boolean;
  stairNosing?: boolean;
  matchingOther?: boolean;
  timeline?: string;
  targetDate?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface FlooringPhotos {
  photos: CustomPhoto[];
}

export interface FlooringAssessment {
  measurements: FlooringMeasurements;
  questions: FlooringQuestions;
  photos: FlooringPhotos;
  aiExtract?: AIExtractData;
}

// ── Living Room ───────────────────────────────────────────────────────────────
export interface LivingRoomMeasurements {
  ceilingHeight?: string;
  windowCount?: string;
  doorCount?: string;
  outletCount?: string;
  flooring?: string;
  lightingNotes?: string;
}

export interface LivingRoomQuestions {
  visibleQuestions?: string[];
  renovationScope?: string[];
  timeline?: string;
  targetDate?: string;
  floringIncluded?: boolean;
  lightingWork?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface LivingRoomPhotos {
  photos: CustomPhoto[];
}

export interface LivingRoomAssessment {
  measurements: LivingRoomMeasurements;
  questions: LivingRoomQuestions;
  photos: LivingRoomPhotos;
  aiExtract?: AIExtractData;
}

// ── Bedroom ────────────────────────────────────────────────────────────────────
export interface BedroomMeasurements {
  ceilingHeight?: string;
  closetCount?: string;
  closetNotes?: string;
  windowCount?: string;
  doorCount?: string;
  outletCount?: string;
  flooring?: string;
}

export interface BedroomQuestions {
  visibleQuestions?: string[];
  renovationScope?: string[];
  timeline?: string;
  targetDate?: string;
  floringIncluded?: boolean;
  closetWork?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface BedroomPhotos {
  photos: CustomPhoto[];
}

export interface BedroomAssessment {
  measurements: BedroomMeasurements;
  questions: BedroomQuestions;
  photos: BedroomPhotos;
  aiExtract?: AIExtractData;
}

// ── Deck ───────────────────────────────────────────────────────────────────────
export interface DeckMeasurements {
  length?: string;
  width?: string;
  height?: string;
  sqFt?: string;
  existingCondition?: string;
  railingPresent?: boolean;
  railingNotes?: string;
  accessNotes?: string;
}

export interface DeckQuestions {
  visibleQuestions?: string[];
  renovationScope?: string[];
  timeline?: string;
  targetDate?: string;
  existing?: string;
  railing?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface DeckPhotos {
  photos: CustomPhoto[];
}

export interface DeckAssessment {
  measurements: DeckMeasurements;
  questions: DeckQuestions;
  photos: DeckPhotos;
  aiExtract?: AIExtractData;
}

// ── Painting ──────────────────────────────────────────────────────────────────
export interface PaintingMeasurement {
  id: string;
  label?: string;
  length?: string;
}

export interface PaintingMeasurements {
  floorMeasurements: PaintingMeasurement[];
  trimMeasurements: PaintingMeasurement[];
}

export interface PaintingQuestions {
  visibleQuestions?: string[];
  scope?: string[];
  timeline?: string;
  targetDate?: string;
  referral?: string;
  referralName?: string;
  referralOther?: string;
  specialNoteItems?: string[];
  specialNotes?: string;
}

export interface PaintingPhotos {
  photos: CustomPhoto[];
}

export interface PaintingAssessment {
  measurements: PaintingMeasurements;
  questions: PaintingQuestions;
  photos: PaintingPhotos;
  aiExtract?: AIExtractData;
}

// ── Other ─────────────────────────────────────────────────────────────────────
export interface OtherAssessment {
  measurementNotes?: string;
  questionNotes?: string;
  photoNotes?: string;
  aiExtract?: AIExtractData;
}

// ── Job Instance ──────────────────────────────────────────────────────────────
export interface JobInstance {
  id: string;
  type: JobType;
  label: string;
  layout?: LayoutData;
  kitchen: KitchenAssessment;
  bathroom?: BathroomAssessment;
  flooring?: FlooringAssessment;
  painting?: PaintingAssessment;
  livingRoom?: LivingRoomAssessment;
  bedroom?: BedroomAssessment;
  deck?: DeckAssessment;
  other?: OtherAssessment;
}

// ── Cost (legacy stub — Sprint 3 adds EstimateData) ───────────────────────────
export interface CostEstimate {
  cabinets: string;
  countertops: string;
  backsplash: string;
  appliances: string;
  flooring: string;
  demolition: string;
  plumbing: string;
  electrical: string;
  painting: string;
  labor: string;
  permits: string;
  other: string;
  notes: string;
}

// ── Price Guide ───────────────────────────────────────────────────────────────
export type PricingUnit = 'linear-ft' | 'sq-ft' | 'unit' | 'flat-rate' | 'per-hour';

export interface PriceGuideItem {
  id: string;
  key?: string;
  name: string;
  unit: PricingUnit;
  laborCost: number;
  materialLow?: number;
  materialMed?: number;
  materialHigh?: number;
}

export interface PriceCategory {
  id: string;
  name: string;
  items: PriceGuideItem[];
}

export interface MarkupSettings {
  laborPct: number;
  materialsPct: number;
}

// ── Estimate ──────────────────────────────────────────────────────────────────
export type MaterialTier = 'low' | 'med' | 'high';

export interface EstimateLine {
  id: string;
  label: string;
  unit: PricingUnit;
  qty: number;
  laborCostPerUnit: number;
  materialCostPerUnit: number;
  tier: MaterialTier;
  laborMarkupPct: number;
  materialsMarkupPct: number;
  overrideLaborTotal?: number;
  overrideMaterialTotal?: number;
  isOverridden: boolean;
}

export interface EstimateData {
  lines: EstimateLine[];
  defaultTier: MaterialTier;
  isLocked: boolean;
  notes: string;
  generatedAt: string;
}

// ── Assessment ────────────────────────────────────────────────────────────────
export interface Assessment {
  id: string;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assignedToUserId?: string;
  client: ClientInfo;
  jobs: JobInstance[];
  costs: CostEstimate;
  estimate?: EstimateData;
  generalNotes: string;
}
