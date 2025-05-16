export interface SearchResultItem {
  title: string;
  hid: string;
  md_covers: Array<{
    b2key: string;
  }>;
}

export enum MangaStatus {
  Ongoing = 1,
  Completed = 2,
  Cancelled = 3,
  Hiatus = 4
}

export interface MangaDetailsResponse {
  comic: {
    title: string;
    hid: string;

    status: MangaStatus;
    content_rating: 'safe' | 'suggestive' | 'erotica';
    desc: string;
    year: number;

    md_titles: Array<{
      title: string;
    }>;

    md_comic_md_genres: Array<{
      md_genres: {
        name: string;
      };
    }>;

    md_covers: Array<{
      b2key: string;
    }>;

    mu_comics?: {
      mu_comic_categories: Array<{
        mu_categories: {
          title: string;
          slug: string;
        };
      }>;
    };
  };

  artists: Array<{
    name: string;
    slug: string;
  }>;

  authors: Array<{
    name: string;
    slug: string;
  }>;
}

export interface ChapterDetailsResponse {
  chapters: Chapter[];
  total: number;
  limit: number;
}

interface Chapter {
  hid: string; // correlates to slug
  chap: string; // string version of chapter number
  title: string | null;
  created_at: string;
  md_chapters_groups: Array<{
    md_groups: {
      title: string;
    };
  }>;
}

export interface ChapterContentResponse {
  name: string;
  b2key: string;
}
