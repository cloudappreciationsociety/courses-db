type Hour = `${0 | 1}${number}` | `2${0 | 1 | 2 | 3}`;
type Minute = `${0 | 1 | 2 | 3 | 4 | 5}${number}`;

export type TimeString = `${Hour}:${Minute}`;