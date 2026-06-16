import { LandPropertyReport } from "./types";

export async function runClientSideRealtimeSearch(
  queryAddress: string,
  clientGeminiKey: string,
  clientVworldKey: string
): Promise<LandPropertyReport> {
  if (!clientGeminiKey || !clientGeminiKey.trim()) {
    throw new Error(
      "Gemini API 키 미등록: 실시간 AI 분석 보고서를 작성하려면 우측 상단 'API 연동 설정' 메뉴에서 개인 Gemini API 키를 활성화하고 시도해 주십시오. (가짜 세부 예비/샘플 데이터 기능은 비활성화되었습니다.)"
    );
  }

  // 1. Geolocate via Vworld
  let vworldData: any = null;
  if (clientVworldKey && clientVworldKey.trim()) {
    try {
      const apiKeyClean = clientVworldKey.trim();
      let url = `https://api.vworld.kr/req/address?service=address&request=getcoord&key=${apiKeyClean}&address=${encodeURIComponent(
        queryAddress
      )}&type=PARCEL&crs=EPSG:4326`;
      let res = await fetch(url);
      let json = await res.json();

      if (json?.response?.status !== "OK" || !json?.response?.result?.point) {
        url = `https://api.vworld.kr/req/address?service=address&request=getcoord&key=${apiKeyClean}&address=${encodeURIComponent(
          queryAddress
        )}&type=ROAD&crs=EPSG:4326`;
        res = await fetch(url);
        json = await res.json();
      }

      if (json?.response?.status === "OK" && json?.response?.result?.point) {
        const { x, y } = json.response.result.point;
        const refinedAddress = json.response.result.refined || queryAddress;

        const dataUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_UQ111&key=${apiKeyClean}&geomFilter=POINT(${x} ${y})&crs=EPSG:4326`;
        const dataRes = await fetch(dataUrl);
        const dataJson = await dataRes.json();

        if (
          dataJson?.response?.status === "OK" &&
          dataJson?.response?.result?.featureCollection?.features?.length
        ) {
          const feature = dataJson.response.result.featureCollection.features[0];
          const props = feature.properties || {};
          vworldData = {
            coord: { x, y },
            refinedAddress,
            jibun: props.jibun || props.jibun_val || "",
            jimo: props.jimo || props.jimo_nm || props.jimo_val || "",
            areaSqm: parseFloat(props.a2 || props.area || props.a5 || props.a2_val) || null,
          };
        } else {
          vworldData = {
            coord: { x, y },
            refinedAddress,
            jibun: "",
            jimo: "",
            areaSqm: null,
          };
        }
      }
    } catch (ve) {
      console.warn("Client-side direct Vworld geolocating failed, proceeding without geo-data:", ve);
    }
  }

  // 2. Compile Real-Time Prompt with Vworld Context if found
  let vworldInstructions = "";
  if (vworldData) {
    vworldInstructions = `\n[실시간 국토교통부 브이월드 피드백 정착 데이터]\n- 공식 주소: ${vworldData.refinedAddress}\n- 지번: ${vworldData.jibun || "지정되지 않음"}\n- 공부상 지목형식: ${vworldData.jimo || "확인중"}\n- 실 공부 지적 넒이(면적): ${vworldData.areaSqm ? vworldData.areaSqm + " m²" : "알수없음"}\n이 값은 인공지능 상정 가상치와 혼재되지 않도록 최우선적으로 스키마 basicInfo 면적과 지목 등에 100% 매핑하여 기입하십시오.`;
  }

  const prompt = `대한민국 주소 또는 장소명: "${queryAddress}"
위 주소지 또는 시설물 필지에 대한 지목(예: 대, 전, 답, 임야), 토지 면적(m² 및 평), 최근 3~4개년 공시지가 추이(원/m²), 국토계획법상 용도지역(예: 제3종일반주거지역, 준주거지역, 자연녹지지역 등), 행위제한 및 건축제한 규제(건폐율/용적률 법정 제한), 건축물대장 정보(건물 유무, 구조, 연면적, 층수, 승인일), 주위 시세/실거래 추이를 조사분석하여 아래 지정 구성에 도식화된 JSON 형태로 변환해 주십시오.${vworldInstructions}

출력 구조:
{
  "address": {
    "roadAddress": "발굴된 정밀 도로명 주소",
    "jibunAddress": "발굴된 지번 주소"
  },
  "basicInfo": {
    "landType": "지목 (예: 대지, 전, 답, 임야, 잡종지 등)",
    "areaSqm": 면적_숫자,
    "areaPyung": 평수_숫자(areaSqm * 0.3025),
    "officialPricePerSqm": 최근_연차_공시지가_m2당_원_숫자,
    "officialPricePerPyung": 최근_연차_평당_공시지가_숫자(officialPricePerSqm * 3.3058),
    "ownershipType": "소유구분 (예: 개인 단독소유, 국공유지, 법인 등)"
  },
  "zoningAndPlans": {
    "usageZone": "용도지역 (예: 제2종일반주거지역, 준주거지역 등)",
    "usageDistrict": "용도지구 (예: 방화지구, 없으면 '없음')",
    "usageArea": "용도구역 (예: 개발제한구역, 없으면 '없음')",
    "otherLaws": "상대보호구역, 가축사육제한구역 등 규제내용",
    "buildingCoverageLimit": "해당지역 법정 건폐율 한도 (예: '60% 이하')",
    "floorAreaRatioLimit": "해당지역 법정 용적률 한도 (예: '250% 이하')"
  },
  "landRestrictions": {
    "landTransactionPermission": "토지거래허가구역 계약 대상 여부 ('대상' 또는 '해당사항 없음')",
    "actionRestrictions": ["구체적인 금지 행위 및 증축 행위제한 사항 리스트"],
    "summary": "법적 특이지역 행위 및 고도제한 핵심 요약"
  },
  "buildingInfo": {
    "hasBuilding": 건물존재여부_true_또는_false,
    "buildingType": "건물의 주용도 (없으면 '나대지')",
    "structure": "건축 구조 (철근콘크리트, 연와조, 없으면 '없음')",
    "totalFloorAreaSqm": 건물 연면적_숫자,
    "storeys": "층수 정보 (예: 지상 4층 / 지하 1층 등, 없으면 '없음')",
    "approvalDate": "사용승인년월일 (예: 2015-11-04, 없으면 '없음')"
  },
  "aiAnalysis": {
    "roiGrade": "종합 등급: S, A, B, C, D 중 선택",
    "roadContact": "도로접면현황 설명",
    "slope": "경사 요인 (평지, 완경사, 급경사 등)",
    "recommendedUses": ["추천 개발 방향 및 이익증대 방안 리스트"],
    "evaluationText": "세부 종합 부동산 자산 평가 분석 정보 요약문"
  },
  "marketValue": {
    "estimatedPriceMinSqm": 최저 추전시세 원/m2 숫자,
    "estimatedPriceMaxSqm": 최고 추천시세 원/m2 숫자,
    "estimatedPriceMinPyung": 최저시평당_숫자,
    "estimatedPriceMaxPyung": 최고시평당_숫자,
    "marketAnalysis": "주변 시세 흐름 및 거래 현황"
  },
  "historicalOfficialPrices": [
    { "year": 2026, "pricePerSqm": 2026년공시지가_m2_숫자 },
    { "year": 2025, "pricePerSqm": 2025년공시지가_m2_숫자 },
    { "year": 2024, "pricePerSqm": 2024년공시지가_m2_숫자 }
  ],
  "cautions": [
    "매수 및 개발 시 확인해야 할 필수 인허가 구비사항 및 특별 경고 지점"
  ]
}

주의: 오직 하나의 단일 마크다운 비포함 순수 JSON으로만 출력하십시오. {로 시작하여 }로 끝나야 합니다.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientGeminiKey.trim()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`자체 실시간 Gemini 분석 도중 오류가 발생했습니다: ${errBody}`);
  }

  const resultJson = await response.json();
  const rawText = resultJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Gemini에서 유효한 실시간 주소분석 답변을 전송받지 못했습니다.");
  }

  try {
    const data = JSON.parse(rawText.trim());
    if (vworldData && vworldData.coord) {
      data.coord = vworldData.coord;
    } else {
      data.coord = { x: "127.0276", y: "37.4980" };
    }

    const encodeAddr = encodeURIComponent(queryAddress);
    data.mapLinks = {
      vworldCadastral: `https://map.vworld.kr/map/maps.do?basemap=graphic_map&layers=vworld_landregistered&q=${encodeAddr}`,
      nsdiPortal: "http://realtyprice.kr",
      seoulRealEstate: "http://land.seoul.go.kr",
      landLawInformation: "https://www.easylaw.go.kr",
    };

    return data as LandPropertyReport;
  } catch (pe) {
    console.error("Client parsing structured json failed:", pe, rawText);
    throw new Error(
      "Gemini 실시간 분석 데이터의 형식이 올바르지 않습니다. 다시 시도해 주십시오."
    );
  }
}
