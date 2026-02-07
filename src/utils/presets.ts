export type PresetVariable = {
  key: string;
  label: string;
  type: 'number' | 'string';
  default?: number | string;
};

export type Preset = {
  name: string;
  description: string;
  variables: PresetVariable[];
  calc: string;
  primaryVariable: string;
};

export const presets: Preset[] = [
  {
    name: 'Simple',
    description: 'For regular payments or things you pay for multiple times per period.',
    variables: [
      { key: 'cost', label: 'Cost', type: 'number', default: 20 },
      { key: 'quantity', label: 'Quantity per /Period/', type: 'number', default: 4 },
    ],
    calc: '{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/',
    primaryVariable: 'quantity',
  },
  {
    name: 'Public Transport',
    description: 'For transport costs, with support for concessions.',
    variables: [
      { key: 'costPerTrip', label: 'Cost per trip', type: 'number', default: 3.5 },
      { key: 'tripsPerPeriod', label: 'Trips per /Period/', type: 'number', default: 10 },
      { key: 'concessionMultiplier', label: 'Concession Multiplier', type: 'number', default: 1 },
    ],
    calc: '{{$costPerTrip = costPerTrip * concessionMultiplier}}pt * {{tripsPerPeriod}}t = {{$res = costPerTrip * tripsPerPeriod}}p/p/',
    primaryVariable: 'tripsPerPeriod',
  },
  {
    name: 'Wage',
    description: 'For income from work, with tax.',
    variables: [
      { key: 'payRate', label: 'Pay Rate', type: 'number', default: 25 },
      { key: 'hoursPerDay', label: 'Hours per day', type: 'number', default: 8 },
      { key: 'daysPerPeriod', label: 'Days per /Period/', type: 'number', default: 5 },
      { key: 'taxRate', label: 'Tax Rate', type: 'number', default: 0.2 },
    ],
    calc: '{{$payRate}}ph * {{hoursPerDay}}h * {{daysPerPeriod}}d = {{$grossPay = payRate * hoursPerDay * daysPerPeriod}}p/p/ (gross) or ~{{$res = grossPay * (1 - taxRate)}}p/p/ (net)',
    primaryVariable: 'daysPerPeriod',
  },
];
