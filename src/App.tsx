import { useEffect, useState, useCallback } from 'react';
import {
  supabase,
  type University,
  type Course,
  type UniversityType,
} from '@/lib/supabase';
import {
  Search,
  MapPin,
  Building2,
  GraduationCap,
  ExternalLink,
  Calendar,
  Filter,
  X,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Wallet,
  Clock,
  ArrowLeft,
  SlidersHorizontal,
  CheckCircle2,
  Info,
} from 'lucide-react';

type Filters = {
  search: string;
  state: string;
  type: string;
  course: string;
};

const TYPE_LABELS: Record<UniversityType, string> = {
  federal: 'Federal',
  state: 'State',
  private: 'Private',
};

const TYPE_BADGE: Record<UniversityType, string> = {
  federal: 'bg-blue-50 text-blue-700 border-blue-200',
  state: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  private: 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatNaira(amount: number | null): string {
  if (amount == null) return 'N/A';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function App() {
  /* UniFinder Nigeria */
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, Course[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    state: '',
    type: '',
    course: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const [
        uniRes,
        courseRes,
      ] = await Promise.all([
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*'),
      ]);

      if (uniRes.error) {
        setError('Could not load universities. Please try again.');
        setLoading(false);
        return;
      }
      if (courseRes.error) {
        setError('Could not load course data. Please try again.');
        setLoading(false);
        return;
      }

      const unis = (uniRes.data as University[]) ?? [];
      const courses = (courseRes.data as Course[]) ?? [];

      setUniversities(unis);

      const map: Record<string, Course[]> = {};
      for (const c of courses) {
        if (!map[c.university_id]) map[c.university_id] = [];
        map[c.university_id].push(c);
      }
      setCourseMap(map);

      const stateSet = new Set(unis.map((u) => u.state));
      setStates(Array.from(stateSet).sort());

      const courseSet = new Set(courses.map((c) => c.name));
      setAllCourses(Array.from(courseSet).sort());

      setLoading(false);
    }
    load();
  }, []);

  const filtered = universities.filter((u) => {
    if (filters.state && u.state !== filters.state) return false;
    if (filters.type && u.type !== filters.type) return false;
    if (filters.course) {
      const courses = courseMap[u.id] ?? [];
      if (!courses.some((c) => c.name === filters.course)) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = (
        u.name +
        ' ' +
        (u.short_name ?? '') +
        ' ' +
        u.state +
        ' ' +
        (u.city ?? '')
      ).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const openDetail = useCallback((id: string) => {
    setSelectedId(id);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => {
    setView('detail');
    setView('home');
    setSelectedId(null);
  }, []);

  const activeFilterCount =
    (filters.state ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.course ? 1 : 0);

  const clearAllFilters = () =>
    setFilters({ search: '', state: '', type: '', course: '' });

  if (view === 'detail' && selectedId) {
    const uni = universities.find((u) => u.id === selectedId);
    if (uni) {
      return (
        <DetailView
          university={uni}
          courses={courseMap[uni.id] ?? []}
          onBack={goHome}
          onSelectOther={openDetail}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block font-bold text-slate-900 text-lg tracking-tight">
                UniFinder
              </span>
              <span className="block text-[11px] text-slate-500 font-medium -mt-0.5">
                Nigeria
              </span>
            </div>
          </button>
          <div className="hidden sm:flex items-center gap-1 text-sm text-slate-500">
            <Info className="w-4 h-4" />
            <span>{universities.length} universities</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(16,185,129,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(20,184,166,0.3) 0%, transparent 50%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {universities.length} universities · {allCourses.length} courses
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Find the right Nigerian university for you
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Search and compare universities across Nigeria by courses, location,
              estimated fees, and admission requirements — all in one place.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder="Search by university name, state, or city..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 shadow-xl border-0 focus:ring-2 focus:ring-emerald-400 outline-none text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {loading ? 'Loading…' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
            </h2>
            {activeFilterCount > 0 && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                Refine results
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FilterSelect
                label="State"
                value={filters.state}
                options={states}
                onChange={(v) => setFilters((f) => ({ ...f, state: v }))}
              />
              <FilterSelect
                label="University type"
                value={filters.type}
                options={['federal', 'state', 'private']}
                optionLabels={{ federal: 'Federal', state: 'State', private: 'Private' }}
                onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
              />
              <FilterSelect
                label="Course"
                value={filters.course}
                options={allCourses}
                onChange={(v) => setFilters((f) => ({ ...f, course: v }))}
              />
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.state && (
              <FilterChip
                label={`State: ${filters.state}`}
                onRemove={() => setFilters((f) => ({ ...f, state: '' }))}
              />
            )}
            {filters.type && (
              <FilterChip
                label={`Type: ${TYPE_LABELS[filters.type as UniversityType]}`}
                onRemove={() => setFilters((f) => ({ ...f, type: '' }))}
              />
            )}
            {filters.course && (
              <FilterChip
                label={`Course: ${filters.course}`}
                onRemove={() => setFilters((f) => ({ ...f, course: '' }))}
              />
            )}
          </div>
        )}

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No universities found
            </h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-emerald-600 font-medium text-sm hover:text-emerald-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((uni) => (
              <UniversityCard
                key={uni.id}
                university={uni}
                courses={courseMap[uni.id] ?? []}
                onClick={() => openDetail(uni.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Disclaimer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Verify all information with official sources
              </p>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Fees, admission requirements, and other details shown here are
                estimates for guidance only and may change. Always confirm
                current information directly with the university's official
                website before making decisions.
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            UniFinder Nigeria · Built to help students explore higher education options
          </p>
        </div>
      </footer>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none cursor-pointer"
        >
          <option value="">All {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {optionLabels ? optionLabels[opt] : opt}
            </option>
          ))}
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full hover:bg-emerald-100 flex items-center justify-center transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function UniversityCard({
  university: u,
  courses,
  onClick,
}: {
  university: University;
  courses: Course[];
  onClick: () => void;
}) {
  const featuredCourses = courses.slice(0, 4);
  const extraCount = courses.length - featuredCourses.length;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
            {u.name}
          </h3>
          {u.short_name && (
            <span className="text-xs font-medium text-slate-400">
              {u.short_name}
            </span>
          )}
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${TYPE_BADGE[u.type]}`}
        >
          {TYPE_LABELS[u.type]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {u.state}
        </span>
        {u.established_year && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Est. {u.established_year}
          </span>
        )}
      </div>

      {u.description && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">
          {u.description}
        </p>
      )}

      {featuredCourses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {featuredCourses.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600"
            >
              {c.name}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500">
              +{extraCount} more
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Verified {formatDate(u.last_verified)}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
          View details
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  );
}

function DetailView({
  university: u,
  courses,
  onBack,
  onSelectOther,
}: {
  university: University;
  courses: Course[];
  onBack: () => void;
  onSelectOther: (id: string) => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to results</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">
              UniFinder
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(16,185,129,0.5) 0%, transparent 50%)' }} />
          <div className="relative">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${TYPE_BADGE[u.type]} mb-4`}
            >
              {TYPE_LABELS[u.type]} University
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {u.name}
            </h1>
            {u.short_name && (
              <p className="text-emerald-300 font-medium mt-1">{u.short_name}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {u.city ? `${u.city}, ` : ''}{u.state}
              </span>
              {u.established_year && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Established {u.established_year}
                </span>
              )}
            </div>
            {u.website && (
              <a
                href={u.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit official website
              </a>
            )}
          </div>
        </div>

        {/* About */}
        {u.description && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              About
            </h2>
            <p className="text-slate-700 leading-relaxed">{u.description}</p>
          </div>
        )}

        {/* Courses */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Courses offered
            </h2>
            <span className="text-sm text-slate-400">
              ({courses.length})
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No course data available for this university yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {c.name}
                      </h3>
                      {c.degree && (
                        <span className="text-xs text-slate-500">{c.degree}</span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                    {c.duration_years && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {c.duration_years} year{c.duration_years === 1 ? '' : 's'}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-slate-400" />
                      {formatNaira(c.estimated_fee_ngn)}/yr
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Last verified */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Information last verified on {formatDate(u.last_verified)}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Verify with official sources
            </p>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
              Fees and admission requirements shown here are estimates for
              guidance only. Always confirm current details with the
              university's official website before applying.
            </p>
          </div>
        </div>
      </div>

      {/* Course detail modal */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          universityName={u.name}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* Keep onSelectOther referenced for future navigation */}
      <span className="hidden" onClick={() => onSelectOther(u.id)} />
    </div>
  );
}

function CourseModal({
  course: c,
  universityName,
  onClose,
}: {
  course: Course;
  universityName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
            <p className="text-sm text-slate-500">{universityName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {c.degree && (
            <InfoRow label="Degree" value={c.degree} />
          )}
          {c.duration_years && (
            <InfoRow
              label="Duration"
              value={`${c.duration_years} year${c.duration_years === 1 ? '' : 's'}`}
            />
          )}
          <InfoRow
            label="Estimated annual fee"
            value={formatNaira(c.estimated_fee_ngn)}
          />
          {c.admission_requirements && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Admission requirements
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {c.admission_requirements}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Course info last verified {formatDate(c.last_verified)}
          </div>
        </div>
        <div className="p-5 pt-0">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Fees and requirements are estimates. Verify with the university's
              official website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 text-right">
        {value}
      </span>
    </div>
  );
}
