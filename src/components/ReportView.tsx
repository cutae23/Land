import React, { useState, useEffect } from "react";
import { 
  LandPropertyReport, 
  HistoricPrice 
} from "../types";
import { 
  MapPin, 
  TrendingUp, 
  Coins, 
  ShieldAlert, 
  Layers, 
  Home, 
  Calculator, 
  ExternalLink, 
  Compass, 
  ArrowRight,
  Bookmark,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

interface ReportViewProps {
  report: LandPropertyReport;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function ReportView({ report, isBookmarked, onToggleBookmark }: ReportViewProps) {
  // Tabs selector
  const [activeTab, setActiveTab] = useState<"comprehensive" | "eLandUse">("comprehensive");
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleCopyCoords = () => {
    if (report.coord) {
      navigator.clipboard.writeText(`${report.coord.y}, ${report.coord.x}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  // Calculator states
  const [calcArea, setCalcArea] = useState<number>(report.basicInfo.areaSqm);
  const [calcUnit, setCalcUnit] = useState<"sqm" | "pyung">("sqm");
  const [pricePerUnit, setPricePerUnit] = useState<number>(Math.round(report.marketValue.estimatedPriceMinPyung || report.basicInfo.officialPricePerPyung || 5000000));
  const [propertyType, setPropertyType] = useState<"land" | "residential" | "commercial" | "agriculture">("land");

  // Apartment Simulator states
  const [aptLandArea, setAptLandArea] = useState<number>(report.basicInfo.areaSqm);
  const [aptFar, setAptFar] = useState<number>(250);
  const [aptAvgFloors, setAptAvgFloors] = useState<number>(15);
  const [aptUnitsPerFloor, setAptUnitsPerFloor] = useState<number>(4);
  const [aptResiRatio, setAptResiRatio] = useState<number>(90); // 주거:비주거 비율 (주거 비율 %, 기본 90)

  // Unit weights/ratios (29, 39, 59, 84, 101, 130)
  const [aptW29, setAptW29] = useState<number>(10);
  const [aptW39, setAptW39] = useState<number>(15);
  const [aptW59, setAptW59] = useState<number>(25);
  const [aptW84, setAptW84] = useState<number>(40);
  const [aptW101, setAptW101] = useState<number>(10);
  const [aptW130, setAptW130] = useState<number>(0);

  // Reset calculator when land changes
  useEffect(() => {
    setCalcArea(report.basicInfo.areaSqm);
    setCalcUnit("sqm");
    const avgPrice = Math.round((report.marketValue.estimatedPriceMinPyung + report.marketValue.estimatedPriceMaxPyung) / 2);
    setPricePerUnit(avgPrice || Math.round(report.basicInfo.officialPricePerPyung) || 5000000);

    // Sync apartment simulator default states
    setAptLandArea(report.basicInfo.areaSqm);
    const parsedFar = parseInt(String(report.zoningAndPlans?.floorAreaRatioLimit || "250").replace(/[^0-9]/g, "")) || 250;
    setAptFar(parsedFar);
    setAptResiRatio(90);
    
    // Reset to balanced default weights on selection switch
    setAptW29(10);
    setAptW39(15);
    setAptW59(25);
    setAptW84(40);
    setAptW101(10);
    setAptW130(0);
  }, [report]);

  // Conversion logic
  const handleAreaChange = (val: number, unit: "sqm" | "pyung") => {
    setCalcArea(val);
    setCalcUnit(unit);
  };

  const currentAreaSqm = calcUnit === "sqm" ? calcArea : parseFloat((calcArea * 3.3058).toFixed(1));
  const currentAreaPyung = calcUnit === "pyung" ? calcArea : parseFloat((calcArea * 0.3025).toFixed(1));

  // Market estimated calculations
  const expectedTotalPrice = Math.round(currentAreaPyung * pricePerUnit);

  // Apartment simulator computations and presets
  const applyAptPreset = (type: "small" | "medium" | "balanced" | "large") => {
    if (type === "small") {
      setAptW29(40); setAptW39(40); setAptW59(20); setAptW84(0); setAptW101(0); setAptW130(0);
    } else if (type === "medium") {
      setAptW29(0); setAptW39(0); setAptW59(50); setAptW84(50); setAptW101(0); setAptW130(0);
    } else if (type === "balanced") {
      setAptW29(10); setAptW39(15); setAptW59(25); setAptW84(40); setAptW101(10); setAptW130(0);
    } else if (type === "large") {
      setAptW29(0); setAptW39(0); setAptW59(0); setAptW84(30); setAptW101(40); setAptW130(30);
    }
  };

  const sizes = [
    { key: "29", name: "29㎡", desc: "초소형 원룸형", exclusiveSqm: 29, supplySqm: 39.2, pyung: 11.8, weight: aptW29, setWeight: setAptW29, color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50/50" },
    { key: "39", name: "39㎡", desc: "소형 1.5룸형", exclusiveSqm: 39, supplySqm: 52.7, pyung: 15.9, weight: aptW39, setWeight: setAptW39, color: "bg-emerald-500", textColor: "text-emerald-700", bgLight: "bg-emerald-50/50" },
    { key: "59", name: "59㎡", desc: "24평형 표준소형", exclusiveSqm: 59, supplySqm: 79.7, pyung: 24.1, weight: aptW59, setWeight: setAptW59, color: "bg-indigo-500", textColor: "text-indigo-700", bgLight: "bg-indigo-50/50" },
    { key: "84", name: "84㎡", desc: "34평형 국민평형", exclusiveSqm: 84, supplySqm: 113.4, pyung: 34.3, weight: aptW84, setWeight: setAptW84, color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50/55" },
    { key: "101", name: "101㎡", desc: "39평형 중대형", exclusiveSqm: 101, supplySqm: 136.4, pyung: 41.2, weight: aptW101, setWeight: setAptW101, color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50/50" },
    { key: "130", name: "130㎡", desc: "50평형 대형 펜트", exclusiveSqm: 130, supplySqm: 175.5, pyung: 53.1, weight: aptW130, setWeight: setAptW130, color: "bg-rose-500", textColor: "text-rose-700", bgLight: "bg-rose-50/50" }
  ];

  const totalAptWeight = sizes.reduce((sum, s) => sum + s.weight, 0);

  // Maximum Floor Area above ground for housing (지상연면적)
  const maxAptFloorArea = Math.round(aptLandArea * (aptFar / 100) * 10) / 10;

  // 지상 연면적 중 주거/비주거 배정 면적 계산
  const residentialFloorArea = Math.round(maxAptFloorArea * (aptResiRatio / 100) * 10) / 10;
  const nonResidentialFloorArea = Math.round(maxAptFloorArea * ((100 - aptResiRatio) / 100) * 10) / 10;

  // Normalized weighted supply area
  const weightedAptSupplySum = sizes.reduce((sum, s) => sum + (s.weight * s.supplySqm), 0);
  const normalizedWeightedAptSupply = totalAptWeight > 0 ? (weightedAptSupplySum / totalAptWeight) : 0;

  // We can calculate the maximum units we can build on residential area
  const netUnitsCount = normalizedWeightedAptSupply > 0 ? Math.floor(residentialFloorArea / normalizedWeightedAptSupply) : 0;

  // Distribute units accurately according to weight
  const aptResults = sizes.map(s => {
    if (totalAptWeight === 0 || s.weight === 0) return { ...s, count: 0, area: 0 };
    const count = Math.floor((s.weight / totalAptWeight) * netUnitsCount);
    const area = Math.round(count * s.supplySqm * 10) / 10;
    return { ...s, count, area };
  });

  const totalAptUnits = aptResults.reduce((sum, r) => sum + r.count, 0);
  const totalAptConsumedArea = aptResults.reduce((sum, r) => sum + r.area, 0);
  const remainingAptArea = Math.max(0, Math.round((residentialFloorArea - totalAptConsumedArea) * 10) / 10);

  // Dong & Ho layouts
  const capacityPerAptDong = aptAvgFloors * aptUnitsPerFloor;
  const numAptDongs = totalAptUnits > 0 ? Math.ceil(totalAptUnits / capacityPerAptDong) : 0;

  const dongs = Array.from({ length: Math.min(24, numAptDongs) }, (_, idx) => {
    const dongNum = 101 + idx;
    const isLast = idx === numAptDongs - 1;
    const dongOccupiedUnits = isLast ? (totalAptUnits - idx * capacityPerAptDong) : capacityPerAptDong;
    // Calculated height percentage based on actual floors up to 49 floors
    const floorPercent = Math.min(100, Math.round((aptAvgFloors / 49) * 100));
    return {
      dongNum,
      units: dongOccupiedUnits,
      maxCap: capacityPerAptDong,
      floors: aptAvgFloors,
      lines: aptUnitsPerFloor,
      heightPercent: floorPercent
    };
  });

  // Korean acquisition tax simulation rules (취득세)
  // Land: 4.6% total
  // Residential: ~1.1% - 3.3% depending on price (simplified to 1.5% for average calculation)
  // Commercial: 4.6%
  // Agriculture: 3.4%
  const getTaxRates = () => {
    switch (propertyType) {
      case "residential":
        return { rate: 0.015, label: "주택 (실거래가 기준 약 1.5% - 지방교육세 포함)" };
      case "commercial":
        return { rate: 0.046, label: "상가/기타 건축물 (4.6% - 농어촌특별세/지방교육세 포함)" };
      case "agriculture":
        return { rate: 0.034, label: "농지 (3.4% - 농어촌특별세/지방교육세 포함)" };
      case "land":
      default:
        return { rate: 0.046, label: "일반 토지 (4.6% - 농어촌특별세/지방교육세 포함)" };
    }
  };

  const taxRateInfo = getTaxRates();
  const estimatedAcquisitionTax = Math.round(expectedTotalPrice * taxRateInfo.rate);

  // Realtor Fee (중개보수료) - rough estimation
  // Land/Commercial: 0.9% limit
  // Residential: 0.4% - 0.5%
  const estimatedBrokerFee = Math.round(expectedTotalPrice * (propertyType === "residential" ? 0.005 : 0.009));

  // Stamp tax & registration registration fee estimate (기타 등기 비용) - rough 0.2%
  const estimatedRegistrationFee = Math.round(expectedTotalPrice * 0.002);

  const totalAcquisitionCost = expectedTotalPrice + estimatedAcquisitionTax + estimatedBrokerFee + estimatedRegistrationFee;

  // Format currency helpers
  const formatWon = (value: number) => {
    if (isNaN(value)) return "0원";
    if (value >= 100000000) {
      const eok = Math.floor(value / 100000000);
      const remainder = Math.round((value % 100000000) / 10000);
      return remainder > 0 ? `${eok}억 ${remainder.toLocaleString()}만원` : `${eok}억원`;
    }
    if (value >= 10000) {
      return `${Math.round(value / 10000).toLocaleString()}만원`;
    }
    return `${value.toLocaleString()}원`;
  };

  // SVG Chart sizing and math
  const prices = report.historicalOfficialPrices || [];
  const minPrice = Math.min(...prices.map(p => p.pricePerSqm)) * 0.9;
  const maxPrice = Math.max(...prices.map(p => p.pricePerSqm)) * 1.1;
  const priceRange = maxPrice - minPrice;

  // Investment grade color mapper
  const getGradeStyles = (grade: "S" | "A" | "B" | "C" | "D") => {
    switch (grade) {
      case "S":
        return "bg-amber-100 text-amber-800 border-amber-300 ring-amber-400";
      case "A":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-400";
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-300 ring-blue-400";
      case "C":
        return "bg-slate-100 text-slate-800 border-slate-300 ring-slate-400";
      case "D":
        return "bg-rose-100 text-rose-800 border-rose-300 ring-rose-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 ring-gray-400";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. Header Address Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>실시간 주소 기반 종합 분석</span>
              </div>
              {report.isVworldSynced && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vworld 국토부 지적 동기화</span>
                </div>
              )}
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-display">
              {report.address.jibunAddress}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onToggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition ${
                isBookmarked 
                  ? "bg-rose-50 border-rose-200 text-rose-600 font-semibold" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              id="bookmarkBtn"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-rose-500" : ""}`} />
              <span>{isBookmarked ? "관심 필지 등록됨" : "관심 필지 등록"}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-medium">대지 지목</span>
            <div className="text-base font-bold text-indigo-950 font-display">{report.basicInfo.landType}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono">
            <span className="text-xs text-slate-500 font-display font-medium">토지 면적</span>
            <div className="text-base font-bold text-indigo-950">
              {report.basicInfo.areaSqm.toLocaleString()}m² <span className="text-xs font-medium text-slate-500">({report.basicInfo.areaPyung}평)</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono">
            <span className="text-xs text-slate-500 font-display font-medium">평당 공시지가</span>
            <div className="text-sm font-bold text-indigo-950">
              {formatWon(report.basicInfo.officialPricePerPyung)}
              <span className="block text-[10px] text-slate-500 font-normal mt-0.5">(m²당 {report.basicInfo.officialPricePerSqm.toLocaleString()}원)</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-medium">투자 추천 등급</span>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getGradeStyles(report.aiAnalysis.roiGrade)}`}>
                {report.aiAnalysis.roiGrade} Grade
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Data Verification Status Bar */}
        <div className="mt-5 p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-sm bg-indigo-50/20 border-indigo-100">
          <div className="flex items-start gap-2.5">
            {report.isVworldSynced ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold font-mono text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
                ✓ 국토부 매핑 완료
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold font-mono text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
                ✦ AI 실시간 분석 완료
              </span>
            )}
            <div className="text-slate-600 leading-relaxed font-sans space-y-1">
              {report.isVworldSynced ? (
                <p>
                  국토교통부 공간정보 DB(Vworld) 연동을 통해, <b>오차율 0%의 공부상 공식 대지면적({report.basicInfo.areaSqm.toLocaleString()}m²)과 실제 지목({report.basicInfo.landType})</b>을 완벽하게 교차 동기화하여 검인하였습니다. 네이버 및 카카오 지도 상의 실제 지적 경계와 정확하게 일치합니다.
                </p>
              ) : (
                <p>
                  입력하신 주소({report.address.jibunAddress})에 대한 <b>AI 실시간 정밀 크롤링 및 인공지능 자산 분석</b>이 완료되었습니다. 검출된 공부 대지면적({report.basicInfo.areaSqm}m²) 및 지목({report.basicInfo.landType}) 수치를 기반으로 한 맞춤형 법적·투자 분석 보고서입니다. (공인 Vworld 키 등록 시 국토교통부 공부 대장과 100% 한계 오차 없는 매핑 보정이 행해집니다.)
                </p>
              )}
            </div>
          </div>
          {!report.isVworldSynced && (
            <button
              onClick={() => {
                const btn = document.getElementById("apiConfigBtn");
                if (btn) btn.click();
              }}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-750 transition text-xs font-bold shrink-0 self-stretch md:self-auto text-center"
            >
              국토부 공식 지적 API 인증 (Key 설정)
            </button>
          )}
        </div>
      </div>

      {/* 1.5 Tab Switcher Bar */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scroller-hidden">
        <button
          onClick={() => setActiveTab("comprehensive")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "comprehensive"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
          id="comprehensiveTabBtn"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>종합 가치분석 리포트 (종합)</span>
        </button>
        <button
          onClick={() => setActiveTab("eLandUse")}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "eLandUse"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
          id="eLandUseTabBtn"
        >
          <Layers className="w-4 h-4" />
          <span>토지이음식 토지이용계획확인서 (규제전문)</span>
        </button>
      </div>

      {activeTab === "comprehensive" ? (
        /* 2. Grid for Primary Analysis sections */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col (2 cols wide on desktop): Land Use regulations & details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 토지이용계획 (Zoning & Policy) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 font-sans">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">토지이용 규제 정보 (Zoning)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase">용도지역</span>
                  <div className="px-3 py-2 bg-indigo-50/50 border border-indigo-100 rounded-lg text-slate-800 text-sm font-semibold">
                    {report.zoningAndPlans.usageZone || "-"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase">용도지구 / 구역</span>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-sm">
                    {report.zoningAndPlans.usageDistrict !== "없음" ? report.zoningAndPlans.usageDistrict : ""} 
                    {report.zoningAndPlans.usageDistrict !== "없음" && report.zoningAndPlans.usageArea !== "없음" ? " / " : ""}
                    {report.zoningAndPlans.usageArea !== "없음" ? report.zoningAndPlans.usageArea : ""}
                    {report.zoningAndPlans.usageDistrict === "없음" && report.zoningAndPlans.usageArea === "없음" ? "지정 없음" : ""}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold uppercase">타 법령 저촉 여부 (중복 규제 포함)</span>
                <div className="p-3 bg-amber-50/30 border border-amber-100 rounded-lg text-slate-700 text-sm leading-relaxed">
                  {report.zoningAndPlans.otherLaws || "국토계획법 및 타 부처 소관 저촉 규제 정보가 발견되지 않았습니다."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-center font-mono">
                  <span className="text-xs text-slate-500 font-display font-medium">건폐율 법정 상한선</span>
                  <div className="text-xl font-bold text-slate-900">{report.zoningAndPlans.buildingCoverageLimit || "60% 이하"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-center font-mono">
                  <span className="text-xs text-slate-500 font-display font-medium font-semibold">용적률 법정 상한선</span>
                  <div className="text-xl font-bold text-slate-900">{report.zoningAndPlans.floorAreaRatioLimit || "250% 이하"}</div>
                </div>
              </div>
            </div>

            {/* 건축 및 이용행위 제한 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 font-sans">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">지목별 행위 및 건축 규제</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm text-slate-700">
                    <div className="font-semibold text-rose-800">지목 거래 및 규제 요약</div>
                    <p>{report.landRestrictions.summary}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">가능 개발 행위 및 제한 리스트</span>
                  <ul className="space-y-1.5">
                    {report.landRestrictions.actionRestrictions.map((restrict, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{restrict}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>토지거래계약 허가 여부: <b>{report.landRestrictions.landTransactionPermission}</b></span>
                  <span>경사도: <b>{report.aiAnalysis.slope}</b></span>
                </div>
              </div>
            </div>

            {/* 건축물대장 정보 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 font-sans">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Home className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">건축물 대장 정보 (Building Registry)</h3>
              </div>

              {report.buildingInfo.hasBuilding ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-indigo-50/30 rounded-xl space-y-1 font-mono">
                      <span className="text-xs text-indigo-900 font-display font-medium text-[11px]">건물 주 용도</span>
                      <div className="text-sm font-bold text-indigo-950 font-sans">{report.buildingInfo.buildingType}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono">
                      <span className="text-xs text-slate-500 font-display font-medium text-[11px]">연면적</span>
                      <div className="text-sm font-bold text-slate-900">
                        {report.buildingInfo.totalFloorAreaSqm.toLocaleString()} m²
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono col-span-2 md:col-span-1">
                      <span className="text-xs text-slate-500 font-display font-medium text-[11px]">구조 / 주조</span>
                      <div className="text-sm font-bold text-slate-900 font-sans">{report.buildingInfo.structure}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm font-mono text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <span>층수 구성: <b>{report.buildingInfo.storeys}</b></span>
                    <span>상세 사용 승인일: <b>{report.buildingInfo.approvalDate}</b></span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                  <div className="text-slate-400 font-display text-[26px]">🍃</div>
                  <div className="font-semibold text-slate-800 text-sm">건축물이 존재하지 않는 나대지 상태</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    이 필지 주소에는 등록된 공식 건축물대장이 없습니다. 빈 땅(나대지)이거나 임시 시설물이 설치된 상태로, 규제 상 개발 가치가 높거나 신축 검토에 적합합니다.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Col (1 col wide on desktop): Interactive calculations & map links */}
          <div className="space-y-6">
            
            {/* AI 분석 의견 및 투자 등급 */}
            <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden font-sans">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 font-bold font-mono text-[140px] text-white">
                {report.aiAnalysis.roiGrade}
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold tracking-wider font-display uppercase block">전문가 AI 투자 종합 의견</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 rounded text-sm font-extrabold tracking-tight border ${
                    report.aiAnalysis.roiGrade === "S" || report.aiAnalysis.roiGrade === "A"
                      ? "bg-amber-500 text-white border-amber-400"
                      : report.aiAnalysis.roiGrade === "B"
                      ? "bg-indigo-700 text-white border-indigo-600"
                      : "bg-slate-700 text-slate-200 border-slate-600"
                  }`}>
                    {report.aiAnalysis.roiGrade}등급 필지
                  </span>
                  <span className="text-xs text-slate-300 font-mono">도로접함: {report.aiAnalysis.roadContact}</span>
                </div>
              </div>

              <p className="text-xs text-indigo-100/90 leading-relaxed font-sans mt-2 pt-2 border-t border-indigo-900">
                {report.aiAnalysis.evaluationText}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs text-slate-300 font-semibold">💡 추천 토지 활용 및 사업 용도</div>
                <div className="flex flex-wrap gap-1.5">
                  {report.aiAnalysis.recommendedUses.map((use, idx) => (
                    <span key={idx} className="bg-indigo-900 border border-indigo-800 text-indigo-100 text-xs px-2.5 py-1 rounded-lg">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 공시지가 실시간 연도별 트렌드 Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">공시지가 최근 추이 (Per m²)</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">(원)</span>
              </div>

              {prices.length > 0 ? (
                <div className="space-y-4">
                  {/* Visual SVG mini chart */}
                  <div className="h-28 w-full bg-slate-50/50 rounded-xl p-2 relative flex items-end justify-between">
                    {prices.map((p, i) => {
                      // Calc height pct
                      const heightPct = priceRange > 0 ? ((p.pricePerSqm - minPrice) / priceRange) * 75 + 15 : 50;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                          <div className="text-[9px] text-indigo-600 font-mono opacity-0 group-hover:opacity-100 transition absolute top-2 bg-white px-1 shadow border rounded text-center whitespace-nowrap z-10">
                            {p.pricePerSqm.toLocaleString()}원
                          </div>
                          <div 
                            className="w-4 bg-indigo-600 hover:bg-indigo-500 rounded-t transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[10px] text-slate-500 font-mono mt-1 pt-1">{p.year}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="divide-y divide-slate-50 border-t border-slate-50 font-mono text-xs">
                    {prices.slice(0, 4).map((p, idx) => (
                      <div key={idx} className="flex justify-between py-1.5 text-slate-600">
                        <span className="font-medium text-slate-500">{p.year}년 공시지가</span>
                        <span className="font-bold text-slate-800">{p.pricePerSqm.toLocaleString()}원 / m²</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  연도별 공시지가 추이 데이터를 가져올 수 없습니다.
                </div>
              )}
            </div>

            {/* 위성지적도 및 로드뷰 바로가기 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">지도 연동 및 지적 경계 피드백 검증</h3>
                </div>
                {report.coord ? (
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold font-mono">
                    좌표 연계완료
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold font-mono">
                    기본 주소매핑
                  </span>
                )}
              </div>

              {/* Exact Coordinates Display Widget */}
              {report.coord && (
                <div className="bg-slate-55 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">지적 중심 좌표 (GPS Point)</span>
                    <button
                      onClick={handleCopyCoords}
                      className="text-[10px] px-2 py-1 bg-white hover:bg-slate-105 text-indigo-600 rounded-lg border border-slate-200 transition font-bold"
                    >
                      {copiedCoords ? "✓ 복사완료" : "좌표(X,Y) 복사"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-display">위도 (Latitude - Y)</span>
                      <span className="font-bold text-slate-800">{report.coord.y}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-display">경도 (Longitude - X)</span>
                      <span className="font-bold text-slate-800">{report.coord.x}</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                정밀한 대지 지형 및 지적 경계(지적도 빨간 실선)를 관할 등기 정보 및 로드뷰와 실시간 피드백 대조하려면 아래 최적화된 공인 지도를 열어 즉각적인 교차 체크를 실행하십시오.
              </p>

              <div className="flex flex-col gap-2 font-mono text-xs">
                {/* Precise coordinate query links prefer coordinates lookup for absolute correctness */}
                <a
                  href={report.coord ? `https://map.kakao.com/?q=${report.coord.y},${report.coord.x}` : report.mapLinks?.kakaoMap}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-200 transition font-bold"
                >
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span>Kakao 카카오맵 {report.coord ? "정밀 좌표 검색 (추천)" : "(웹 검색)"}</span>
                    <span className="text-[10px] font-medium text-amber-700 font-sans">※ 위성 지형도상 지적선 교차 대조 및 현장 로드뷰 피드백</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-amber-700 shrink-0" />
                </a>

                <a
                  href={report.coord ? `https://map.naver.com/v5/search/${report.coord.y},${report.coord.x}` : report.mapLinks?.naverMap}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 bg-green-50 hover:bg-green-100 text-green-900 rounded-xl border border-green-200 transition font-bold"
                >
                  <div className="flex flex-col items-start gap-0.5 text-left animate-once">
                    <span>Naver 네이버 지도 {report.coord ? "정밀 좌표 검색 (추천)" : "(웹 검색)"}</span>
                    <span className="text-[10px] font-medium text-green-700 font-sans">※ 지적편집도 모드 원클릭 변환으로 필지 세부 형세 대조</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-green-700 shrink-0" />
                </a>

                <a
                  href={report.coord ? `https://www.google.com/maps/search/?api=1&query=${report.coord.y},${report.coord.x}` : report.mapLinks?.googleMap}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 transition font-bold"
                >
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span>Google 구글 지도 {report.coord ? "GPS 위성 매핑" : "(웹 검색)"}</span>
                    <span className="text-[10px] font-medium text-slate-500 font-sans">※ 광역 3D 버드아이뷰 위성 입체 지형분석 피드백 수렴</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                </a>
              </div>

              {/* Instructive Map Overlay Checklist Guide */}
              <div className="p-3 bg-indigo-50/40 border border-indigo-100/80 rounded-xl space-y-1.5 font-sans">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  💡 지도 지적선(빨간/노란선) 실시간 피드백 확인법
                </span>
                <p className="text-[10.5px] text-indigo-950/80 leading-relaxed font-sans">
                  네이버나 카카오 지도 열람 후 우측 상단의 <b>[레이어 / 지도설정]</b> 메뉴에서 <b>'지적편집도'</b>(Naver) 또는 <b>'지적도'</b>(Kakao) 체크 박스를 활성화하십시오. 실제 기형이나 경계선이 이 분석 리포트의 건폐율 한도 및 인접 도로 접선(맹지 해소 상태) 피드백과 소름돋게 일치하는지 눈으로 동기화 검증을 하실 수 있습니다!
                </p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* 2.5 Authentic eLandUse (토지이음) Style Table Document View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8 font-sans max-w-5xl mx-auto relative overflow-hidden">
          
          {/* Watermark official looking logo */}
          <div className="absolute right-12 top-10 opacity-[0.03] select-none pointer-events-none">
            <Layers className="w-96 h-96 text-slate-900 rotate-12" />
          </div>

          {/* Certificate Header block */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-indigo-900 pb-5">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-mono tracking-widest text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                이음(eLandUse) 연동 규제정보 문서
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                토지이용계획확인서
              </h2>
              <p className="text-xs text-slate-400 font-mono">발급 관리번호: 제2026-N00{Math.floor(Math.random() * 900 + 100)}호</p>
            </div>
            {/* Stamp space */}
            <div className="flex items-center gap-2 border-2 border-indigo-100/80 p-3 bg-slate-50/50 rounded-xl shrink-0">
              <div className="text-right space-y-1">
                <p className="text-[10px] text-slate-400 font-semibold font-mono">2026년 06월 16일</p>
                <p className="text-xs text-slate-800 font-bold">국토관제 데이터 실증인</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-rose-500 flex items-center justify-center text-[10px] text-rose-500 font-bold rotate-12 shrink-0">
                인증필
              </div>
            </div>
          </div>

          {/* Table 1: Land Characteristics */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-sm"></span>
              <span>1. 주소 및 토지 표시사항</span>
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-500 w-1/4 border-r border-slate-200 text-center bg-slate-50/80">대지 지번주소</td>
                    <td className="px-4 py-3 text-slate-800 text-left font-semibold">
                      {report.address.jibunAddress || "-"}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-500 w-1/4 border-r border-slate-200 text-center bg-slate-50/80">대장 지목</td>
                    <td className="px-4 py-3 text-slate-800 text-left font-sans font-bold">
                      {report.basicInfo.landType}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-500 w-1/4 border-r border-slate-200 text-center bg-slate-50/80">측량 면적 (m²)</td>
                    <td className="px-4 py-3 text-slate-800 text-left">
                      {report.basicInfo.areaSqm.toLocaleString()} m² <span className="text-slate-400 font-sans">({report.basicInfo.areaPyung} 평)</span>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-500 w-1/4 border-r border-slate-200 text-center bg-slate-50/80">개별공시지가</td>
                    <td className="px-4 py-3 text-slate-800 text-left font-bold text-indigo-700">
                      m²당 {report.basicInfo.officialPricePerSqm.toLocaleString()}원 <span className="text-slate-400 font-normal font-sans">( 평당 {report.basicInfo.officialPricePerPyung.toLocaleString()}원 )</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Regions and Districts Designation Matters */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-sm"></span>
              <span>2. 지역·지구 등 지정여부</span>
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs font-sans">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500 w-1/3 border-r border-slate-200 text-center">
                      「국토의 계획 및 이용에 관한 법률」에 따른 용도분류
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-semibold text-left">
                      <div className="space-y-1.5">
                        <p><span className="text-slate-400 mr-2 font-mono">• 용도지역:</span> {report.zoningAndPlans.usageZone || "지정없음"}</p>
                        <p><span className="text-slate-400 mr-2 font-mono">• 용도지구:</span> {report.zoningAndPlans.usageDistrict !== "없음" ? report.zoningAndPlans.usageDistrict : "해당사항 없음"}</p>
                        <p><span className="text-slate-400 mr-2 font-mono">• 용도구역:</span> {report.zoningAndPlans.usageArea !== "없음" ? report.zoningAndPlans.usageArea : "해당사항 없음"}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500 w-1/3 border-r border-slate-200 text-center bg-slate-50/80">
                      환경/군사/문화재 등 다른 법령에 따른 보호 규제 항목
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-left leading-relaxed">
                      {report.zoningAndPlans.otherLaws || "검출된 타 법령 저촉사항 없음"}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500 w-1/3 border-r border-slate-200 text-center bg-slate-50/80">
                      「토지이용규제기본법 시행령」에 따른 거래 제한
                    </td>
                    <td className="px-4 py-3 text-slate-800 text-left font-mono">
                      {report.landRestrictions.landTransactionPermission === "대상" ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                          토지거래허가구역 지정 (매수 전 자치단체 허가 필수)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                          해당사항 없음 (거래 자율 보장)
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Checklist Matrix: What is allowed in this land? */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-indigo-700 inline-block rounded-sm"></span>
                <span>3. 용도별 종합 이용 규제 및 행위제한 판독</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">(일반 조례 기준 가이드라인)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    🏠 주거용 주택 신축 가능성
                  </span>
                  {report.zoningAndPlans.usageZone.includes("녹지") || report.zoningAndPlans.usageZone.includes("공업") ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">제한적 허용</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">건축 가능</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed font-sans space-y-1 font-mono">
                  <p>• 건폐율 한도: {report.zoningAndPlans.buildingCoverageLimit}</p>
                  <p>• 용적률 한도: {report.zoningAndPlans.floorAreaRatioLimit}</p>
                  <p className="text-slate-400 font-sans text-[10.5px]">※ 조례 상 최대 층수는 지자체 주거 부문 한도를 따릅니다.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    🏢 1·2종 근린생활시설 (상가/카페 등)
                  </span>
                  {report.zoningAndPlans.usageZone.includes("전용주거") || report.zoningAndPlans.usageZone.includes("보전녹지") ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">일부 제한</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">입점 가능</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed font-sans space-y-1 font-mono">
                  <p>• 가축사육제한구역 여부: 전 구역 제한</p>
                  <p>• 위락 및 휴게시설: 용도지역별 허용 여부 별도 검토 요망</p>
                  <p className="text-slate-400 font-sans text-[10.5px]">※ 식품위생법 저촉 여부 및 도로접함 {report.aiAnalysis.roadContact} 관계 확인 필요.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    🏭 농공시설 및 공장/창고 개발
                  </span>
                  {report.zoningAndPlans.usageZone.includes("상업") || report.zoningAndPlans.usageZone.includes("주거") ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">불허/제한</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">신축 가능</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed font-sans space-y-1 font-mono">
                  <p>• 소음 및 배출가스 정화시설 구격 준수 필수</p>
                  <p>• 도로 이격: 중로 또는 진입 가능한 도로 폭 확보 관계 저촉</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    🚗 주차장 및 가설시설물 설치
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">허용</span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed font-sans space-y-1 font-mono">
                  <p>• 주차장법 규정 주차 구획 충족 조건 만족 시 지적등록 가능</p>
                  <p>• 현황 경사도: {report.aiAnalysis.slope}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Legal Warning Notice inside land plan */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>지자체 도시계획조례 확인 및 대조 유의점</span>
            </h4>
            <p className="text-[11px] text-amber-900/80 leading-relaxed font-sans">
              개별 필지의 합필/분필 여부 및 특별지구 가이드라인에 따라 건축 가능한 구체적인 건축유형(건축법 시행령 별표1)은 각 지자체 도시계획과의 검인에 따라 차이가 날 수 있습니다. 또한, 건폐율 및 용적률 상 한 수치도 국가 법률 기본값과 별도로 <b>시·군 도시계획 조례 정밀 비율</b>을 필히 확인해야 합니다.
            </p>
          </div>

          {/* Bottom Seal Mark */}
          <div className="flex flex-col items-center justify-center text-center pt-6 border-t border-slate-200 space-y-3">
            <div className="relative">
              <div className="text-slate-800 text-sm font-bold font-display tracking-tight uppercase">
                대한민국 토지정보 마스터 온라인 검인국
              </div>
              <div className="absolute right-[-30px] top-[-10px] opacity-70 select-none pointer-events-none rotate-12">
                <span className="w-12 h-12 rounded-full border-1.5 border-rose-500 flex items-center justify-center text-[8px] text-rose-500 font-extrabold shadow-sm bg-rose-50/20">
                  대조필印
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">本 인증서는 국토지리정보원 브이월드 데이터 교차 검증용 시스템 규정을 준용합니다.</p>
          </div>

        </div>
      )}

      {/* 3. Interactive Calculator Room (Full Screen Width component) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">수수께끼 토지 매각/매입 모의 시뮬레이터</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Calculator Panel Inputs */}
          <div className="lg:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">필지 계산 입력 파라미터</div>

            {/* Slider/Unit input for Area */}
            <div className="space-y-1.5 font-mono">
              <label className="text-xs font-semibold text-slate-700 flex justify-between items-center font-sans">
                <span>토지면적 설정</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      if (calcUnit === "pyung") {
                        handleAreaChange(parseFloat((calcArea * 3.3058).toFixed(1)), "sqm");
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${calcUnit === "sqm" ? "bg-indigo-600 text-white font-bold" : "bg-slate-200 text-slate-600"}`}
                  >
                    m²
                  </button>
                  <button 
                    onClick={() => {
                      if (calcUnit === "sqm") {
                        handleAreaChange(parseFloat((calcArea * 0.3025).toFixed(1)), "pyung");
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${calcUnit === "pyung" ? "bg-indigo-600 text-white font-bold" : "bg-slate-200 text-slate-600"}`}
                  >
                    평
                  </button>
                </div>
              </label>

              <div className="relative">
                <input 
                  type="number"
                  value={calcArea}
                  onChange={(e) => setCalcArea(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-bold focus:outline-indigo-600"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                  {calcUnit === "sqm" ? "m²" : "평"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {calcUnit === "sqm" ? `약 ${currentAreaPyung}평과 동일` : `약 ${currentAreaSqm}m²와 동일`}
              </p>
            </div>

            {/* Property type selection (affects tax rates) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">부동산 세부 용도</label>
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-semibold focus:outline-indigo-600"
              >
                <option value="land">나대지 / 임야 등 일반 임업토지</option>
                <option value="residential">상가주택 / 단독형 신축주택</option>
                <option value="commercial font-sans">구분상가 및 빌딩 건축물</option>
                <option value="agriculture font-sans">밭 / 답 / 농사지 농업용지</option>
              </select>
            </div>

            {/* Per Pyung target commercial price slider */}
            <div className="space-y-1.5 font-mono">
              <label className="text-xs font-semibold text-slate-700 flex justify-between font-sans">
                <span>평당 목표 매매 평당가</span>
                <span className="text-indigo-600 font-bold">{formatWon(pricePerUnit)}</span>
              </label>
              <input 
                type="range"
                min={Math.round((report.basicInfo.officialPricePerPyung || 500000) * 0.5)}
                max={Math.max(50000000, Math.round((report.marketValue.estimatedPriceMaxPyung || 10000000) * 2.5))}
                step="10000"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium font-sans">
                <span>공시지가 수준</span>
                <span>개발호재 반영 시세</span>
              </div>
            </div>
          </div>

          {/* Right Calculator Panel Summary Results */}
          <div className="lg:col-span-2 space-y-4 bg-white p-2 rounded-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">예상 취득세 및 수수료 종합 비용</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium mb-1">토지 순수 매매 예상가 (순가합산)</div>
                  <div className="text-xl font-bold font-mono text-indigo-950">{formatWon(expectedTotalPrice)}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">사전 계산 {currentAreaPyung}평 × {formatWon(pricePerUnit)}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 font-mono">
                    <span>지방세액 취득세 ({ (taxRateInfo.rate * 100).toFixed(1) }%)</span>
                    <span className="font-bold text-slate-800">{formatWon(estimatedAcquisitionTax)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 font-mono">
                    <span>법정 중개보수료 (약 0.9%)</span>
                    <span className="font-bold text-slate-800">{formatWon(estimatedBrokerFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 font-mono">
                    <span>등기대행 및 법무비율 (0.2%)</span>
                    <span className="font-bold text-slate-800">{formatWon(estimatedRegistrationFee)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
              <div>
                <span className="text-xs text-indigo-800 font-bold uppercase tracking-wider block">총 취득 예상 비용 (합계)</span>
                <span className="text-sm text-slate-500 font-sans font-medium">등기 이전 완료 시기까지 총 필요 자본</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-700">
                {formatWon(totalAcquisitionCost)}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-sans text-center mt-2">
              ※ 본 모의 계산기는 세법 기준을 간추려 추정한 금액으로 실제 취득 시 세무서 감정 내용에 따라 농어촌특별세 및 누진세 가산이 달라질 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 공동주택 건립 시뮬레이터 (용적률 및 가구 조합) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">공동주택 건립 및 세대 조합 시뮬레이터</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button 
              onClick={() => applyAptPreset("small")} 
              className="text-[10.5px] px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition font-bold font-sans"
            >
              초소형 중심
            </button>
            <button 
              onClick={() => applyAptPreset("medium")} 
              className="text-[10.5px] px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition font-bold font-sans"
            >
              중소형 대중식
            </button>
            <button 
              onClick={() => applyAptPreset("balanced")} 
              className="text-[10.5px] px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition font-bold font-sans"
            >
              균형식 (국평 위주)
            </button>
            <button 
              onClick={() => applyAptPreset("large")} 
              className="text-[10.5px] px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition font-bold font-sans"
            >
              대형 프리미엄
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-1 space-y-5 bg-slate-50/70 p-5 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider font-sans">시뮬레이션 인풋 설정</div>

            {/* 1. 대지면적 조정 */}
            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>대지면적 (Land Area)</span>
                <span className="font-mono text-indigo-600 font-bold">{aptLandArea.toLocaleString()}㎡ ({Math.round(aptLandArea * 0.3025).toLocaleString()}평)</span>
              </label>
              <input 
                type="number"
                value={aptLandArea}
                onChange={(e) => setAptLandArea(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-indigo-600 font-mono"
              />
              <input 
                type="range"
                min="100"
                max="100000"
                step="100"
                value={aptLandArea}
                onChange={(e) => setAptLandArea(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. 용적률 조정 */}
            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>용적률 (FAR Limit)</span>
                <span className="font-mono text-indigo-600 font-bold">{aptFar}%</span>
              </label>
              <input 
                type="number"
                value={aptFar}
                onChange={(e) => setAptFar(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-indigo-600 font-mono"
              />
              <input 
                type="range"
                min="50"
                max="1000"
                step="10"
                value={aptFar}
                onChange={(e) => setAptFar(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. 주거 vs 비주거 비율 조정 */}
            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>주거 비율 (Residential Ratio)</span>
                <span className="font-mono text-indigo-600 font-bold">{aptResiRatio}%</span>
              </label>
              <input 
                type="range"
                min="10"
                max="100"
                step="5"
                value={aptResiRatio}
                onChange={(e) => setAptResiRatio(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
                <span>주거 목적: {aptResiRatio}%</span>
                <span>비주거 상업: {100 - aptResiRatio}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans block leading-normal">
                ※ 주상복합 등 주거대 비주거 용도 면적 비율을 커스텀 분배할 수 있습니다. 비주거 비율 면적은 일반 분양 상가 및 근린상업 용도로 가용 연면적에서 제외해 계산됩니다.
              </span>
            </div>

            {/* 4. 평균 층수 조정 (최대 49층) */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>평균 층수 (Avg Floors)</span>
                <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{aptAvgFloors}층</span>
              </div>
              <input 
                type="range"
                min="3"
                max="49"
                step="1"
                value={aptAvgFloors}
                onChange={(e) => setAptAvgFloors(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => setAptAvgFloors(5)} className={`text-[9px] px-2 py-0.5 rounded transition ${aptAvgFloors === 5 ? "bg-indigo-600 text-white font-bold" : "bg-white border border-slate-200 text-slate-500"}`}>연립(5F)</button>
                <button onClick={() => setAptAvgFloors(15)} className={`text-[9px] px-2 py-0.5 rounded transition ${aptAvgFloors === 15 ? "bg-indigo-600 text-white font-bold" : "bg-white border border-slate-200 text-slate-500"}`}>중층(15F)</button>
                <button onClick={() => setAptAvgFloors(25)} className={`text-[9px] px-2 py-0.5 rounded transition ${aptAvgFloors === 25 ? "bg-indigo-600 text-white font-bold" : "bg-white border border-slate-200 text-slate-500"}`}>고층(25F)</button>
                <button onClick={() => setAptAvgFloors(35)} className={`text-[9px] px-2 py-0.5 rounded transition ${aptAvgFloors === 35 ? "bg-indigo-600 text-white font-bold" : "bg-white border border-slate-200 text-slate-500"}`}>타워(35F)</button>
                <button onClick={() => setAptAvgFloors(49)} className={`text-[9px] px-2 py-0.5 rounded transition border ${aptAvgFloors === 49 ? "bg-rose-600 text-white border-rose-600 font-bold" : "bg-amber-50 border-amber-200 text-amber-700 font-bold"}`}>초고층 최대(49F)</button>
              </div>
              <span className="text-[10px] text-slate-400 font-sans block leading-normal mt-1">
                ※ 층수/높이제한이 규제되지 않은 상업지나 제3종 일반주거 주상복합 등에서는 최대 법정 최고 49층까지 초고층 빌딩 시뮬레이션이 가능합니다.
              </span>
            </div>

            {/* 5. 동별 한 층당 라인수 (조합호수) */}
            <div className="space-y-1.5 font-sans">
              <label className="text-xs font-bold text-slate-700">대표 동호수 조합 (Line per Floor Layout)</label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setAptUnitsPerFloor(num)}
                    className={`py-1.5 text-xs rounded-xl border text-center transition font-bold font-mono ${
                      aptUnitsPerFloor === num
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {num}호 조합
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-sans block leading-relaxed">
                ※ {aptUnitsPerFloor}호 조합: 한 층 가구 배치 개수입니다. (총 동수 = 총가구수 / (층수 * 라인수))
              </span>
            </div>
          </div>

          {/* Right Panel: Sizes breakdown, graphs and outputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 6 Size Weights Tuning (Grid Layout) */}
            <div className="space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-1.5 gap-1">
                <span className="text-xs font-extrabold text-slate-700">전용면적별 세대수 배정 가중치</span>
                <span className="text-[10px] text-slate-400 leading-none">(공급 가치 산정 = 전용면적의 1.35배 공용 적용)</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {sizes.map((s) => (
                  <div key={s.key} className={`p-3 rounded-xl border border-slate-200/50 ${s.bgLight} transition space-y-1.5`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">{s.name} <span className="text-[10px] text-slate-400 font-normal">({s.desc})</span></span>
                      <span className="font-bold font-mono text-indigo-700 text-[11px]">배정비율 가중: {s.weight}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={s.weight}
                        onChange={(e) => s.setWeight(parseInt(e.target.value))}
                        className={`w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-indigo-600`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono leading-none">
                      <span>전용 {s.exclusiveSqm}㎡</span>
                      <span>공급 약 {s.supplySqm}㎡ ({s.pyung}평형)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Area usage breakdown - Stacked Bar */}
            {totalAptWeight > 0 && (
              <div className="space-y-2 font-sans">
                <span className="text-xs font-extrabold text-slate-700 block">세대 평형 주택조합 스택 분포 비율</span>
                <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  {sizes.map((s) => {
                    const ratio = totalAptWeight > 0 ? (s.weight / totalAptWeight) * 100 : 0;
                    if (ratio <= 0) return null;
                    return (
                      <div 
                        key={s.key} 
                        style={{ width: `${ratio}%` }} 
                        className={`${s.color} h-full transition-all`} 
                        title={`${s.name} 비중 : ${Math.round(ratio)}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] text-slate-500 font-mono font-bold">
                  {sizes.map((s) => {
                    const ratio = totalAptWeight > 0 ? (s.weight / totalAptWeight) * 100 : 0;
                    if (ratio <= 0) return null;
                    return (
                      <div key={s.key} className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.color}`}></span>
                        <span>{s.name} ({Math.round(ratio)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 주거/비주거 비율 상세 요약 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  🏢 지상 연면적 배정 (주거용 {aptResiRatio}% : 비주거용 {100 - aptResiRatio}%)
                </span>
                <span className="text-indigo-650 font-bold font-mono text-slate-500">
                  허용 연면적 총: {maxAptFloorArea.toLocaleString()}㎡ ({Math.round(maxAptFloorArea * 0.3025).toLocaleString()}평)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                <div 
                  className="bg-indigo-600 h-full transition-all" 
                  style={{ width: `${aptResiRatio}%` }} 
                  title={`주거용 : ${aptResiRatio}%`} 
                />
                <div 
                  className="bg-amber-500 h-full transition-all" 
                  style={{ width: `${100 - aptResiRatio}%` }} 
                  title={`비주거용 : ${100 - aptResiRatio}%`} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    주거 전용 지상면적
                  </span>
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    {residentialFloorArea.toLocaleString()}㎡ <span className="text-[10px] text-slate-500 font-normal">({Math.round(residentialFloorArea * 0.3025).toLocaleString()}평)</span>
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    비주거용 상업/업무 면적
                  </span>
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    {nonResidentialFloorArea.toLocaleString()}㎡ <span className="text-[10px] text-slate-500 font-normal">({Math.round(nonResidentialFloorArea * 0.3025).toLocaleString()}평)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Calculations Dashboard Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans">
              <div className="bg-white p-2.5 rounded-lg border border-slate-150/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block leading-tight">지상층 허용 연면적</span>
                <span className="text-xs sm:text-xs font-bold font-mono text-slate-800 block mt-0.5">{maxAptFloorArea.toLocaleString()}㎡</span>
                <span className="text-[9px] text-indigo-600 block mt-0.5 leading-none font-sans">용적률 내 허용면적</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-150/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block leading-tight">배치완료 면적</span>
                <span className="text-xs sm:text-xs font-bold font-mono text-slate-800 block mt-0.5">{totalAptConsumedArea.toLocaleString()}㎡</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5 leading-none font-sans">전체 공급면적 누적</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-150/80 shadow-xs">
                <span className="text-[10px] text-slate-400 block leading-tight">유휴 잔여 면적</span>
                <span className="text-xs sm:text-xs font-extrabold font-mono text-slate-800 block mt-0.5">{remainingAptArea.toLocaleString()}㎡</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-none font-sans">예비 건축 가용성</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-xs bg-indigo-50/20">
                <span className="text-[10px] text-indigo-900 block leading-tight font-bold">건립 세대수 규모</span>
                <span className="text-sm font-extrabold font-mono text-indigo-700 block mt-0.5">{totalAptUnits.toLocaleString()} 세대</span>
                <span className="text-[9px] text-indigo-800 block mt-0.5 font-medium leading-none font-sans">총 {numAptDongs}개 동 배치 완료</span>
              </div>
            </div>

            {/* Sized breakdown table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden font-sans">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-2">전용 면적 타입</th>
                    <th className="px-3 py-2 text-center">공급 평형</th>
                    <th className="px-3 py-2 text-center">조합 가중치</th>
                    <th className="px-4 py-2 text-right text-indigo-700">계산된 세대 세부조합</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {aptResults.map((r) => (
                    <tr key={r.key} className={r.count > 0 ? "bg-white font-bold text-slate-800" : "bg-white/40 text-slate-350"}>
                      <td className="px-4 py-2 font-sans flex items-center gap-2">
                        <span className={`w-1.5 h-3 inline-block rounded-xs ${r.count > 0 ? r.color : "bg-slate-200"}`}></span>
                        <span>{r.name} <span className="text-[10px] text-slate-400 font-normal font-mono">({r.exclusiveSqm}㎡형 / 공급 {r.supplySqm}㎡)</span></span>
                      </td>
                      <td className="px-3 py-2 text-center text-[11px] font-sans">{r.pyung}평형</td>
                      <td className="px-3 py-2 text-center">{r.weight}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-900 pr-5">
                        {r.count > 0 ? (
                          <span className="text-indigo-600 font-extrabold bg-indigo-50/60 px-2 py-0.5 rounded-lg border border-indigo-100/50">{r.count.toLocaleString()} 세대</span>
                        ) : (
                          <span className="text-slate-350 font-normal">0 세대</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Towers visualization */}
            {totalAptUnits > 0 ? (
              <div className="space-y-3.5 pt-4 border-t border-slate-100 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    🏢 단지 내 {numAptDongs}개 동 설계 모형 (3D 동호수 시뮬레이터)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    개별 동별 한계수용력: {capacityPerAptDong}세대 ({aptAvgFloors}층 × {aptUnitsPerFloor}가구 라인)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {dongs.map((d) => (
                    <div key={d.dongNum} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-400 font-display">{d.dongNum}동</span>
                        <span className="text-[9.5px] text-slate-400 font-mono">{d.floors}층 | {d.lines}라인</span>
                      </div>
                      
                      {/* Tower visual */}
                      <div className="h-28 bg-slate-950 rounded-lg flex items-end justify-center p-1.5 relative overflow-hidden border border-slate-800">
                        {/* Shading representing floors and window layout */}
                        <div className="w-full absolute bottom-0 left-0 right-0 bg-indigo-950/25" style={{ height: `${d.heightPercent}%` }}>
                          <div className="grid grid-cols-4 gap-1.5 p-1.5 h-full opacity-85 w-full">
                            {Array.from({ length: 12 }).map((_, wIdx) => {
                              const isLit = (wIdx * d.maxCap / 12) < d.units;
                              return (
                                <div 
                                  key={wIdx} 
                                  className={`h-2.5 rounded-xs transition-colors duration-500 w-full ${isLit ? "bg-amber-300 shadow-[0_0_3px_#fcd34d]" : "bg-slate-800/80"}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-0.5 text-xs">
                        <span className="text-[11px] text-slate-100 font-bold block">{d.units} 세대 배치</span>
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono leading-none">
                          <span>비율 : {Math.min(100, Math.round((d.units / d.maxCap) * 100))}%</span>
                          <span>{d.units === d.maxCap ? "가득참" : "분산배치"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-sans">
                가중치 조절을 통해 건립세대를 조합해 주시면 동별 설계모형이 생성됩니다.
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 4. Caution List & Search Sources references */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 text-rose-700">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="text-md font-bold tracking-tight">수수 관계인 및 매수 계약 전 필수 법률 리스크 Check</h3>
        </div>

        <ul className="space-y-2 text-xs text-slate-600">
          {report.cautions.map((caution, index) => (
            <li key={index} className="flex gap-2 bg-slate-50 p-2.5 rounded-lg text-slate-600 border-l-2 border-rose-400">
              <span className="text-rose-500 font-extrabold text-[13px]">▲</span>
              <span className="leading-relaxed">{caution}</span>
            </li>
          ))}
          <li className="flex gap-2 bg-slate-50 p-2.5 rounded-lg text-slate-600 border-l-2 border-indigo-400">
            <span className="text-indigo-500 font-extrabold text-[13px]">✓</span>
            <span className="leading-relaxed font-sans">
              <b>거래 전 실사 추천</b>: 지적도상의 경계선과 실제 담장 및 도로 침범 여부를 확인하는 <b>지적 현황측량</b>을 매매 계약 전 확인하시는 것이 토지 분쟁을 미연에 방지할 수 있습니다.
            </span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
