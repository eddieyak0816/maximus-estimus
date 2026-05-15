export type AssessmentStatus = 'draft' | 'in-progress' | 'complete';
export type JobType = 'Kitchen' | 'Bathroom' | 'Flooring' | 'Living Room' | 'Bedroom' | 'Deck' | 'Other';

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
  width?: string;
  height?: string;
  leftCorner?: string;
  rightCorner?: string;
  sillHeight?: string;
  trimLeft?: string;
  trimRight?: string;
  trimTop?: string;
  trimBottom?: string;
}

export interface DoorData {
  type?: 'Door' | 'Opening';
  width?: string;
  height?: string;
  leftCorner?: string;
  rightCorner?: string;
  swing?: 'Left' | 'Right' | 'Both' | 'N/A';
  trimLeft?: string;
  trimRight?: string;
  trimTop?: string;
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

export interface WallData {
  name?: string;
  length?: string;
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
  hasTallCab?: boolean;
  tallCabH?: string;
  tallCabD?: string;
}

export type WallMap = { A: WallData; B: WallData; C: WallData; D: WallData };

// ── Kitchen ───────────────────────────────────────────────────────────────────
export interface KitchenMeasurements {
  ceilingHeight?: string;
  hasSoffit?: boolean;
  soffitH?: string;
  soffitD?: string;
  soffitW?: string;
  soffitSame?: boolean;
  walls: WallMap;
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
  scope?: string[];
  reason?: string[];
  reasonOther?: string;
  timeline?: string;
  targetDate?: string;
  cabinets?: string[];
  cabinetStyle?: string;
  cabinetNotes?: string;
  countertopNotes?: string;
  backsplashNotes?: string;
  backsplashInstall?: boolean;
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
}

export interface KitchenPhotos {
  roomEntrance?: string;
  roomCorner?: string;
  floor?: string;
  wallA?: string; wallB?: string; wallC?: string; wallD?: string;
  island?: string;
  desk?: string;
  cabUppers?: string;
  cabBase?: string;
  cabTall?: string;
  problemAreas?: string;
  unusual?: string;
  electricalPanel?: string;
  catchAll?: string;
  catchAllNotes?: string;
  customPhotos?: CustomPhoto[];
}

export interface KitchenAssessment {
  measurements: KitchenMeasurements;
  questions: KitchenQuestions;
  photos: KitchenPhotos;
}

// ── Bathroom ──────────────────────────────────────────────────────────────────
export interface BathroomMeasurements {
  ceilingHeight?: string;
  hasSoffit?: boolean;
  soffitH?: string;
  soffitD?: string;
  soffitW?: string;
  soffitSame?: boolean;
  walls: WallMap;
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
  scope?: string[];
  timeline?: string;
  targetDate?: string;
  tubShowerScope?: string[];
  vanityScope?: string[];
  tileScope?: string[];
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
  roomEntrance?: string;
  roomCorner?: string;
  floor?: string;
  wallA?: string;
  wallB?: string;
  wallC?: string;
  wallD?: string;
  tub?: string;
  shower?: string;
  showerFloor?: string;
  vanity?: string;
  toilet?: string;
  linenCloset?: string;
  problemAreas?: string;
  catchAll?: string;
  catchAllNotes?: string;
  customPhotos?: CustomPhoto[];
}

export interface BathroomAssessment {
  measurements: BathroomMeasurements;
  questions: BathroomQuestions;
  photos: BathroomPhotos;
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

export interface FlooringRoom {
  id: string;
  label: string;
  parts: FlooringPart[];
  transitions: TransitionStrip[];
}

export interface FlooringMeasurements {
  rooms: FlooringRoom[];
}

export interface FlooringQuestions {
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
  roomPhotos: Record<string, { overview?: string; condition?: string }>;
  stairs?: string;
  catchAll?: string;
  catchAllNotes?: string;
  customPhotos?: CustomPhoto[];
}

export interface FlooringAssessment {
  measurements: FlooringMeasurements;
  questions: FlooringQuestions;
  photos: FlooringPhotos;
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
  roomOverview?: string;
  roomCorner?: string;
  flooring?: string;
  lighting?: string;
  problemAreas?: string;
  catchAll?: string;
  catchAllNotes?: string;
  customPhotos?: CustomPhoto[];
}

export interface LivingRoomAssessment {
  measurements: LivingRoomMeasurements;
  questions: LivingRoomQuestions;
  photos: LivingRoomPhotos;
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
  roomOverview?: string;
  roomCorner?: string;
  closets?: string;
  flooring?: string;
  problemAreas?: string;
  catchAll?: string;
  catchAllNotes?: string;
  customPhotos?: CustomPhoto[];
}

export interface BedroomAssessment {
  measurements: BedroomMeasurements;
  questions: BedroomQuestions;
  photos: BedroomPhotos;
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
  overallView?: string;
  deckSurface?: string;
  railing?: string;
  access?: string;
  problemAreas?: string;
  catchAll?: string;
  catchAllNotes?: string;
  customPhotos?: CustomPhoto[];
}

export interface DeckAssessment {
  measurements: DeckMeasurements;
  questions: DeckQuestions;
  photos: DeckPhotos;
}

// ── Other ─────────────────────────────────────────────────────────────────────
export interface OtherAssessment {
  measurementNotes?: string;
  questionNotes?: string;
  photoNotes?: string;
}

// ── Job Instance ──────────────────────────────────────────────────────────────
export interface JobInstance {
  id: string;
  type: JobType;
  label: string;
  kitchen: KitchenAssessment;
  bathroom?: BathroomAssessment;
  flooring?: FlooringAssessment;
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
  client: ClientInfo;
  jobs: JobInstance[];
  costs: CostEstimate;
  estimate?: EstimateData;
  generalNotes: string;
}
