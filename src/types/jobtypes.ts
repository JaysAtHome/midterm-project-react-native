export interface Job {
    id: string;
    title: string;
    companyName: string;
    description: string;
    minSalary: number | null;
    maxSalary: number | null;
  }