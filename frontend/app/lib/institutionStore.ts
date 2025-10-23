// Simple state management for institution data
export interface InstitutionData {
  institutionName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  registrationNumber: string;
  description: string;
  registrationDocument?: {
    hash: string;
    url: string;
    name: string;
    size: number;
  };
}

class InstitutionStore {
  private data: InstitutionData | null = null;

  setInstitutionData(data: InstitutionData) {
    this.data = data;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('institutionData', JSON.stringify(data));
    }
  }

  getInstitutionData(): InstitutionData | null {
    if (this.data) {
      return this.data;
    }
    
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('institutionData');
      if (stored) {
        this.data = JSON.parse(stored);
        return this.data;
      }
    }
    
    return null;
  }

  clearInstitutionData() {
    this.data = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('institutionData');
    }
  }
}

export const institutionStore = new InstitutionStore();
