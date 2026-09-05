import type { PersonData } from '../types/game';

export class Person {
  readonly data: PersonData;

  constructor(data: PersonData) {
    this.data = data;
  }

  get id(): string { return this.data.id; }
  get name(): string { return this.data.name; }
  get age(): number { return this.data.age; }
  get profession(): string { return this.data.profession; }
  get familySize(): number { return this.data.familySize; }
  get income(): number { return this.data.income; }
  get fear(): number { return this.data.fear; }
  get resistance(): number { return this.data.resistance; }
  get attendanceChance(): number { return this.data.attendanceChance; }
  get connections(): string[] { return this.data.connections; }

  reset(): void {
    this.data.summonsSent = 0;
    this.data.docsChecked = false;
    this.data.detained = false;
    this.data.medicalChecked = false;
    this.data.neighborsChecked = false;
    this.data.removedFromPlan = false;
    // attendance chance will be recomputed per day by the system if desired
  }
}
