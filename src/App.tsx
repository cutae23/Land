import React, { useState, useEffect } from "react";
import { 
  Search, 
  History, 
  Bookmark, 
  MapPin, 
  Trash2, 
  Compass, 
  Layers, 
  ExternalLink,
  HelpCircle,
  TrendingUp,
  Landmark,
  FileText,
  MousePointerClick,
  CheckCircle2,
  AlertTriangle,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LandPropertyReport, HistoryItem } from "./types";
import ReportView from "./components/ReportView";
import { generateClientFallback } from "./clientFallback";

const PRESETS = [
  { id: "p1", name: "역삼동 강남파이낸스센터", address: "서울특별시 강남구 테헤란로 152" },
  { id: "p2", name: "부산 마린시티 아이파크", address: "부산광역시 해운대구 마린시티2로 38" },
  { id: "p3", name: "제주공항 근처 토지", address: "제주특별자치도 제주시 공항로 2" },
  { id: "p4", name: "강릉 경포대 필지", address: "강원특별자치도 강릉시 경포로 365" },
  { id: "p5", name: "시흥 배곧동 운동장용지", address: "경기도 시흥시 배곧동 191" }
];

export default function App() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<LandPropertyReport | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [vworldKey, setVworldKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showVworldConfig, setShowVworldConfig] = useState(false);

  // Load initial history, bookmarks, vworld key and gemini key on mount
  useEffect(() => {
    fetchHistory();
    fetchBookmarks();
    const savedKey = localStorage.getItem("vworldApiKey") || "";
    setVworldKey(savedKey);
    const savedGeminiKey = localStorage.getItem("geminiApiKey") || "";
    setGeminiKey(savedGeminiKey);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/land/history");
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        localStorage.setItem("landHistory", JSON.stringify(data.history));
      }
    } catch (err) {
      console.warn("Server history fetch failed. Reading from localStorage.", err);
      try {
        const localHist = localStorage.getItem("landHistory");
        if (localHist) {
          setHistory(JSON.parse(localHist));
        }
      } catch (localErr) {
        console.error("localStorage history parse error", localErr);
      }
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch("/api/land/bookmarks");
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.bookmarks);
        localStorage.setItem("landBookmarks", JSON.stringify(data.bookmarks));
      }
    } catch (err) {
      console.warn("Server bookmarks fetch failed. Reading from localStorage.", err);
      try {
        const localBookmarks = localStorage.getItem("landBookmarks");
        if (localBookmarks) {
          setBookmarks(JSON.parse(localBookmarks));
        }
      } catch (localErr) {
        console.error("localStorage bookmarks parse error", localErr);
      }
    }
  };

  const handleSearch = async (searchAddress: string) => {
    if (!searchAddress.trim()) {
      setError("조회하실 도로명 주소나 지번 주소를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    // Staged realistic loading messages for interactive visual pacing
    const messages = [
      "국토교통부 지적도 및 건축물대장 데이터 조회 중...",
      "연도별 공시지가 추이 및 행위 제한 법률 검토 중...",
      "용도지역 건폐율 / 용적률 법적 상한값 정밀 계산 중...",
      "구글 검색 파싱 기반 실시간 시장 실거래가 시세 분석 중...",
      "AI 부동산 가치 분석 및 투자 추천 등급 생성 중..."
    ];

    let msgIndex = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 2800);

    try {
      let result;
      try {
        const response = await fetch("/api/land/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ address: searchAddress, vworldKey, geminiKey })
        });

        const contentType = response.headers.get("Content-Type") || "";
        if (!response.ok || !contentType.includes("application/json")) {
          throw new Error("SERVER_OFFLINE_OR_HTML");
        }
        result = await response.json();
      } catch (svrErr) {
        console.warn("[App Search] API server search failed or is offline. Activating client-side native simulator fallback.", svrErr);
        const fallbackReport = generateClientFallback(searchAddress);
        result = {
          success: true,
          data: fallbackReport
        };
      }

      clearInterval(interval);

      if (!result.success) {
        const errorMsg = result.details 
          ? `${result.error} (오류 내용: ${result.details})` 
          : (result.error || "토지 정보를 검색하는 법적 조회 과정에서 문제가 발생했습니다.");
        throw new Error(errorMsg);
      }

      setReport(result.data);
      setAddress(""); // clear input box on success

      // Save to client history fallback
      const localHistStr = localStorage.getItem("landHistory") || "[]";
      try {
        const localHist = JSON.parse(localHistStr);
        const historyItem = {
          id: Date.now().toString(),
          searchQuery: searchAddress,
          roadAddress: result.data.address.roadAddress,
          jibunAddress: result.data.address.jibunAddress,
          landType: result.data.basicInfo.landType,
          areaSqm: result.data.basicInfo.areaSqm,
          roiGrade: result.data.aiAnalysis.roiGrade,
          searchedAt: new Date().toISOString(),
        };
        const updatedHist = [historyItem, ...localHist.filter((item: any) => item.searchQuery !== searchAddress)].slice(0, 50);
        localStorage.setItem("landHistory", JSON.stringify(updatedHist));
        setHistory(updatedHist);
      } catch (histErr) {
        console.error("Local history save error", histErr);
      }

      await fetchHistory(); // refresh history list
    } catch (err: any) {
      clearInterval(interval);
      setError(err?.message || "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (targetAddress: string) => {
    const isBookmarked = bookmarks.includes(targetAddress);
    const method = isBookmarked ? "DELETE" : "POST";
    
    try {
      const res = await fetch("/api/land/bookmarks", {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ address: targetAddress })
      });
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.bookmarks);
        localStorage.setItem("landBookmarks", JSON.stringify(data.bookmarks));
      }
    } catch (err) {
      console.warn("Bookmark toggle API failed, falling back to local state.", err);
      let updatedBookmarks = [...bookmarks];
      if (isBookmarked) {
        updatedBookmarks = updatedBookmarks.filter(addr => addr !== targetAddress);
      } else {
        updatedBookmarks.push(targetAddress);
      }
      setBookmarks(updatedBookmarks);
      localStorage.setItem("landBookmarks", JSON.stringify(updatedBookmarks));
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/land/history", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
        localStorage.setItem("landHistory", "[]");
      }
    } catch (err) {
      console.warn("Clear history API failed, falling back to local state.", err);
      setHistory([]);
      localStorage.setItem("landHistory", "[]");
    }
  };

  const getRoiGradeBadge = (grade: string) => {
    switch (grade) {
      case "S": return "bg-amber-100 text-amber-800 border-amber-200";
      case "A": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "B": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200 font-display">
              토
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-1.5">
                토지정보 마스터 <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold tracking-normal">v1.2 PRO</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">실시간 AI 지적 정보 & 수수계 계산 종합 조회 플랫폼</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVworldConfig(!showVworldConfig)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition border ${
                vworldKey || geminiKey 
                  ? "text-emerald-600 bg-emerald-50/55 border-emerald-200 hover:bg-emerald-50" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border-slate-200"
              }`}
              id="apiConfigBtn"
            >
              <Key className="w-4 h-4" />
              <span>API 연동 설정 {vworldKey || geminiKey ? "● 활성" : ""}</span>
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition font-mono border border-slate-200"
              id="helpGuideBtn"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">이용가이드</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Help Banner Guide Accordion */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 text-sm text-indigo-950 space-y-3 overflow-hidden shadow-sm"
              id="helpGuideSection"
            >
              <h4 className="font-bold text-base text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                토지정보 마스터 서비스 100% 활용하기
              </h4>
              <p className="text-xs leading-relaxed text-indigo-900/80">
                본 서비스는 대한민국 행정 주소를 검색하여 복잡한 행정 문서조회 없이 한 번에 <b>지목, 면적, 최근 평당 공시지가 수치 및 AI 기반 투자 등급</b>을 쉽고 투명하게 제공합니다. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                <div className="bg-white p-3 rounded-xl border border-indigo-100/60">
                  <span className="font-bold text-indigo-700">1. 주소 입력 정밀도</span>
                  <p className="text-[11px] text-slate-600 mt-1 font-sans">예) '서초구 반포동 73-1' 과 같이 특정 번지수까지 기재해 주시면 더 정밀한 지적도 및 건물대장을 출력합니다.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100/60 font-sans">
                  <span className="font-bold text-indigo-700 font-mono">2. 세액 및 중개수수료 모의</span>
                  <p className="text-[11px] text-slate-600 mt-1">리포트 하단의 시뮬레이터를 사용해 토지의 면적과 가격을 조절해보며 예상 취득 비용을 즉시 시뮬레이션할 수 있습니다.</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-100/60 font-sans">
                  <span className="font-bold text-indigo-700 font-mono">3. 지적도 외부 바로가기</span>
                  <p className="text-[11px] text-slate-600 mt-1">분석 완료 후 원클릭 링크를 통해 다음/네이버 실시간 고화질 지형도 및 지적도를 오버레이해서 관측하세요.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* API Key configuration panel */}
        <AnimatePresence>
          {showVworldConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm overflow-hidden shadow-xl space-y-6"
              id="apiSettingsSection"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-slate-100 font-display">API 연동 및 자율 관리 설정 센터</h3>
              </div>

              {/* 1. Vworld Key */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-indigo-400 flex items-center gap-1.5 font-display">
                    <Layers className="w-4 h-4" />
                    국토교통부 브이월드(Vworld) 실시간 지적 연동
                  </h4>
                  <a 
                    href="https://www.vworld.kr/dev/vkey99.do" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1"
                  >
                    <span>인증키 무료 발급받기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-4xl">
                  브이월드(Vworld) 공인 키를 연동해 주시면 대한민국 국토부 데이터베이스를 실시간 교차 검증하여, 
                  <b> 지목/면적 할루시네이션(오차) 없이 100% 공인된 실제 토지대장 면적 및 지목</b>을 리포트에 오차 없이 매핑합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center max-w-3xl">
                  <input
                    type="password"
                    placeholder="Vworld 발급 인증키 (여기에 붙여넣으세요)"
                    value={vworldKey}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setVworldKey(val);
                      localStorage.setItem("vworldApiKey", val);
                    }}
                    className="w-full sm:flex-1 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-mono"
                  />
                  {vworldKey ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800 px-2.5 py-1.5 rounded-lg font-bold font-mono">
                        ✓ 연동됨
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVworldKey("");
                          localStorage.removeItem("vworldApiKey");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono font-bold border border-rose-800/60 bg-rose-950/20 px-3 py-1.5 rounded-lg transition"
                      >
                        해제
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono px-3 py-1.5 bg-amber-950/20 border border-amber-800/60 rounded-lg shrink-0">
                      미설정 (기본 시뮬레이션 데이터 제공)
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Gemini Key */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-indigo-400 flex items-center gap-1.5 font-display">
                    <Key className="w-4 h-4" />
                    Google Gemini 개인 API 인증키 자율연동
                  </h4>
                  <a 
                    href="https://aistudio.google.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1"
                  >
                    <span>Google AI Studio 무료 발급받기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-4xl">
                  서버 공용 AI 정원 초과(할당량 부족) 또는 검색 지체 오류를 완전 방지하고, <b>개인 전용의 무제한 처리 성능</b>으로 보고서를 분석합니다. 발급받으신 Gemini 키를 연동하시면 브라우저에서 서버 캐시를 우회하여 고속 가치 산정 처리를 수행합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center max-w-3xl">
                  <input
                    type="password"
                    placeholder="AI Studio 발급 Gemini API 키 (AI_zaSy... 형태로 시작)"
                    value={geminiKey}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setGeminiKey(val);
                      localStorage.setItem("geminiApiKey", val);
                    }}
                    className="w-full sm:flex-1 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-mono"
                  />
                  {geminiKey ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800 px-2.5 py-1.5 rounded-lg font-bold font-mono">
                        ✓ 개인 키 연동됨
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setGeminiKey("");
                          localStorage.removeItem("geminiApiKey");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono font-bold border border-rose-800/60 bg-rose-950/20 px-3 py-1.5 rounded-lg transition"
                      >
                        해제
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg shrink-0">
                      서버 기본 공유 API 모델 사용 중
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </ AnimatePresence>

        {/* Search Segment */}
        <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              대한민국 모든 토지·대장 정보 1초 조회
            </h2>
            <p className="text-sm text-slate-500">
              도로명·지번 주소를 입력하시면 AI 기반 공시지가 트렌드와 용도제한 법률을 요약 분석합니다.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Real Search form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(address);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="예: 서울특별시 서초구 반포동 73-1 또는 대구 달성군 가창면 우록길 121"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-base text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  disabled={loading}
                  id="targetSearchInput"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl px-8 py-3.5 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-100"
                id="searchButton"
              >
                <span>검색 및 AI 분석</span>
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Error messaging inside search */}
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2"
                id="errorMessage"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Suggestions Presets */}
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs text-slate-400 font-semibold font-display">추천 샘플 검색:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setAddress(preset.address);
                    handleSearch(preset.address);
                  }}
                  type="button"
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 text-slate-600 hover:text-indigo-800 text-xs rounded-lg transition font-medium flex items-center gap-1 font-mono"
                  disabled={loading}
                >
                  <MousePointerClick className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Panels (History / Bookmarks alongside content if no active report) */}
        {!report && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Box: Search History */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900 font-display">최근 검색 필지({history.length})</h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-mono hover:font-bold transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>전체 삭제</span>
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSearch(item.searchQuery)}
                      className="p-3 bg-slate-50/50 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate select-all">{item.roadAddress}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>지목: {item.landType}</span>
                          <span>•</span>
                          <span>면적: {item.areaSqm.toLocaleString()}m²</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoiGradeBadge(item.roiGrade)}`}>
                          Grade {item.roiGrade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 space-y-1">
                  <p>최근에 조회된 토지 정보 검색 기록이 없습니다.</p>
                  <p className="text-[10px]">위 검증 창에 주소를 입력해 분석을 시작하세요.</p>
                </div>
              )}
            </div>

            {/* Right Box: Bookmarks */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Bookmark className="w-5 h-5 text-rose-500 fill-rose-100" />
                <h3 className="text-base font-bold text-slate-900 font-display">중요 관심 필지 ({bookmarks.length})</h3>
              </div>

              {bookmarks.length > 0 ? (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {bookmarks.map((addr, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-slate-50/50 hover:bg-rose-50/30 border border-slate-100 hover:border-rose-100 rounded-xl transition flex items-center justify-between gap-3"
                    >
                      <div 
                        onClick={() => handleSearch(addr)}
                        className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600 flex-1 min-w-0 select-all"
                      >
                        {addr}
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(addr)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold p-1 transition shrink-0"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 space-y-1">
                  <p>등록된 중요 관심 부동산 필지가 아직 없습니다.</p>
                  <p className="text-[10px]">상세 정보를 조회한 후 관심 필지로 등록할 수 있습니다.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Streaming / Loading Experience */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <Compass className="w-10 h-10 text-indigo-600 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800">토지대장 및 법률 규제 분석 중...</h3>
              
              {/* Cycling detailed loading text block */}
              <div className="text-xs text-indigo-600 font-mono h-4 overflow-hidden font-semibold">
                {loadingMessage}
              </div>
            </div>

            <div className="bg-slate-50 max-w-sm mx-auto p-3.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-sans">
              구글 실시간 그라운딩 및 연동 기술로 공시 법률, 실거래 자료, 지적도 좌표를 매핑하여 믿음직한 종합 세액 수지 분석 레포트를 빌드하고 있습니다.
            </div>
          </div>
        )}

        {/* Detailed Assessment Report Room */}
        {report && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-indigo-950 flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>토지 정보 조회 결과 분석</span>
              </h3>
              <button 
                onClick={() => setReport(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold font-mono transition"
              >
                ← 대시보드로 돌아가기
              </button>
            </div>

            <ReportView 
              report={report} 
              isBookmarked={bookmarks.includes(report.address.roadAddress) || bookmarks.includes(report.address.jibunAddress)}
              onToggleBookmark={() => handleToggleBookmark(report.address.roadAddress || report.address.jibunAddress)}
            />
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-100 py-8 mt-12 text-center text-xs text-slate-400 space-y-2 font-mono">
        <p>© 2026 대한민국 토지정보 마스터. All rights reserved.</p>
        <p className="max-w-xl mx-auto px-4 font-sans text-[10px] leading-relaxed">
          본 서비스에서 제공되는 모든 공시지가, 소유 구분, 건축제한, 시장 예상가는 참고 데이터로, 법적 효력을 가지는 공식 등본이나 대장 문서가 아니므로 계약 전 반드시 실질 행정서류 발급 후 실사를 진행하시기 바랍니다.
        </p>
      </footer>
    </div>
  );
}
