import { v4 as uuidv4 } from 'uuid';
import type { PriceCategory, PricingUnit, MarkupSettings } from '../types';

function item(key: string, name: string, unit: PricingUnit, laborCost: number, materialLow?: number, materialMed?: number, materialHigh?: number) {
  return { id: uuidv4(), key, name, unit, laborCost, materialLow, materialMed, materialHigh };
}

export function defaultPriceGuide(): PriceCategory[] {
  return [
    {
      id: uuidv4(),
      name: 'Cabinets & Millwork',
      items: [
        item('upper-cabs',   'Upper Cabinets',           'linear-ft',  85, 120, 200, 380),
        item('base-cabs',    'Base Cabinets',            'linear-ft',  95, 140, 220, 420),
        item('tall-cab',     'Tall / Pantry Cabinet',    'unit',      150, 400, 650, 1200),
        item('island-cabs',  'Island Cabinets',          'linear-ft', 110, 150, 250, 450),
        item('crown-molding','Crown Molding',            'linear-ft',  18,   4,   8,   15),
        item('valance',      'Valance / Light Rail',     'linear-ft',  14,   3,   6,   10),
      ],
    },
    {
      id: uuidv4(),
      name: 'Countertops',
      items: [
        item('countertops',  'Countertops',              'sq-ft',      35,  35,  65,  120),
        item('ct-cutout',    'Countertop Cutout (sink/cooktop)', 'unit', 85, 0, 0, 0),
      ],
    },
    {
      id: uuidv4(),
      name: 'Backsplash',
      items: [
        item('backsplash-install', 'Backsplash Installation', 'sq-ft', 18, 5, 12, 25),
      ],
    },
    {
      id: uuidv4(),
      name: 'Flooring',
      items: [
        item('flooring-material', 'Flooring Material',     'sq-ft',   0, 3.5, 6, 12),
        item('flooring-install',  'Flooring Installation', 'sq-ft',   6, 0,   0,  0),
        item('underlayment',      'Underlayment',          'sq-ft',   0, 0.5, 0.8, 1.2),
        item('floor-demo',        'Floor Demo / Removal',  'sq-ft',   2, 0,   0,   0),
        item('stair-nosing',      'Stair Nosing',          'unit',   45, 15,  30,  60),
      ],
    },
    {
      id: uuidv4(),
      name: 'Plumbing',
      items: [
        item('sink-plumbing',  'Sink / Plumbing Rough-in', 'unit', 350, 0, 0, 0),
        item('disposal-install','Garbage Disposal Install', 'unit', 200, 0, 0, 0),
        item('faucet-install', 'Faucet Installation',      'unit', 125, 0, 0, 0),
      ],
    },
    {
      id: uuidv4(),
      name: 'Appliances',
      items: [
        item('appliance-install', 'Appliance Installation', 'unit', 150, 0, 0, 0),
      ],
    },
    {
      id: uuidv4(),
      name: 'Bathroom',
      items: [
        item('bathroom-demo',         'Bathroom Demo',                   'flat-rate', 800, 0, 0, 0),
        item('shower-wall-tile',      'Shower Wall Tile Installation',   'sq-ft',      18, 5, 12, 25),
        item('shower-floor-tile',     'Shower Floor Tile Installation',  'sq-ft',      20, 5, 12, 25),
        item('tub-install',           'Tub Installation',                'unit',      500, 0, 0, 0),
        item('vanity-install',        'Vanity Installation',             'unit',      300, 0, 0, 0),
        item('toilet-install',        'Toilet Installation',             'unit',      250, 0, 0, 0),
        item('exhaust-fan-install',   'Exhaust Fan Installation',        'unit',      180, 0, 0, 0),
        item('heated-floor-install',  'Heated Floor Installation',       'sq-ft',      12, 6, 10, 18),
      ],
    },
    {
      id: uuidv4(),
      name: 'Labor & Misc',
      items: [
        item('kitchen-demo', 'Kitchen Demo',            'flat-rate', 1200, 0, 0, 0),
        item('painting',     'Painting (per room)',     'flat-rate',  350, 0, 0, 0),
        item('permit',       'Permit Fee',              'flat-rate',  250, 0, 0, 0),
        item('haul-away',    'Haul Away / Dump Fee',    'flat-rate',  300, 0, 0, 0),
        item('misc-labor',   'Miscellaneous Labor',     'per-hour',    85, 0, 0, 0),
      ],
    },
  ];
}

export const DEFAULT_MARKUP: MarkupSettings = {
  laborPct: 30,
  materialsPct: 40,
};
