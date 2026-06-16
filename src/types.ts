export interface LandAddress {
  roadAddress: string;
  jibunAddress: string;
}

export interface BasicInfo {
  landType: string;
  areaSqm: number;
  areaPyung: number;
  officialPricePerSqm: number;
  officialPricePerPyung: number;
  ownershipType: string;
}

export interface ZoningAndPlans {
  usageZone: string;
  usageDistrict: string;
  usageArea: string;
  otherLaws: string;
  buildingCoverageLimit: string;
  floorAreaRatioLimit: string;
}

export interface LandRestrictions {
  landTransactionPermission: string;
  actionRestrictions: string[];
  summary: string;
}

export interface BuildingInfo {
  hasBuilding: boolean;
  buildingType: string;
  structure: string;
  totalFloorAreaSqm: number;
  storeys: string;
  approvalDate: string;
}

export interface AiAnalysis {
  roiGrade: "S" | "A" | "B" | "C" | "D";
  roadContact: string;
  slope: string;
  recommendedUses: string[];
  evaluationText: string;
}

export interface MarketValue {
  estimatedPriceMinSqm: number;
  estimatedPriceMaxSqm: number;
  estimatedPriceMinPyung: number;
  estimatedPriceMaxPyung: number;
  marketAnalysis: string;
}

export interface HistoricPrice {
  year: number;
  pricePerSqm: number;
}

export interface MapLinks {
  kakaoMap: string;
  naverMap: string;
  googleMap: string;
}

export interface MapCoord {
  x: string;
  y: string;
}

export interface LandPropertyReport {
  address: LandAddress;
  basicInfo: BasicInfo;
  zoningAndPlans: ZoningAndPlans;
  landRestrictions: LandRestrictions;
  buildingInfo: BuildingInfo;
  aiAnalysis: AiAnalysis;
  marketValue: MarketValue;
  historicalOfficialPrices: HistoricPrice[];
  cautions: string[];
  mapLinks?: MapLinks;
  coord?: MapCoord;
  isVworldSynced?: boolean;
}

export interface HistoryItem {
  id: string;
  searchQuery: string;
  roadAddress: string;
  jibunAddress: string;
  landType: string;
  areaSqm: number;
  roiGrade: string;
  searchedAt: string;
}
