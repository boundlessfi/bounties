"use client";

import { getCountryDataList } from "countries-list";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BuilderCardSkeleton } from "@/components/cards/builder-card-skeleton";
import { Activity01Icon, CodeIcon, GlobeIcon } from "@/components/icons";
import { Section } from "@/components/marketing/section";

import { BuildersGrid } from "./builders-grid";
import { BuildersSortSelect } from "./builders-sort-select";
import { DiscoverToolbar } from "./discover-toolbar";
import {
  FilterRail,
  hasActiveFilters,
  type FilterSectionConfig,
  type FilterValue,
} from "./filter-rail";
import { FilterSheet } from "./filter-sheet";
import { StatsBanner } from "./stats-banner";
import {
  DEFAULT_BUILDER_SORT,
  isBuilderSort,
  useBuilderFilters,
  useBuilders,
  type BuilderSort,
  type BuildersQueryParams,
} from "./use-builders";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_PARAM = "q";

/**
 * The query string is the source of truth for everything that narrows the
 * list, so a filtered view can be linked, bookmarked, and walked back through
 * with the browser buttons. Defaults are left out to keep the URL readable.
 */
function readFilters(params: URLSearchParams): FilterValue {
  const country = params.get("country");
  const status = params.get("status");
  return {
    // Repeated `skills` params, matching what the endpoint accepts. Joining on
    // a comma would break any facet whose own label contains one.
    skills: params.getAll("skills"),
    country: country ? [country] : [],
    status: status ? [status] : [],
  };
}

function readPage(params: URLSearchParams): number {
  const raw = Number(params.get("page"));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

function readSort(params: URLSearchParams): BuilderSort {
  const raw = params.get("sort");
  return raw && isBuilderSort(raw) ? raw : DEFAULT_BUILDER_SORT;
}

function buildQuery(
  search: string,
  filters: FilterValue,
  page: number,
  sort: BuilderSort,
): string {
  const next = new URLSearchParams();
  if (search) next.set(SEARCH_PARAM, search);
  for (const skill of filters.skills ?? []) next.append("skills", skill);
  if (filters.country?.[0]) next.set("country", filters.country[0]);
  if (filters.status?.[0]) next.set("status", filters.status[0]);
  if (page > 1) next.set("page", String(page));
  if (sort !== DEFAULT_BUILDER_SORT) next.set("sort", sort);
  return next.toString();
}

const EMPTY_FILTERS: FilterValue = {
  skills: [],
  country: [],
  status: [],
};

/** ISO alpha-2 code -> country name, for friendlier facet labels. */
const COUNTRY_NAMES = new Map<string, string>(
  getCountryDataList().map((country) => [country.iso2, country.name]),
);

function countryLabel(code: string): string | undefined {
  return COUNTRY_NAMES.get(code.toUpperCase());
}

/**
 * The `/builders` directory. Owns the search, filter, sort, and page state and
 * feeds it to `useBuilders`, so the rail, the sheet, and the grid all read
 * from one source. `railOpen` drives the desktop sidebar toggle; `sheetOpen`
 * drives the mobile full-screen sheet, which renders the exact same
 * `FilterRail` instance configuration under a distinct `idPrefix`.
 */
export function BuildersView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get(SEARCH_PARAM) ?? "";
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const page = readPage(searchParams);
  const sort = readSort(searchParams);

  const [searchInput, setSearchInput] = useState(search);
  const [railOpen, setRailOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // The box is the one control not driven straight from the URL, because typing
  // has to stay off the network until the visitor pauses. `committed` remembers
  // the term this view last wrote, so a URL change we caused never clobbers what
  // is still being typed, while a back or forward navigation does resync the box.
  const [committed, setCommitted] = useState(search);
  const [lastUrlSearch, setLastUrlSearch] = useState(search);
  if (search !== lastUrlSearch) {
    setLastUrlSearch(search);
    if (search !== committed) {
      setCommitted(search);
      setSearchInput(search);
    }
  }

  const navigate = useCallback(
    (
      nextSearch: string,
      nextFilters: FilterValue,
      nextPage: number,
      mode: "push" | "replace",
      nextSort: BuilderSort = sort,
    ) => {
      const query = buildQuery(nextSearch, nextFilters, nextPage, nextSort);
      const href = query ? `/builders?${query}` : "/builders";
      // `scroll: false` so narrowing the list does not yank the page to the top.
      if (mode === "replace") router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [router, sort],
  );

  // Search uses replace so a debounced keystroke does not add a history entry.
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      setCommitted(trimmed);
      // Read the live query string rather than the values captured when this
      // timer was scheduled. Choosing a sort mid-debounce navigates, and the
      // captured copy would replace that fresh URL with a stale one, silently
      // reverting the sort. Everything except the term is carried through
      // exactly as it stands at fire time.
      const next = new URLSearchParams(window.location.search);
      if (trimmed) next.set(SEARCH_PARAM, trimmed);
      else next.delete(SEARCH_PARAM);
      // Narrowing the list invalidates the page number.
      next.delete("page");
      const query = next.toString();
      router.replace(query ? `/builders?${query}` : "/builders", {
        scroll: false,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, router]);

  const applyFilters = (next: FilterValue) => {
    navigate(search, next, 1, "push");
  };

  const applySort = (next: BuilderSort) => {
    navigate(search, filters, 1, "push", next);
  };

  const params = useMemo<BuildersQueryParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      // `GET /users/directory` takes a single value for these two, so their
      // rail sections are single-select radios. Only `skills` is repeatable.
      skills: filters.skills?.length ? filters.skills : undefined,
      country: filters.country?.[0],
      status: filters.status?.[0],
      sort,
    }),
    [page, search, filters, sort],
  );

  const { data, isError, isPending } = useBuilders(params);
  const {
    data: facets,
    isPending: facetsPending,
    isError: facetsError,
  } = useBuilderFilters();

  const filterSections = useMemo<FilterSectionConfig[]>(() => {
    if (!facets) return [];
    return [
      {
        group: "skills",
        selection: "multi",
        title: "Skills",
        icon: CodeIcon,
        kind: "facet",
        items: facets.skills,
      },
      {
        group: "country",
        selection: "single",
        title: "Country",
        icon: GlobeIcon,
        kind: "facet",
        items: facets.countries.map((item) => ({
          ...item,
          label: countryLabel(item.value) ?? item.value,
        })),
      },
      {
        group: "status",
        selection: "single",
        title: "Status",
        icon: Activity01Icon,
        kind: "enum",
        items: facets.statuses,
      },
    ];
  }, [facets]);

  const reset = () => {
    setCommitted("");
    setSearchInput("");
    navigate("", EMPTY_FILTERS, 1, "push");
  };

  // A shared link can name a page that no longer exists (the directory shrank,
  // or the filters narrowed it). Without this the grid shows its empty state and
  // the pagination is not rendered, so there is no way back.
  const totalPages = data?.pagination.totalPages ?? 0;
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      navigate(search, filters, totalPages, "replace");
    }
  }, [page, totalPages, search, filters, sort, navigate]);

  return (
    <Section className="pt-4 pb-16" innerClassName="flex flex-col gap-8">
      <StatsBanner
        title="Discover the people building what is next"
        subtitle="Meet the builders making an impact across the Boundless ecosystem."
      />

      <DiscoverToolbar
        filtersOpen={railOpen}
        onToggleFilters={() => setRailOpen((open) => !open)}
        onOpenMobileFilters={() => setSheetOpen(true)}
        filtersActive={hasActiveFilters(filters)}
        onReset={reset}
        query={searchInput}
        onQueryChange={setSearchInput}
        placeholder="Search builders, skills, or locations"
        sort={<BuildersSortSelect value={sort} onChange={applySort} />}
      />

      <div className="flex items-start gap-6">
        {railOpen ? (
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <FilterRail
              idPrefix="rail"
              sections={filterSections}
              value={filters}
              onChange={applyFilters}
              isPending={facetsPending}
              isError={facetsError}
            />
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <BuildersGrid
            data={data}
            isPending={isPending}
            isError={isError}
            isNarrowed={hasActiveFilters(filters) || search.length > 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={(next) => navigate(search, filters, next, "push")}
          />
        </div>
      </div>

      <FilterSheet open={sheetOpen} onOpenChange={setSheetOpen} onReset={reset}>
        <FilterRail
          idPrefix="sheet"
          sections={filterSections}
          value={filters}
          onChange={applyFilters}
          isPending={facetsPending}
          isError={facetsError}
        />
      </FilterSheet>
    </Section>
  );
}

/**
 * Prerendered stand-in for the view. `useSearchParams` opts everything below
 * its Suspense boundary out of prerendering, so without this the static HTML
 * for `/builders` is empty between the header and the footer.
 */
export function BuildersViewFallback() {
  return (
    <Section className="pt-4 pb-16" innerClassName="flex flex-col gap-8">
      <StatsBanner
        title="Discover the people building what is next"
        subtitle="Meet the builders making an impact across the Boundless ecosystem."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <BuilderCardSkeleton key={index} showStats={false} />
        ))}
      </div>
    </Section>
  );
}
