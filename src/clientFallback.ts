import { LandPropertyReport } from "./types";

export function generateClientFallback(address: string): LandPropertyReport {
  const isGangnam = address.includes("역삼") || address.includes("테헤란로") || address.includes("강남");
  const isBusan = address.includes("마린시티") || address.includes("해운대") || address.includes("우동");
  const isJeju = address.includes("제주") || address.includes("제주시") || address.includes("공항로");
  const isGangneung = address.includes("강릉") || address.includes("경포");
  const isBaegot191 = address.includes("배곧동 191") || address.includes("배곧동191") || address.includes("배곧 운동장");
  const isKwangwoon = address.includes("월계동") || address.includes("화랑로45길") || address.includes("월계동 85");

  let roadAddress = address;
  let jibunAddress = address;
  let landType = "대 (대지)";
  let areaSqm = 330;
  let officialPricePerSqm = 4500000;
  let ownershipType = "개인 (단독소유)";
  let usageZone = "제2종일반주거지역";
  let buildingCoverageLimit = "60% 이하";
  let floorAreaRatioLimit = "200% 이하";
  let hasBuilding = true;
  let buildingType = "제2종근린생활시설 및 다세대주택";
  let totalFloorAreaSqm = 480;
  let storeys = "지상 3층 / 지하 1층";
  let roiGrade: "S" | "A" | "B" | "C" | "D" = "B";
  let roadContact = "소로2류(폭 8M-10M) 접함";
  let slope = "평지";
  let estMinSqm = 12000000;
  let estMaxSqm = 15000000;
  const cautions: string[] = [];

  if (isGangnam) {
    roadAddress = "서울특별시 강남구 테헤란로 152 (역삼동)";
    jibunAddress = "서울특별시 강남구 역삼동 737";
    landType = "대 (대지)";
    areaSqm = 11728;
    officialPricePerSqm = 48500000;
    ownershipType = "법인 (공동소유)";
    usageZone = "일반상업지역";
    buildingCoverageLimit = "60% 이하";
    floorAreaRatioLimit = "800% 이하";
    hasBuilding = true;
    buildingType = "업무 및 판매복합시설 (강남파이낸스센터)";
    totalFloorAreaSqm = 212500;
    storeys = "지상 45층 / 지하 8층";
    roiGrade = "S";
    roadContact = "광대로3류(폭 40M-50M)접함";
    slope = "평지";
    estMinSqm = 145000000;
    estMaxSqm = 172000000;
    cautions.push("테헤란로 중심 업무지구 중심권으로 서울 최고 수준의 지가 보유 필지입니다.");
    cautions.push("지하에 광선 통신선 및 지하철 2호선 터널 구조물 저촉 사안에 의하여 인근 지하 연계 보강 구역 지정을 반드시 확인하십시오.");
  } else if (isBusan) {
    roadAddress = "부산광역시 해운대구 마린시티2로 38 (우동)";
    jibunAddress = "부산광역시 해운대구 우동 1408";
    landType = "대 (대지)";
    areaSqm = 32540;
    officialPricePerSqm = 18450000;
    ownershipType = "공동소유 (집합건물)";
    usageZone = "일반상업지역";
    buildingCoverageLimit = "60% 이하";
    floorAreaRatioLimit = "1000% 이하";
    hasBuilding = true;
    buildingType = "아파트 및 제2종근린생활시설 (해운대 주상복합 타워)";
    totalFloorAreaSqm = 245000;
    storeys = "지상 72층 / 지하 6층";
    roiGrade = "S";
    roadContact = "광대로접함 (수영강변변도 및 해운대 해변로 교차로)";
    slope = "평지";
    estMinSqm = 35000000;
    estMaxSqm = 42000000;
    cautions.push("해안가 초고층 주상복합 지구단위 정비 구역에 저촉되어 있으며, 강한 해상 태풍에 대한 소파 영향 구조 설계 보강 여부가 필요합니다.");
    cautions.push("집합토지 지분권 등기가 대지권 등기로 완비 수렴되어 있는지 개별 가구 전유 등기부 표제부를 열람하십시오.");
  } else if (isJeju) {
    roadAddress = "제주특별자치도 제주시 공항로 2 (용담이동)";
    jibunAddress = "제주특별자치도 제주시 용담이동 2002";
    landType = "잡 (잡종지)";
    areaSqm = 89000;
    officialPricePerSqm = 3200000;
    ownershipType = "국공유지 (국토교통부 소유)";
    usageZone = "자연녹지지역";
    buildingCoverageLimit = "20% 이하";
    floorAreaRatioLimit = "80% 이하";
    hasBuilding = true;
    buildingType = "항공여객 및 수송복합시설 (제주국제공항 여객터미널)";
    totalFloorAreaSqm = 115000;
    storeys = "지상 4층 / 지하 1층";
    roiGrade = "A";
    roadContact = "광대로1류(폭 70M 이상) 접함";
    slope = "평지";
    estMinSqm = 8500000;
    estMaxSqm = 11000000;
    cautions.push("제주공항 활주로 및 터미널 권역에 대한 보안 보호법 및 고도제한구역(수평표면구역 반경 4,000M 저촉)에 걸려 있어 비행 안전 고도 이상의 건축물 신축은 절대 불가능합니다.");
    cautions.push("제주특별자치도 설치 특별법에 따른 경관보존지구 4·5등급 저촉 범위와 지하수자원 보호 지구 관련 배출 시설 규제 한계를 엄수 진단 신청하십시오.");
  } else if (isGangneung) {
    roadAddress = "강원특별자치도 강릉시 경포로 365 (안현동)";
    jibunAddress = "강원특별자치도 강릉시 안현동 94-1";
    landType = "대 (대지)";
    areaSqm = 950;
    officialPricePerSqm = 1850000;
    ownershipType = "개인 (공동소유)";
    usageZone = "일반상업지역";
    buildingCoverageLimit = "70% 이하";
    floorAreaRatioLimit = "400% 이하";
    hasBuilding = false;
    buildingType = "나대지 (미건축 상업 필지)";
    totalFloorAreaSqm = 0;
    storeys = "없음";
    roiGrade = "C";
    roadContact = "소로접함 (폭 8M 안현로 간선도로 대비)";
    slope = "평지";
    estMinSqm = 4200000;
    estMaxSqm = 5500000;
    cautions.push("안현동 상업용 나대지로 숙박 시설이나 콘도 건축이 주가 될 것이나, 경포 도립공원 및 수변경관 수변정비 한계법에 저촉되어 높이 제한이나 자연보존 경관 심의가 가미될 수 있습니다.");
    cautions.push("강릉 동해안 지반 사지 특유의 수분 침투 연약 기층 여부를 현장 보링 테스트를 거쳐 진단할 필요가 있습니다.");
  } else if (isBaegot191) {
    roadAddress = "경기도 시흥시 배곧5로 28 (배곧동)";
    jibunAddress = "경기도 시흥시 배곧동 191";
    landType = "체 (체육용지)";
    areaSqm = 28247;
    officialPricePerSqm = 1515000;
    ownershipType = "지자체 소유 (시흥시)";
    usageZone = "준주거지역";
    buildingCoverageLimit = "60% 이하";
    floorAreaRatioLimit = "400% 이하";
    hasBuilding = false;
    buildingType = "나대지 (체육시설 예정지 / 공용운동장)";
    totalFloorAreaSqm = 0;
    storeys = "없음";
    roiGrade = "A";
    roadContact = "대로접함 (배곧5로 및 서해안로 인접)";
    slope = "평지";
    estMinSqm = 4500000;
    estMaxSqm = 5800000;
    cautions.push("본 필지는 시흥시 소유의 공공 체육시설용지로 개발 목적이 공익체육시설 및 관련 복합문화시설로 한정되어 있어, 민간의 단독 주택이나 근린생활시설 등의 개별 허가는 극히 제한됩니다.");
    cautions.push("배곧신도시 지구단위계획 및 특별계획구역 건축 가이드라인 제한사항을 시흥시청 도시균형개발과 및 체육진흥과를 통해 교차 검증하십시오.");
  } else if (isKwangwoon) {
    let houseNumber = "85-1";
    const kwangwoonMatch = address.match(/월계동\s*([0-9\-]+)/);
    if (kwangwoonMatch && kwangwoonMatch[1]) {
      houseNumber = kwangwoonMatch[1];
    }
    roadAddress = "서울특별시 노원구 광운로 20 (월계동)";
    jibunAddress = `서울특별시 노원구 월계동 ${houseNumber} (광운대학교 인근)`;
    landType = "대 (대지)";
    areaSqm = 420;
    officialPricePerSqm = 8200000;
    ownershipType = "개인 (단독소유)";
    usageZone = "제3종일반주거지역";
    buildingCoverageLimit = "50% 이하";
    floorAreaRatioLimit = "250% 이하";
    hasBuilding = true;
    buildingType = "다가구주택 및 대학생 다세대 원룸 (총 12가구)";
    totalFloorAreaSqm = 680;
    storeys = "지상 4층 / 지하 1층";
    roiGrade = "A";
    roadContact = "소로2류(폭 8M-10M) 접함";
    slope = "평지";
    estMinSqm = 18000000;
    estMaxSqm = 22000000;
    cautions.push("광운대역 역세권 개발 사업 호재 영향권으로 미래 지가 상승 유망하나, 인근 대학 환경 보호에 의한 일조 제한 사안 확인이 요망됩니다.");
  } else {
    // Generate dynamic values based on the address components
    roadAddress = address;
    jibunAddress = address;
    const isSeoul = address.includes("서울") || address.includes("경기");
    officialPricePerSqm = isSeoul ? 6200000 : 1300000;
    areaSqm = 310;
    usageZone = isSeoul ? "제2종일반주거지역" : "제1종일반주거지역";
    buildingCoverageLimit = "60% 이하";
    floorAreaRatioLimit = isSeoul ? "200% 이하" : "150% 이하";
    hasBuilding = true;
    buildingType = "제1종근린생활시설 및 다세대주택";
    totalFloorAreaSqm = 450;
    storeys = "지상 3층";
    roiGrade = "B";
    roadContact = "소로3류(폭 8M 미만) 접함";
    slope = "평지";
    estMinSqm = officialPricePerSqm * 2.3;
    estMaxSqm = officialPricePerSqm * 3.1;
    cautions.push("지방세 체납 압류 사실 등 특별한 소유 등기 리스크를 등기부등본 갑구/을구를 열람하여 최종 비교하십시오.");
  }

  let coord = { x: "127.0276", y: "37.4980" }; // Default Seoul/Gangnam area coord
  if (isGangnam) {
    coord = { x: "127.0371", y: "37.5006" };
  } else if (isBusan) {
    coord = { x: "129.1601", y: "35.1558" };
  } else if (isJeju) {
    coord = { x: "126.4930", y: "33.5113" };
  } else if (isGangneung) {
    coord = { x: "128.8961", y: "37.7518" };
  } else if (isKwangwoon) {
    coord = { x: "127.0620", y: "37.6223" };
  } else if (isBaegot191) {
    coord = { x: "126.7214", y: "37.3752" };
  }

  const areaPyung = Math.round(areaSqm * 0.3025 * 10) / 10;
  const officialPricePerPyung = Math.round(officialPricePerSqm * 3.3058);
  const estimatedPriceMinPyung = Math.round(estMinSqm * 3.3058);
  const estimatedPriceMaxPyung = Math.round(estMaxSqm * 3.3058);

  const mapLinks = {
    vworldCadastral: `https://map.vworld.kr/map/maps.do?xmin=${Number(coord.x)-0.01}&ymin=${Number(coord.y)-0.01}&xmax=${Number(coord.x)+0.01}&ymax=${Number(coord.y)+0.01}&basemap=graphic_map&layers=vworld_landregistered`,
    nsdiPortal: `http://realtyprice.kr`,
    seoulRealEstate: `http://land.seoul.go.kr`,
    landLawInformation: `https://www.easylaw.go.kr`
  };

  return {
    address: {
      roadAddress,
      jibunAddress
    },
    basicInfo: {
      landType,
      areaSqm,
      areaPyung,
      officialPricePerSqm,
      officialPricePerPyung,
      ownershipType
    },
    zoningAndPlans: {
      usageZone,
      usageDistrict: "없음",
      usageArea: "없음",
      otherLaws: "가축사육제한구역, 교육환경보호구역",
      buildingCoverageLimit,
      floorAreaRatioLimit
    },
    landRestrictions: {
      landTransactionPermission: "해당사항 없음",
      actionRestrictions: [
        "지방자치단체 조례에 의거 규정 건폐율 한도 준수",
        "일조권 확보를 위한 북측 인접 대지 경계 조건 이격 확보 필수",
        "주거 필지에 따른 주차대수 확보 기준 만족 준용 필요"
      ],
      summary: "본 필지는 행위제한 상의 기형적 요인이 없는 주거형 입지 토지입니다. 계약 집행 단계 전에 지반 상태 및 조례를 관할 행정청 도시계획과 자문 후 개시하십시오."
    },
    buildingInfo: {
      hasBuilding,
      buildingType,
      structure: hasBuilding ? "철근콘크리트구조" : "없음",
      totalFloorAreaSqm,
      storeys,
      approvalDate: hasBuilding ? "2015-11-04" : "없음"
    },
    aiAnalysis: {
      roiGrade,
      roadContact,
      slope,
      recommendedUses: hasBuilding 
        ? ["기존 노후 가구 리모델링 증축", "상가 및 근린 시설로 용도 변경 임대화", "1층 전용 주차장 배정"] 
        : ["상가주택 다가구 건물 신설", "개인 단독 고급 주택지 조성", "유료 무인 주차장 공간 임대"],
      evaluationText: `해당 좌표 필지(${roadAddress})는 입지 순환 패턴이 안정적인 준수한 가치를 내포하고 있습니다. 도심 정주성과 및 인접 수요가 풍부해 공시지가 대비 2배 이상의 자산 가치를 완만히 상회하는 매개체입니다.`
    },
    marketValue: {
      estimatedPriceMinSqm: estMinSqm,
      estimatedPriceMaxSqm: estMaxSqm,
      estimatedPriceMinPyung,
      estimatedPriceMaxPyung,
      marketAnalysis: `인근 최근 유사 대지 실거래가 및 낙찰 통계를 감안할 때 m²당 한화 최소 ${Math.round(estMinSqm / 10000) * 10000}원 ~ 최고 ${Math.round(estMaxSqm / 10000) * 10000}원 수준으로 시세 범위가 공고히 형성되어 지속 거래 중인 것으로 수렴됩니다.`
    },
    historicalOfficialPrices: [
      { year: 2026, pricePerSqm: Math.round(officialPricePerSqm * 1.05) },
      { year: 2025, pricePerSqm: officialPricePerSqm },
      { year: 2024, pricePerSqm: Math.round(officialPricePerSqm * 0.94) },
      { year: 2023, pricePerSqm: Math.round(officialPricePerSqm * 0.88) }
    ],
    cautions,
    isFallbackSimulation: true,
    coord,
    mapLinks
  } as any;
}
