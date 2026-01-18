
export interface LocationData {
  elevation: number;
  name: string;
  region: string;
  coords: {
    lat: number;
    lng: number;
  };
}

export enum AppTab {
  KAART = 'Kaart',
  PROFIEL = 'Profiel',
  INSTELLINGEN = 'Instellingen'
}
